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
exports.isIpcWeatherManagerConfigMessage = isIpcWeatherManagerConfigMessage;
const SOURCE_NAME = ['openweathermapV3'];
const SOURCE_UNITS = ['standard', 'metric', 'imperial'];
/**
 * Checks whether the specified message is an IPC WeatherManagerConfig message.
 * @param name the message name
 * @param payload the message payload
 * @returns `true` when the message is a WeatherManagerConfig message, or `false` otherwise
 */
function isIpcWeatherManagerConfigMessage(name, payload) {
    return name === 'WeatherManagerConfig' && typeof payload === 'object' && payload !== null &&
        (!('source' in payload) || (typeof payload.source === 'object' && payload.source !== null &&
            'interval' in payload.source && typeof payload.source.interval === 'number' &&
            'name' in payload.source && typeof payload.source.name === 'string' &&
            // @ts-expect-error-line because TypeScript forgets that the payload.source object exists
            SOURCE_NAME.find(name => name === payload.source.name) !== undefined &&
            'lat' in payload.source && typeof payload.source.lat === 'number' &&
            'lon' in payload.source && typeof payload.source.lon === 'number' &&
            'units' in payload.source && typeof payload.source.units === 'string' &&
            // @ts-expect-error-line because TypeScript forgets that the payload.source object exists
            SOURCE_UNITS.find(units => units === payload.source.units) !== undefined &&
            'apiKey' in payload.source && typeof payload.source.apiKey === 'string'));
}
