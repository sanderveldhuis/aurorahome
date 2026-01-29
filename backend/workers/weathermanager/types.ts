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
 * The weather data source name.
 */
export type SourceName = typeof SOURCE_NAME[number];
export const SOURCE_NAME = ['openweathermapV3'] as const;

/**
 * The weather data unit.
 */
export type SourceUnits = typeof SOURCE_UNITS[number];
export const SOURCE_UNITS = ['standard', 'metric', 'imperial'] as const;

/**
 * The Weather Manager weather data source.
 */
export interface WeatherManagerSource {
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
 * The Weather Manager configuration.
 */
export interface WeatherManagerConfig {
  /** The source of the weather data, `undefined` means no weather should be retrieved */
  source?: WeatherManagerSource;
}

/**
 * The Weather Manager status details.
 */
export interface WeatherManagerStatusDetails {
  /** The source of the weather data */
  source: string;
  /** The timestamp of the last weather data update, `undefined` when not (yet) updated */
  lastUpdate?: number;
  /** The timestamp of the next weather data update */
  nextUpdate?: number;
}

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
  // TODO: extend with required data once widget is implemented
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
 * The IPC message for published weather data from Weather Manager.
 * @details the message ID for this message is 'WeatherData'
 */
export interface IpcWeatherData {
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
