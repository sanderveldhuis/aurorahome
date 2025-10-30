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
import { MqttProtocol } from './mqttProtocol';

/**
 * A Shelly device connected via MQTT communication.
 */
export class ShellyDevice {
  _mqtt: MqttProtocol;

  /**
   * Constructs a new Shelly device.
   * @param socket the client socket
   */
  constructor(socket: net.Socket) {
    this._mqtt = new MqttProtocol(socket, () => {
      this._onConnect();
    }, () => {
      this._onClose();
    }, topics => {
      this._onSubscribe(topics);
    }, (topic, payload) => {
      this._onPublish(topic, payload);
    });
  }

  /**
   * Start the Shelly device and MQTT communication.
   */
  start() {
    // Start MQTT protocol on the client socket
    this._mqtt.start();
  }

  /**
   * Stops the Shelly device and MQTT communication.
   * @details the Shelly device should not be used anymore afterwards
   */
  stop(): void {
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
   * Handles connection of the Shelly device.
   */
  _onConnect(): void {
    // TODO: update status in database
    log.shellydevice.debug('connected');
  }

  /**
   * Handles closure of the Shelly device.
   */
  _onClose(): void {
    // TODO: update status in database
    log.shellydevice.debug('disconnected');
  }

  /**
   * Handles a subscription of the Shelly device.
   * @param topics the subscribed topics
   */
  _onSubscribe(topics: string[]): void {
    // TODO: implement
    log.shellydevice.debug(topics);

    // TODO: get initial state once the subscription is received, not before that as the device will ignore it
    // this.publish('<id>/rpc', { id: this.payloadId & 0xffff, src: this.source, method: 'Shelly.GetStatus' });
    // this.publish('<id>/rpc', { id: this.payloadId & 0xffff, src: this.source, method: 'Switch.Set', params: { id: 0, on: false } });
  }

  /**
   * Handles a publish of the Shelly device.
   * @param topic the MQTT topic
   * @param payload the payloads
   */
  _onPublish(topic: string, payload: string): void {
    // TODO: implement
    log.shellydevice.debug(topic, payload);
  }
}
