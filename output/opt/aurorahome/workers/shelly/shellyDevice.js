"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellyDevice = void 0;
const glidelite_1 = require("glidelite");
const statusReporter_1 = require("../controller/statusReporter");
const mqttProtocol_1 = require("./mqttProtocol");
const SHELLY_GET_STATUS_TIMEOUT = 60000;
const SHELLY_MAX_NOF_DEVICES = 4;
/**
 * A Shelly device connected via MQTT communication.
 */
class ShellyDevice {
    _mqtt;
    _statusReporter;
    _statusTimer;
    _status;
    _name;
    /**
     * Constructs a new Shelly device.
     * @param socket the client socket
     */
    constructor(socket) {
        this._mqtt = new mqttProtocol_1.MqttProtocol(socket, name => {
            this._onConnect(name);
        }, () => {
            this._onClose();
        }, topics => {
            this._onSubscribe(topics);
        }, (topic, payload) => {
            this._onPublish(topic, payload);
        });
        this._statusReporter = new statusReporter_1.StatusReporter();
        this._status = {};
        this._name = '';
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
    stop() {
        clearInterval(this._statusTimer);
        this._mqtt.stop();
    }
    /**
     * Indicates whether this Shelly device is still connected.
     * @returns `true` when connected, or `false` otherwise
     */
    isConnected() {
        return this._mqtt.isOpen();
    }
    /**
     * Publishes a command to the Shelly device.
     * @param mac the Shelly device MAC address
     * @param params the parameters for the device command
     */
    command(mac, params) {
        if (mac === this._status.mac) {
            if (this._status.type === 'switch') {
                glidelite_1.log.shellydevice.info(`Executing Switch.Set command in device with name: ${this._name}`);
                this._mqtt.publish(`${this._name}/rpc`, JSON.stringify({ id: 'Switch.Set', src: glidelite_1.glconfig.shelly.endpoint, method: 'Switch.Set', params }));
            }
            else if (this._status.type === 'light') {
                glidelite_1.log.shellydevice.info(`Executing Light.Set command in device with name: ${this._name}`);
                this._mqtt.publish(`${this._name}/rpc`, JSON.stringify({ id: 'Light.Set', src: glidelite_1.glconfig.shelly.endpoint, method: 'Light.Set', params }));
            }
        }
    }
    /**
     * Handles connection of the Shelly device.
     * @param name the Shelly device name
     */
    _onConnect(name) {
        this._name = name;
        this._statusReporter.start(name, 'shelly');
        glidelite_1.log.shellydevice.info(`Connected device with name: ${this._name}`);
    }
    /**
     * Handles closure of the Shelly device.
     */
    _onClose() {
        clearInterval(this._statusTimer);
        this._statusReporter.stop();
        glidelite_1.log.shellydevice.info(`Closed device with name: ${this._name}`);
    }
    /**
     * Handles a subscription of the Shelly device.
     * @param topics the subscribed topics
     */
    _onSubscribe(topics) {
        if (topics.includes(`${this._name}/rpc`)) {
            // Get the initial Shelly device status
            this._mqtt.publish(`${this._name}/rpc`, JSON.stringify({ id: 'Shelly.GetStatus', method: 'Shelly.GetStatus', src: glidelite_1.glconfig.shelly.endpoint }), 1);
            // Get the Shelly device status cyclic
            this._statusTimer = setInterval(() => {
                this._mqtt.publish(`${this._name}/rpc`, JSON.stringify({ id: 'Shelly.GetStatus', method: 'Shelly.GetStatus', src: glidelite_1.glconfig.shelly.endpoint }), 1);
            }, SHELLY_GET_STATUS_TIMEOUT);
        }
    }
    /**
     * Handles a publish of the Shelly device.
     * @param topic the MQTT topic
     * @param payload the payload
     */
    _onPublish(topic, payload) {
        // Handle Shelly status
        if (topic == `${glidelite_1.glconfig.shelly.endpoint}/rpc`) {
            const json = JSON.parse(payload); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
            if (json.id == 'Shelly.GetStatus') {
                this._handleShellyStatus(json.result);
            }
        }
        // Handle Shelly device specific updates
        if (topic.startsWith(`${this._name}/status/switch:`)) {
            const parts = topic.split('/');
            const name = parts[parts.length - 1];
            const json = JSON.parse(payload); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
            this._handleDeviceStatus(name, json);
        }
        else if (topic.startsWith(`${this._name}/status/light:`)) {
            const parts = topic.split('/');
            const name = parts[parts.length - 1];
            const json = JSON.parse(payload); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
            this._handleDeviceStatus(name, json);
        }
    }
    /**
     * Handles a Shelly status
     * @param data the data
     */
    _handleShellyStatus(data) {
        // If no data is received or no MAC address is available the device cannot be used
        if (data === undefined || data.sys?.mac === undefined) {
            glidelite_1.log.shellydevice.error(`Error occurred in device with name: ${this._name}, message: status did not contain a MAC address`);
            this.stop();
            return;
        }
        // Handle Shelly status
        this._status.mac = data.sys?.mac;
        this._status.ip = data.eth?.ip || data.wifi?.sta_ip;
        this._status.rssi = data.wifi?.rssi;
        this._statusReporter.setStatus(this._status);
        this._statusReporter.setHealth('running');
        // Handle Shelly device specific updates
        for (let i = 0; i < SHELLY_MAX_NOF_DEVICES; i++) {
            let name = `switch:${String(i)}`;
            if (data[name]) {
                this._status.type = 'switch';
                this._handleDeviceStatus(name, data[name]);
            }
            name = `light:${String(i)}`;
            if (data[name]) {
                this._status.type = 'light';
                this._handleDeviceStatus(name, data[name]);
            }
        }
    }
    /**
     * Handles a Shelly device status
     * @param name the device name
     * @param data the data
     */
    _handleDeviceStatus(name, data) {
        this._status[name] = {
            output: data.output,
            power: data.apower,
            voltage: data.voltage,
            current: data.current,
            freq: data.freq,
            brightness: data.brightness
        };
        this._statusReporter.setStatus(this._status);
    }
}
exports.ShellyDevice = ShellyDevice;
