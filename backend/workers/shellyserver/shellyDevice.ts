/**
 * MIT License
 *
 * Copyright (c) 2025 Sander Veldhuis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { log } from 'glidelite';
import net from 'node:net';
import { status } from '../statusmanager/statusReporter';
import { MqttProtocol } from './mqttProtocol';
import {
  IpcSetLight,
  IpcSetSwitch
} from './types';

const SHELLY_GET_STATUS_TIMEOUT = 60000;
const SHELLY_MAX_NOF_COMPONENTS = 4;

/**
 * A Shelly device connected via MQTT communication.
 */
export class ShellyDevice {
  _mqtt: MqttProtocol;
  _statusTimer: NodeJS.Timeout | undefined;
  _status: Record<string, string | number | boolean | object>;
  _name: string;

  /**
   * Constructs a new Shelly device.
   * @param socket the client socket
   */
  constructor(socket: net.Socket) {
    this._mqtt = new MqttProtocol(socket, name => {
      this._onConnect(name);
    }, () => {
      this._onClose();
    }, topics => {
      this._onSubscribe(topics);
    }, (topic, payload) => {
      this._onPublish(topic, payload);
    });
    this._status = {};
    this._name = '';
  }

  /**
   * Start the Shelly device and MQTT communication.
   */
  start(): void {
    this._mqtt.start();
  }

  /**
   * Stops the Shelly device and MQTT communication.
   * @details the Shelly device should not be used anymore afterwards
   */
  stop(): void {
    clearInterval(this._statusTimer);
    this._mqtt.stop();
  }

  /**
   * Indicates whether this Shelly device is still connected.
   * @returns `true` when connected, or `false` otherwise
   */
  isConnected(): boolean {
    return this._mqtt.isOpen();
  }

  /**
   * Publishes a Switch.Set command to the Shelly device.
   * @param mac the Shelly device MAC address
   * @param set the Switch.Set command
   */
  setSwitch(mac: string, set: IpcSetSwitch): void {
    if (mac === this._status.mac) {
      if (this._status.type === 'switch') {
        log.shellydevice.info(`Executing Switch.Set command in device with name: ${this._name}`);
        this._mqtt.publish(`${this._name}/rpc`, JSON.stringify({ id: 'Switch.Set', src: 'shellyserver', method: 'Switch.Set', params: set }));
      }
      else {
        log.shellydevice.warn(`Failed executing Switch.Set command in device with name: ${this._name}`);
      }
    }
  }

  /**
   * Publishes a Light.Set command to the Shelly device.
   * @param mac the Shelly device MAC address
   * @param set the Light.Set command
   */
  setLight(mac: string, set: IpcSetLight): void {
    if (mac === this._status.mac) {
      if (this._status.type === 'light') {
        log.shellydevice.info(`Executing Light.Set command in device with name: ${this._name}`);
        this._mqtt.publish(`${this._name}/rpc`, JSON.stringify({ id: 'Light.Set', src: 'shellyserver', method: 'Light.Set', params: set }));
      }
      else {
        log.shellydevice.warn(`Failed executing Light.Set command in device with name: ${this._name}`);
      }
    }
  }

  /**
   * Handles connection of the Shelly device.
   * @param name the Shelly device name
   */
  _onConnect(name: string): void {
    this._name = name;
    status[this._name].start('shellydevice');
    log.shellydevice.info(`Connected device with name: ${this._name}`);
  }

  /**
   * Handles closure of the Shelly device.
   */
  _onClose(): void {
    clearInterval(this._statusTimer);
    status[this._name].stop();
    log.shellydevice.info(`Closed device with name: ${this._name}`);
  }

  /**
   * Handles a subscription from the Shelly device.
   * @param topics the subscribed topics
   */
  _onSubscribe(topics: string[]): void {
    if (topics.includes(`${this._name}/rpc`)) {
      // Get the initial Shelly device status
      this._mqtt.publish(`${this._name}/rpc`, JSON.stringify({ id: 'Shelly.GetStatus', method: 'Shelly.GetStatus', src: 'shellyserver' }), 1);
      // Get the Shelly device status cyclic
      this._statusTimer = setInterval(() => {
        this._mqtt.publish(`${this._name}/rpc`, JSON.stringify({ id: 'Shelly.GetStatus', method: 'Shelly.GetStatus', src: 'shellyserver' }), 1);
      }, SHELLY_GET_STATUS_TIMEOUT);
    }
  }

  /**
   * Handles a publish from the Shelly device.
   * @param topic the MQTT topic
   * @param payload the payload
   */
  _onPublish(topic: string, payload: string): void {
    // Handle Shelly device status
    if (topic == 'shellyserver/rpc') {
      const json = JSON.parse(payload); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
      if (json.id as string == 'Shelly.GetStatus') {
        this._handleDeviceStatus(json.result);
      }
    }

    // Handle Shelly component status
    if (topic.startsWith(`${this._name}/status/switch:`)) {
      const parts = topic.split('/');
      const name = parts[parts.length - 1];
      const json = JSON.parse(payload); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
      this._handleComponentStatus(name, json);
    }
    else if (topic.startsWith(`${this._name}/status/light:`)) {
      const parts = topic.split('/');
      const name = parts[parts.length - 1];
      const json = JSON.parse(payload); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
      this._handleComponentStatus(name, json);
    }
  }

  /**
   * Handles a Shelly device status
   * @param data the data
   */
  _handleDeviceStatus(data: any): void /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
    // If no data is received or no MAC address is available the device cannot be used
    if (data === undefined || data.sys?.mac === undefined) {
      log.shellydevice.error(`Error occurred in device with name: ${this._name}, message: status did not contain a MAC address`);
      this.stop();
      return;
    }

    // Handle Shelly device status
    this._status.mac = data.sys?.mac as string;
    this._status.ip = data.eth?.ip as string || data.wifi?.sta_ip as string;
    this._status.rssi = data.wifi?.rssi as number;
    status[this._name].setDetails(this._status);
    status[this._name].setHealth('running');

    // Handle Shelly component status
    for (let i = 0; i < SHELLY_MAX_NOF_COMPONENTS; i++) {
      let name = `switch:${String(i)}`;
      if (data[name]) {
        this._status.type = 'switch';
        this._handleComponentStatus(name, data[name]);
      }

      name = `light:${String(i)}`;
      if (data[name]) {
        this._status.type = 'light';
        this._handleComponentStatus(name, data[name]);
      }
    }
  }

  /**
   * Handles a Shelly component status
   * @param name the component name
   * @param data the data
   */
  _handleComponentStatus(name: string, data: Record<string, string | number | boolean>): void {
    this._status[name] = {
      output: data.output as boolean,
      power: data.apower as number,
      voltage: data.voltage as number,
      current: data.current as number,
      freq: data.freq as number,
      brightness: data.brightness as number
    };
    status[this._name].setDetails(this._status);
  }
}
