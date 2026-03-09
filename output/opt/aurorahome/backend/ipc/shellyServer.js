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
exports.isIpcSetSwitchMessage = isIpcSetSwitchMessage;
exports.isIpcSetLightMessage = isIpcSetLightMessage;
exports.isIpcShellyServerConfigMessage = isIpcShellyServerConfigMessage;
/**
 * Checks whether the specified message is an IPC SetSwitch message.
 * @param name the message name
 * @param payload the message payload
 * @returns `true` when the message is a SetSwitch message, or `false` otherwise
 */
function isIpcSetSwitchMessage(name, payload) {
    // The message name should contain the Shelly device MAC address, it is checked later
    return typeof payload === 'object' && payload !== null &&
        'id' in payload && typeof payload.id === 'number' &&
        'on' in payload && typeof payload.on === 'boolean';
}
/**
 * Checks whether the specified message is an IPC SetLight message.
 * @param name the message name
 * @param payload the message payload
 * @returns `true` when the message is a SetLight message, or `false` otherwise
 */
function isIpcSetLightMessage(name, payload) {
    // The message name should contain the Shelly device MAC address, it is checked later
    return typeof payload === 'object' && payload !== null &&
        'id' in payload && typeof payload.id === 'number' &&
        (!('on' in payload) || typeof payload.on === 'boolean') &&
        (!('brightness' in payload) || typeof payload.brightness === 'number');
}
/**
 * Checks whether the specified message is an IPC ShellyServerConfig message.
 * @param name the message name
 * @param payload the message payload
 * @returns `true` when the message is a ShellyServerConfig message, or `false` otherwise
 */
function isIpcShellyServerConfigMessage(name, payload) {
    return name === 'ShellyServerConfig' && typeof payload === 'object' && payload !== null &&
        (!('mqtt' in payload) || (typeof payload.mqtt === 'object' && payload.mqtt !== null &&
            'port' in payload.mqtt && typeof payload.mqtt.port === 'number' &&
            'hostname' in payload.mqtt && typeof payload.mqtt.hostname === 'string' &&
            'username' in payload.mqtt && typeof payload.mqtt.username === 'string' &&
            'password' in payload.mqtt && typeof payload.mqtt.password === 'string'));
}
