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

import { glconfig } from 'glidelite';
import net from 'node:net';
import { StatusReporter } from '../controller/statusReporter';
import { MqttProtocol } from './mqttProtocol';

const SHELLY_GET_STATUS_TIMEOUT = 60000;

/**
 * A Shelly device connected via MQTT communication.
 */
export class ShellyDevice {
  _mqtt: MqttProtocol;
  _statusReporter: StatusReporter;
  _statusTimer: NodeJS.Timeout | undefined;
  _status: Record<string, string | number | boolean>;
  _name: string;
  _type: string;

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
    this._statusReporter = new StatusReporter();
    this._status = {};
    this._name = '';
    this._type = '';
  }

  /**
   * Start the Shelly device and MQTT communication.
   */
  start() {
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
   * Publishes a command to the Shelly device.
   */
  command(): void {
    // TODO: handle via IPC indication
    this._mqtt.publish(`${this._name}/rpc`, JSON.stringify({ id: 'Switch.Set', src: glconfig.shelly.endpoint as string, method: 'Switch.Set', params: { id: 0, on: false } }));
    this._mqtt.publish(`${this._name}/rpc`, JSON.stringify({ id: 'Light.Set', src: glconfig.shelly.endpoint as string, method: 'Light.Set', params: { id: 0, on: false, brightness: 31 } }));
  }

  /**
   * Handles connection of the Shelly device.
   */
  _onConnect(name: string): void {
    this._name = name;
    this._statusReporter.start(name, 'shelly');
  }

  /**
   * Handles closure of the Shelly device.
   */
  _onClose(): void {
    clearInterval(this._statusTimer);
    this._statusReporter.stop();
  }

  /**
   * Handles a subscription of the Shelly device.
   * @param topics the subscribed topics
   */
  _onSubscribe(topics: string[]): void {
    if (topics.includes(`${this._name}/rpc`)) {
      // Get the initial Shelly device status
      this._mqtt.publish(`${this._name}/rpc`, JSON.stringify({ id: 'Shelly.GetStatus', method: 'Shelly.GetStatus', src: glconfig.shelly.endpoint as string }), 1);
      // Get the Shelly device status cyclic
      this._statusTimer = setInterval(() => {
        this._mqtt.publish(`${this._name}/rpc`, JSON.stringify({ id: 'Shelly.GetStatus', method: 'Shelly.GetStatus', src: glconfig.shelly.endpoint as string }), 1);
      }, SHELLY_GET_STATUS_TIMEOUT);
    }
  }

  /**
   * Handles a publish of the Shelly device.
   * @param topic the MQTT topic
   * @param payload the payload
   */
  _onPublish(topic: string, payload: string): void {
    // Handle Shelly device status
    if (topic == `${glconfig.shelly.endpoint as string}/rpc`) {
      const json = JSON.parse(payload); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
      if (json.id as string == 'Shelly.GetStatus') {
        this._handleShellyStatus(json.result);
      }
    }

    // Handle Shelly device specific updates
    if (topic == `${this._name}/status/switch:0`) {
      const json = JSON.parse(payload); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
      this._handleSwitchStatus(json);
    }
    else if (topic == `${this._name}/status/light:0`) {
      const json = JSON.parse(payload); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
      this._handleLightStatus(json);
    }
  }

  /**
   * Handles a Shelly device status
   * @param data the data
   */
  _handleShellyStatus(data: any): void /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
    this._statusReporter.setHealth('running');
    if (data === undefined) {
      return;
    }

    this._status.mac = data.sys?.mac as string;
    this._status.ip = data.eth?.ip as string || data.wifi?.sta_ip as string;
    this._status.rssi = data.wifi?.rssi as number;
    if (data['switch:0']) {
      this._status.type = 'switch:0';
      this._statusReporter.setStatus(this._status);
      this._handleSwitchStatus(data['switch:0']);
    }
    else if (data['light:0']) {
      this._status.type = 'light:0';
      this._statusReporter.setStatus(this._status);
      this._handleLightStatus(data['light:0']);
    }
  }

  /**
   * Handles a Shelly switch device updates
   * @param data the data
   */
  _handleSwitchStatus(data: Record<string, string | number | boolean>): void {
    this._status.output = data.output as boolean;
    this._status.power = data.apower as number;
    this._status.voltage = data.voltage as number;
    this._status.current = data.current as number;
    this._status.freq = data.freq as number;
    this._statusReporter.setStatus(this._status);
  }

  /**
   * Handles a Shelly light device updates
   * @param data the data
   */
  _handleLightStatus(data: Record<string, string | number | boolean>): void {
    this._status.output = data.output as boolean;
    this._status.power = data.apower as number;
    this._status.voltage = data.voltage as number;
    this._status.current = data.current as number;
    this._status.freq = data.freq as number;
    this._status.brightness = data.brightness as number;
    this._statusReporter.setStatus(this._status);
  }
}
