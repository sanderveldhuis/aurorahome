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
exports.isApiShellyConfigResponse = isApiShellyConfigResponse;
exports.isApiShellyEnable = isApiShellyEnable;
exports.isApiShellyDisable = isApiShellyDisable;
exports.isApiWeatherConfigResponse = isApiWeatherConfigResponse;
exports.isApiWeatherDisable = isApiWeatherDisable;
exports.isApiWeatherEnable = isApiWeatherEnable;
const validator_1 = __importDefault(require("validator"));
/**
 * Checks whether the specified payload is an API Shelly Config response.
 * @param payload the response payload
 * @returns `true` when the payload is a Shelly Config response, or `false` otherwise
 */
function isApiShellyConfigResponse(payload) {
    return payload !== null && 'enable' in payload && typeof payload.enable === 'boolean' &&
        (!('port' in payload) || typeof payload.port === 'number') &&
        (!('hostname' in payload) || typeof payload.hostname === 'string') &&
        (!('username' in payload) || typeof payload.username === 'string');
}
/**
 * Checks whether the specified params is an API Shelly Enable request.
 * @param params the params
 * @returns `true` when the params is a Shelly Enable request, or `false` otherwise
 */
function isApiShellyEnable(params) {
    return 'enable' in params && typeof params.enable === 'boolean' && params.enable &&
        'port' in params && typeof params.port === 'number' && params.port >= 0 && params.port <= 65535 &&
        'hostname' in params && typeof params.hostname === 'string' && validator_1.default.isIP(params.hostname) &&
        'username' in params && typeof params.username === 'string' && validator_1.default.isByteLength(params.username, { max: 65535 }) &&
        'password' in params && typeof params.password === 'string' && validator_1.default.isByteLength(params.password, { max: 65535 });
}
/**
 * Checks whether the specified params is an API Shelly Disable request.
 * @param params the params
 * @returns `true` when the params is a Shelly Disable request, or `false` otherwise
 */
function isApiShellyDisable(params) {
    return 'enable' in params && typeof params.enable === 'boolean' && !params.enable;
}
const SOURCE_NAME = ['openweathermapV3'];
const SOURCE_UNITS = ['standard', 'metric', 'imperial'];
/**
 * Checks whether the specified payload is an API Weather Config response.
 * @param payload the response payload
 * @returns `true` when the payload is a Weather Config response, or `false` otherwise
 */
function isApiWeatherConfigResponse(payload) {
    return payload !== null && 'enable' in payload && typeof payload.enable === 'boolean' &&
        (!('interval' in payload) || typeof payload.interval === 'number') &&
        (!('name' in payload) || (typeof payload.name === 'string' && SOURCE_NAME.find(name => name === payload.name) !== undefined)) &&
        (!('lat' in payload) || typeof payload.lat === 'number') &&
        (!('lon' in payload) || typeof payload.lon === 'number') &&
        (!('units' in payload) || (typeof payload.units === 'string' && SOURCE_UNITS.find(units => units === payload.units) !== undefined));
}
/**
 * Checks whether the specified params is an API Weather Disable request.
 * @param params the params
 * @returns `true` when the params is a Weather Disable request, or `false` otherwise
 */
function isApiWeatherDisable(params) {
    return 'enable' in params && typeof params.enable === 'boolean' && !params.enable;
}
/**
 * Checks whether the specified params is an API Weather Enable request.
 * @param params the params
 * @returns `true` when the params is a Weather Enable request, or `false` otherwise
 */
function isApiWeatherEnable(params) {
    return 'enable' in params && typeof params.enable === 'boolean' && params.enable &&
        'interval' in params && typeof params.interval === 'number' && params.interval > 0 &&
        'name' in params && typeof params.name === 'string' && SOURCE_NAME.find(name => name === params.name) !== undefined &&
        'lat' in params && typeof params.lat === 'number' &&
        'lon' in params && typeof params.lon === 'number' &&
        validator_1.default.isLatLong(`${String(params.lat)},${String(params.lon)}`) &&
        'units' in params && typeof params.units === 'string' && SOURCE_UNITS.find(units => units === params.units) !== undefined &&
        'apiKey' in params && typeof params.apiKey === 'string' && validator_1.default.isAlphanumeric(params.apiKey) && params.apiKey.length === 32;
}
