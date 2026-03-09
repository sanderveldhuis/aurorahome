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
exports.isIpcSetConfigMessage = isIpcSetConfigMessage;
exports.isIpcSetConfigReponseMessage = isIpcSetConfigReponseMessage;
const CONFIG_NAME = ['WeatherManager', 'ShellyServer'];
/**
 * Checks whether the specified message is an IPC SetConfig message.
 * @param name the message name
 * @param payload the message payload
 * @returns `true` when the message is a SetConfig message, or `false` otherwise
 */
function isIpcSetConfigMessage(name, payload) {
    return name === 'SetConfig' && typeof payload === 'object' && payload !== null &&
        'name' in payload && typeof payload.name === 'string' && CONFIG_NAME.find(name => name === payload.name) !== undefined &&
        'config' in payload && typeof payload.config === 'object' && payload.config !== null;
}
const SET_CONFIG_RESULT = ['ok', 'disconnected', 'error'];
/**
 * Checks whether the specified message is an IPC SetConfigResponse message.
 * @param name the message name
 * @param payload the message payload
 * @returns `true` when the message is a SetConfigResponse message, or `false` otherwise
 */
function isIpcSetConfigReponseMessage(name, payload) {
    return name === 'SetConfig' && typeof payload === 'object' && payload !== null &&
        'result' in payload && typeof payload.result === 'string' && SET_CONFIG_RESULT.find(result => result === payload.result) !== undefined;
}
