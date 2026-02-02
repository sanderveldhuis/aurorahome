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

import { log } from 'glidelite';
import syncFetch from 'sync-fetch';
import {
  IpcWeatherData,
  SourceUnits
} from './types';
import {
  WeatherRetriever,
  WeatherRetrieverResult,
  WeatherRetrieverStatus
} from './weatherRetriever';

/**
 * Retrieves weather data from OpenWeatherMap One Call API 3.0.
 */
export class OpenWeatherMapV3 implements WeatherRetriever {
  _lat: number;
  _lon: number;
  _units: SourceUnits;
  _apiKey: string;

  /**
   * Constructs a new OpenWeatherMap One Call API 3.0 retriever.
   * @param lat the latitude geographic coordinate of the location
   * @param lon the longitude geographic coordinate of the location
   * @param apiKey the weather source API key
   */
  constructor(lat: number, lon: number, units: SourceUnits, apiKey: string) {
    this._lat = lat;
    this._lon = lon;
    this._units = units;
    this._apiKey = apiKey;
  }

  /**
   * Retrieves weather data from OpenWeatherMap One Call API 3.0.
   * @returns the weather data retrieval result
   */
  get(): WeatherRetrieverResult {
    let response;

    // Try to retrieve the weather data
    try {
      response = syncFetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${String(this._lat)}&lon=${String(this._lon)}&appid=${this._apiKey}&units=${this._units}`);
    }
    catch (error: unknown) {
      log.weathermanager.error(`Failed retrieving weather data from 'openweathermapV3': ${error instanceof Error ? error.message : 'unknown'}`);
      return { status: WeatherRetrieverStatus.Error };
    }

    // Stop if failed to retrieve the weather data
    if (response.status !== 200) {
      log.weathermanager.error(`Failed retrieving weather data from 'openweathermapV3': status code ${String(response.status)}`);
      return { status: WeatherRetrieverStatus.Failed };
    }

    // Construct the response JSON and return data
    const json = response.json(); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
    const data: IpcWeatherData = {};

    // Current weather data
    if (json.current) {
      data.current = {
        timestamp: (json.current.dt ?? 0) as number,
        temperature: (json.current.temperature ?? 0) as number,
        feelsLike: (json.current.feels_like ?? 0) as number,
        humidity: (json.current.humidity ?? 0) as number
      };
    }
    // Minutely weather data
    if (json.minutely) {
      data.minutely = [];
      for (const minute of json.minutely) {
        data.minutely.push({
          timestamp: (minute.dt ?? 0) as number,
          precipitation: (minute.precipitation ?? 0) as number
        });
      }
    }
    // Hourly weather data
    if (json.hourly) {
      data.hourly = [];
      for (const hour of json.hourly) {
        data.hourly.push({
          timestamp: (hour.dt ?? 0) as number
        });
      }
    }
    // Daily weather data
    if (json.daily) {
      data.daily = [];
      for (const day of json.daily) {
        data.daily.push({
          timestamp: (day.dt ?? 0) as number
        });
      }
    }
    // Weather alerts data
    if (json.alerts) {
      data.alerts = [];
      for (const alert of json.alerts) {
        data.alerts.push({
          event: (alert.event ?? '') as string,
          description: (alert.description ?? '') as string,
          start: (alert.start ?? 0) as number,
          end: (alert.end ?? 0) as number
        });
      }
    }

    return { status: WeatherRetrieverStatus.Ok, data };
  }
}
