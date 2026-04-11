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
exports.isIpcGetLogMessage = isIpcGetLogMessage;
exports.isIpcGetLogResponseMessage = isIpcGetLogResponseMessage;
/**
 * Checks whether the specified message is an IPC Get Log message.
 * @param name the message name
 * @param payload the message payload
 * @returns `true` when the message is a Get Log message, or `false` otherwise
 */
function isIpcGetLogMessage(name, payload) {
    return name === 'GetLog' && typeof payload === 'undefined';
}
const GET_LOG_RESULT = ['ok', 'error'];
const LOG_LEVEL = ['ERR', 'WRN', 'INF', 'DBG'];
/**
 * Checks whether the specified message is an IPC GetLogResponse message.
 * @param name the message name
 * @param payload the message payload
 * @returns `true` when the message is a GetLogResponse message, or `false` otherwise
 */
function isIpcGetLogResponseMessage(name, payload) {
    if (name !== 'GetLog' || typeof payload !== 'object' || payload === null ||
        !('result' in payload) || typeof payload.result !== 'string' || GET_LOG_RESULT.find(result => result === payload.result) === undefined ||
        ('logs' in payload && !Array.isArray(payload.logs))) {
        return false;
    }
    if ('logs' in payload && Array.isArray(payload.logs)) {
        for (const obj of payload.logs) {
            if (typeof obj === 'object' && obj !== null) {
                const log = obj;
                if ('timestamp' in log && typeof log.timestamp === 'number' &&
                    'level' in log && typeof log.level === 'string' && LOG_LEVEL.find(level => level === log.level) !== undefined &&
                    'name' in log && typeof log.name === 'string' &&
                    'message' in log && typeof log.message === 'string') {
                    // Log message is ok
                    continue;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
    }
    return true;
}
