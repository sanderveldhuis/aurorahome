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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttProtocol = void 0;
const glidelite_1 = require("glidelite");
const mqtt_packet_1 = __importDefault(require("mqtt-packet"));
/**
 * Executes the MQTT protocol on a socket.
 */
class MqttProtocol {
    _socket;
    _username;
    _password;
    _parser;
    _clientId;
    _protocolVersion;
    _cache;
    _messageId;
    _connectCallback;
    _closeCallback;
    _subscribeCallback;
    _publishCallback;
    /**
     * Constructs a new MQTT protocol for the specified socket.
     * @param socket the socket
     * @param username the MQTT username
     * @param password the MQTT password
     * @param connectCallback invoked when MQTT is connected
     * @param closeCallback invoked when the socket is ended (i.e. MQTT is disconnected)
     * @param subscribeCallback invoked when an MQTT subscription is received
     * @param publishCallback invoked when an MQTT publish is received
     */
    constructor(socket, username, password, connectCallback, closeCallback, subscribeCallback, publishCallback) {
        this._socket = socket;
        this._username = username;
        this._password = password;
        this._connectCallback = connectCallback;
        this._closeCallback = closeCallback;
        this._subscribeCallback = subscribeCallback;
        this._publishCallback = publishCallback;
        this._parser = mqtt_packet_1.default.parser();
        this._clientId = 'unknown';
        this._protocolVersion = glidelite_1.glconfig.mqtt.version;
        this._cache = {};
        this._messageId = 1;
    }
    /**
     * Start the MQTT protocol by handling all incoming events.
     */
    start() {
        // Remove listeners for safety, e.g. when this function was invoked before
        this._parser.removeAllListeners();
        this._socket.removeAllListeners();
        // Register all MQTT parser listeners
        this._parser.on('packet', (packet) => {
            this._onPacket(packet);
        });
        // Register all socket listeners
        this._socket.on('data', (data) => {
            this._onData(data);
        });
        this._socket.on('timeout', () => {
            this._onTimeout();
        });
        this._socket.on('end', () => {
            this._onEnd();
        });
        this._socket.on('error', (error) => {
            this._onError(error);
        });
        this._socket.on('close', () => {
            this._onClose();
        });
    }
    /**
     * Stops the MQTT protocol and the socket.
     * @details the IPC protocol should not be used anymore afterwards
     */
    stop() {
        // Clear the cache
        for (const cache of Object.values(this._cache)) {
            clearTimeout(cache.retryTimeout);
        }
        this._cache = {};
        // Stop the socket, do not remove all listeners for the socket to prevent missing an error or close event
        this._socket.end();
    }
    /**
     * Indicates whether this MQTT protocol connection is open.
     * @returns `true` when open, or `false` otherwise
     */
    isOpen() {
        return !this._socket.destroyed && this._socket.writable && this._socket.readable;
    }
    /**
     * Publish an MQTT packet to the socket.
     * @param payload the MQTT packet payload
     */
    publish(topic, payload, qos) {
        const packet = { cmd: 'publish', messageId: this._messageId, qos: qos ?? 0, topic: topic, payload: payload };
        const data = mqtt_packet_1.default.generate(packet, { protocolVersion: this._protocolVersion });
        this._socket.write(data);
        if (packet.qos > 0) {
            this._setRetryTimeout('publish', this._messageId, packet);
        }
        // Increment and prevent overflooding of the message identifier
        this._messageId++;
        if (this._messageId > 65535) {
            this._messageId = 1;
        }
    }
    /**
     * Handles data received by the socket.
     * @param data the data
     */
    _onData(data) {
        // Once a valid MQTT packet is found the _onPacket function will be invoked by the parser
        this._parser.parse(data, { protocolVersion: this._protocolVersion });
    }
    /**
     * Handles timeout of the socket.
     */
    _onTimeout() {
        this._socket.end();
    }
    /**
     * Handles end of the socket.
     */
    _onEnd() {
        this._socket.end();
    }
    /**
     * Handles errors of the socket.
     * @param error the error
     */
    _onError(error) {
        glidelite_1.log.shellydevice.error(`Error occurred in device '${this._clientId}', message: ${error.message}`);
        this._socket.destroy();
    }
    /**
     * Handles closure of the socket.
     */
    _onClose() {
        this._closeCallback();
    }
    /**
     * Handles MQTT packets.
     * @param data the data
     */
    _onPacket(packet) {
        switch (packet.cmd) {
            case 'connect': {
                this._onConnect(packet);
                break;
            }
            case 'disconnect': {
                this._onDisconnect();
                break;
            }
            case 'pingreq': {
                this._onPingReq();
                break;
            }
            case 'unsubscribe': {
                this._onUnsubscribe(packet);
                break;
            }
            case 'subscribe': {
                this._onSubscribe(packet);
                break;
            }
            case 'publish': {
                this._onPublish(packet);
                break;
            }
            case 'puback': {
                this._onPubAck(packet);
                break;
            }
            case 'pubrec': {
                this._onPubRec(packet);
                break;
            }
            case 'pubcomp': {
                this._onPubComp(packet);
                break;
            }
            case 'pubrel': {
                this._onPubRel(packet);
                break;
            }
            default: {
                glidelite_1.log.shellydevice.warn(`Unknown packet from device '${this._clientId}', command: ${packet.cmd}`);
                break;
            }
        }
    }
    /**
     * Handles MQTT connect.
     * @param packet the packet
     */
    _onConnect(packet) {
        // Store received settings for future use
        this._clientId = packet.clientId;
        this._protocolVersion = packet.protocolVersion ?? glidelite_1.glconfig.mqtt.version;
        this._socket.setTimeout((packet.keepalive ?? 0) * 1500);
        // Validate credentials
        if (packet.username === this._username && packet.password?.toString() === this._password) {
            const data = mqtt_packet_1.default.generate({ cmd: 'connack', returnCode: 0 }, { protocolVersion: this._protocolVersion });
            this._socket.write(data);
            this._connectCallback(this._clientId);
        }
        else {
            glidelite_1.log.shellydevice.warn(`Invalid credentials from device '${this._clientId}'`);
            const data = mqtt_packet_1.default.generate({ cmd: 'connack', returnCode: 4 }, { protocolVersion: this._protocolVersion });
            this._socket.write(data);
        }
    }
    /**
     * Handles MQTT disconnect.
     */
    _onDisconnect() {
        this._socket.end();
    }
    /**
     * Handles MQTT ping request.
     */
    _onPingReq() {
        const data = mqtt_packet_1.default.generate({ cmd: 'pingresp' }, { protocolVersion: this._protocolVersion });
        this._socket.write(data);
    }
    /**
     * Handles MQTT unsubscribe.
     * @param packet the packet
     */
    _onUnsubscribe(packet) {
        const data = mqtt_packet_1.default.generate({ cmd: 'unsuback', messageId: packet.messageId }, { protocolVersion: this._protocolVersion });
        this._socket.write(data);
    }
    /**
     * Handles MQTT subscribe.
     * @param packet the packet
     */
    _onSubscribe(packet) {
        const granted = [];
        const topics = [];
        for (const subscription of packet.subscriptions) {
            granted.push(subscription.qos);
            topics.push(subscription.topic);
        }
        const data = mqtt_packet_1.default.generate({ cmd: 'suback', messageId: packet.messageId, granted: granted }, { protocolVersion: this._protocolVersion });
        this._socket.write(data);
        this._subscribeCallback(topics);
    }
    /**
     * Handles MQTT publish.
     * @param packet the packet
     */
    _onPublish(packet) {
        if (packet.qos === 1) {
            const data = mqtt_packet_1.default.generate({ cmd: 'puback', messageId: packet.messageId }, { protocolVersion: this._protocolVersion });
            this._socket.write(data);
        }
        else if (packet.qos === 2 && packet.messageId !== undefined) {
            const data = mqtt_packet_1.default.generate({ cmd: 'pubrec', messageId: packet.messageId }, { protocolVersion: this._protocolVersion });
            this._socket.write(data);
            this._setRetryTimeout('pubrec', packet.messageId);
        }
        this._publishCallback(packet.topic, packet.payload.toString());
    }
    /**
     * Handles MQTT publish acknowledge.
     * @param packet the packet
     */
    _onPubAck(packet) {
        if (packet.messageId === undefined || !Object.keys(this._cache).includes(String(packet.messageId))) {
            return;
        }
        const cache = this._cache[packet.messageId];
        if (cache.command === 'publish') {
            clearTimeout(cache.retryTimeout);
            delete this._cache[packet.messageId]; /* eslint-disable-line @typescript-eslint/no-dynamic-delete */
        }
    }
    /**
     * Handles MQTT publish received.
     * @param packet the packet
     */
    _onPubRec(packet) {
        if (packet.messageId === undefined || !Object.keys(this._cache).includes(String(packet.messageId))) {
            return;
        }
        const cache = this._cache[packet.messageId];
        if (cache.command === 'publish') {
            const data = mqtt_packet_1.default.generate({ cmd: 'pubrel', messageId: packet.messageId }, { protocolVersion: this._protocolVersion });
            this._socket.write(data);
            this._setRetryTimeout('pubrel', packet.messageId);
        }
    }
    /**
     * Handles MQTT publish complete.
     * @param packet the packet
     */
    _onPubComp(packet) {
        if (packet.messageId === undefined || !Object.keys(this._cache).includes(String(packet.messageId))) {
            return;
        }
        const cache = this._cache[packet.messageId];
        if (cache.command === 'pubrel') {
            clearTimeout(cache.retryTimeout);
            delete this._cache[packet.messageId]; /* eslint-disable-line @typescript-eslint/no-dynamic-delete */
        }
    }
    /**
     * Handles MQTT publish release.
     * @param packet the packet
     */
    _onPubRel(packet) {
        if (packet.messageId === undefined || !Object.keys(this._cache).includes(String(packet.messageId))) {
            return;
        }
        const cache = this._cache[packet.messageId];
        if (cache.command === 'pubrec') {
            clearTimeout(cache.retryTimeout);
            delete this._cache[packet.messageId]; /* eslint-disable-line @typescript-eslint/no-dynamic-delete */
            const data = mqtt_packet_1.default.generate({ cmd: 'pubcomp', messageId: packet.messageId }, { protocolVersion: this._protocolVersion });
            this._socket.write(data);
        }
    }
    /**
     * Set the retry timeout timer for a specific message.
     * @param command
     * @param messageId
     * @param message
     * @returns
     */
    _setRetryTimeout(command, messageId, message) {
        // Create new cache object if not exists or valid
        if (!Object.keys(this._cache).includes(String(messageId)) || this._cache[messageId].command !== command || this._cache[messageId].message !== message) {
            this._cache[messageId] = { command, count: 0, message };
        }
        // Check if retries already exceeded
        if (this._cache[messageId].count >= glidelite_1.glconfig.mqtt.retryMax) {
            return;
        }
        // Clear any running timeout
        clearTimeout(this._cache[messageId].retryTimeout);
        // Stop existing timeout and restart new one
        this._cache[messageId].retryTimeout = setTimeout(() => {
            this._cache[messageId].count++;
            switch (this._cache[messageId].command) {
                case 'publish': {
                    const data = mqtt_packet_1.default.generate(this._cache[messageId].message, { protocolVersion: this._protocolVersion });
                    this._socket.write(data);
                    break;
                }
                case 'pubrec': {
                    const data = mqtt_packet_1.default.generate({ cmd: 'pubrec', messageId }, { protocolVersion: this._protocolVersion });
                    this._socket.write(data);
                    break;
                }
                case 'pubrel': {
                    const data = mqtt_packet_1.default.generate({ cmd: 'pubrel', messageId }, { protocolVersion: this._protocolVersion });
                    this._socket.write(data);
                    break;
                }
                default:
                    break;
            }
            this._setRetryTimeout(command, messageId, message);
        }, glidelite_1.glconfig.mqtt.retryTimeout);
    }
}
exports.MqttProtocol = MqttProtocol;
