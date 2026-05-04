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

/**
 * Current weather data.
 */
export interface WeatherDataCurrent {
  /** The current timestamp */
  timestamp: number;
  /** The temperature, with units standard: kelvin, metric: celsius, imperial: fahrenheit */
  temperature: number;
  /** The human perception of temperature, with units standard: kelvin, metric: celsius, imperial: fahrenheit */
  feelsLike: number;
  /** The humidity percentage within range 0-100% */
  humidity: number;
  // TODO: extend with required data once widget is implemented
}

/**
 * Minutely forecast weather data.
 */
export interface WeatherDataMinutely {
  /** Timestamp of the forecast data */
  timestamp: number;
  /** Precipitation in mm/h, please note that only mm/h as units of measurement are available for this parameter */
  precipitation: number;
}

/**
 * Hourly forecast weather data.
 */
export interface WeatherDataHourly {
  /** Timestamp of the forecast data */
  timestamp: number;
  // TODO: extend with required data once widget is implemented
}

/**
 * Daily forecast weather data.
 */
export interface WeatherDataDaily {
  /** Timestamp of the forecast data */
  timestamp: number;
  /** The minimum daily temperature, with units standard: kelvin, metric: celsius, imperial: fahrenheit */
  min: number;
  /** The maximum daily temperature, with units standard: kelvin, metric: celsius, imperial: fahrenheit */
  max: number;
  /** The weather icon URL */
  icon: string;
}

/**
 * National weather alerts data from major national weather warning systems.
 */
export interface WeatherDataAlert {
  /** The alert event name */
  event: string;
  /** The description of the alert */
  description: string;
  /** Timestamp of the start of the alert */
  start: number;
  /** Timestamp of the end of the alert */
  end: number;
}

/**
 * The API response containing weather data.
 */
export interface ApiWeatherResponse {
  /** The current weather data */
  current?: WeatherDataCurrent;
  /** The minutely forecast weather data */
  minutely?: WeatherDataMinutely[];
  /** The hourly forecast weather data */
  hourly?: WeatherDataHourly[];
  /** The daily forecast weather data */
  daily?: WeatherDataDaily[];
  /** The national weather alerts data from major national weather warning systems */
  alerts?: WeatherDataAlert[];
}

/**
 * Checks whether the specified payload is an API Weather response.
 * @param payload the response payload
 * @returns `true` when the payload is a Weather response, or `false` otherwise
 */
export function isApiWeatherResponse(payload: object | null): payload is ApiWeatherResponse {
  if (
    payload === null ||
    ('minutely' in payload && !Array.isArray(payload.minutely)) ||
    ('hourly' in payload && !Array.isArray(payload.hourly)) ||
    ('daily' in payload && !Array.isArray(payload.daily)) ||
    ('alerts' in payload && !Array.isArray(payload.alerts))
  ) {
    return false;
  }
  if (
    'current' in payload && (typeof payload.current !== 'object' || payload.current === null ||
      !('timestamp' in payload.current) || typeof payload.current.timestamp !== 'number' ||
      !('temperature' in payload.current) || typeof payload.current.temperature !== 'number' ||
      !('feelsLike' in payload.current) || typeof payload.current.feelsLike !== 'number' ||
      !('humidity' in payload.current) || typeof payload.current.humidity !== 'number')
  ) {
    return false;
  }
  if ('minutely' in payload && Array.isArray(payload.minutely)) {
    for (const obj of payload.minutely) {
      if (typeof obj === 'object' && obj !== null) {
        const minutely = obj as object;
        if (
          'timestamp' in minutely && typeof minutely.timestamp === 'number' &&
          'precipitation' in minutely && typeof minutely.precipitation === 'number'
        ) {
          // Minutely data is ok
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
  if ('hourly' in payload && Array.isArray(payload.hourly)) {
    for (const obj of payload.hourly) {
      if (typeof obj === 'object' && obj !== null) {
        const hourly = obj as object;
        if ('timestamp' in hourly && typeof hourly.timestamp === 'number') {
          // Hourly data is ok
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
  if ('daily' in payload && Array.isArray(payload.daily)) {
    for (const obj of payload.daily) {
      if (typeof obj === 'object' && obj !== null) {
        const daily = obj as object;
        if ('timestamp' in daily && typeof daily.timestamp === 'number') {
          // Daily data is ok
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
  if ('alerts' in payload && Array.isArray(payload.alerts)) {
    for (const obj of payload.alerts) {
      if (typeof obj === 'object' && obj !== null) {
        const alert = obj as object;
        if (
          'event' in alert && typeof alert.event === 'string' &&
          'description' in alert && typeof alert.description === 'string' &&
          'start' in alert && typeof alert.start === 'number' &&
          'end' in alert && typeof alert.end === 'number'
        ) {
          // Alert data is ok
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
