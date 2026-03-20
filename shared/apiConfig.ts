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

import validator from 'validator';

/**
 * The API response containing Shelly configuration.
 */
export interface ApiShellyConfigResponse {
  /** Indicates whether Shelly is enabled */
  enable: boolean;
  /** The port number of the MQTT server */
  port?: number;
  /** The host name of the MQTT server */
  hostname?: string;
  /** The MQTT username */
  username?: string;
}

/**
 * Checks whether the specified payload is an API Shelly Config response.
 * @param payload the response payload
 * @returns `true` when the payload is a Shelly Config response, or `false` otherwise
 */
export function isApiShellyConfigResponse(payload: object | null): payload is ApiShellyConfigResponse {
  return payload !== null && 'enable' in payload && typeof payload.enable === 'boolean' &&
    (!('port' in payload) || typeof payload.port === 'number') &&
    (!('hostname' in payload) || typeof payload.hostname === 'string') &&
    (!('username' in payload) || typeof payload.username === 'string');
}

/**
 * The API request containing Shelly Enable.
 */
export interface ApiShellyEnable extends Record<string, number | string | boolean> {
  /** Indicates whether Shelly is enabled */
  enable: true;
  /** The port number of the MQTT server */
  port: number;
  /** The host name of the MQTT server */
  hostname: string;
  /** The MQTT username */
  username: string;
  /** The MQTT password */
  password: string;
}

/**
 * Checks whether the specified params is an API Shelly Enable request.
 * @param params the params
 * @returns `true` when the params is a Shelly Enable request, or `false` otherwise
 */
export function isApiShellyEnable(params: Record<string, any>): params is ApiShellyEnable { // eslint-disable-line @typescript-eslint/no-explicit-any
  return 'enable' in params && typeof params.enable === 'boolean' && params.enable &&
    'port' in params && typeof params.port === 'number' && params.port >= 0 && params.port <= 65535 &&
    'hostname' in params && typeof params.hostname === 'string' && validator.isIP(params.hostname) &&
    'username' in params && typeof params.username === 'string' && validator.isByteLength(params.username, { max: 65535 }) &&
    'password' in params && typeof params.password === 'string' && validator.isByteLength(params.password, { max: 65535 });
}

/**
 * The API request containing Shelly Disable.
 */
export interface ApiShellyDisable extends Record<string, number | string | boolean> {
  /** Indicates whether Shelly is disabled */
  enable: false;
}

/**
 * Checks whether the specified params is an API Shelly Disable request.
 * @param params the params
 * @returns `true` when the params is a Shelly Disable request, or `false` otherwise
 */
export function isApiShellyDisable(params: Record<string, any>): params is ApiShellyDisable { // eslint-disable-line @typescript-eslint/no-explicit-any
  return 'enable' in params && typeof params.enable === 'boolean' && !params.enable;
}

/**
 * The weather data source name.
 */
export type SourceName = typeof SOURCE_NAME[number];
const SOURCE_NAME = ['openweathermapV3'] as const;

/**
 * The weather data unit.
 */
export type SourceUnits = typeof SOURCE_UNITS[number];
const SOURCE_UNITS = ['standard', 'metric', 'imperial'] as const;

/**
 * The API response containing weather configuration.
 */
export interface ApiWeatherConfigResponse {
  /** Indicates whether weather is enabled */
  enable: boolean;
  /** Interval of retrieving from the source in seconds */
  interval?: number;
  /** The source name */
  name?: SourceName;
  /** The latitude geographic coordinate of the location */
  lat?: number;
  /** The longitude geographic coordinate of the location */
  lon?: number;
  /** The units applied to the data */
  units?: SourceUnits;
}

/**
 * Checks whether the specified payload is an API Weather Config response.
 * @param payload the response payload
 * @returns `true` when the payload is a Weather Config response, or `false` otherwise
 */
export function isApiWeatherConfigResponse(payload: object | null): payload is ApiWeatherConfigResponse {
  return payload !== null && 'enable' in payload && typeof payload.enable === 'boolean' &&
    (!('interval' in payload) || typeof payload.interval === 'number') &&
    (!('name' in payload) || (typeof payload.name === 'string' && SOURCE_NAME.find(name => name === payload.name) !== undefined)) &&
    (!('lat' in payload) || typeof payload.lat === 'number') &&
    (!('lon' in payload) || typeof payload.lon === 'number') &&
    (!('units' in payload) || (typeof payload.units === 'string' && SOURCE_UNITS.find(units => units === payload.units) !== undefined));
}

/**
 * The API request containing Weather Disable.
 */
export interface ApiWeatherDisable extends Record<string, number | string | boolean> {
  /** Indicates whether weather is disabled */
  enable: false;
}

/**
 * Checks whether the specified params is an API Weather Disable request.
 * @param params the params
 * @returns `true` when the params is a Weather Disable request, or `false` otherwise
 */
export function isApiWeatherDisable(params: Record<string, any>): params is ApiWeatherDisable { // eslint-disable-line @typescript-eslint/no-explicit-any
  return 'enable' in params && typeof params.enable === 'boolean' && !params.enable;
}

/**
 * The API request containing Weather Enable.
 */
export interface ApiWeatherEnable extends Record<string, number | string | boolean> {
  /** Indicates whether weather is enabled */
  enable: true;
  /** Interval of retrieving from the source in seconds */
  interval: number;
  /** The source name */
  name: SourceName;
  /** The latitude geographic coordinate of the location */
  lat: number;
  /** The longitude geographic coordinate of the location */
  lon: number;
  /** The units applied to the data */
  units: SourceUnits;
  /** The source API key */
  apiKey: string;
}

/**
 * Checks whether the specified params is an API Weather Enable request.
 * @param params the params
 * @returns `true` when the params is a Weather Enable request, or `false` otherwise
 */
export function isApiWeatherEnable(params: Record<string, any>): params is ApiWeatherEnable { // eslint-disable-line @typescript-eslint/no-explicit-any
  return 'enable' in params && typeof params.enable === 'boolean' && params.enable &&
    'interval' in params && typeof params.interval === 'number' && params.interval > 0 &&
    'name' in params && typeof params.name === 'string' && SOURCE_NAME.find(name => name === params.name) !== undefined &&
    'lat' in params && typeof params.lat === 'number' &&
    'lon' in params && typeof params.lon === 'number' &&
    validator.isLatLong(`${String(params.lat)},${String(params.lon)}`) &&
    'units' in params && typeof params.units === 'string' && SOURCE_UNITS.find(units => units === params.units) !== undefined &&
    'apiKey' in params && typeof params.apiKey === 'string' && validator.isAlphanumeric(params.apiKey) && params.apiKey.length === 32;
}
