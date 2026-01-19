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
import { WeatherData } from '../types/weather';
import {
  WeatherRetriever,
  WeatherRetrieverResult,
  WeatherRetrieverStatus
} from './weatherRetriever';

/**
 * Retrieves actual weather from OpenWeatherMap One Call API 3.0.
 */
export class OpenWeatherMapV3 implements WeatherRetriever {
  _lat: number;
  _lon: number;
  _apiKey: string;

  /**
   * Constructs a new OpenWeatherMap One Call API 3.0 retriever.
   * @param lat the latitude geographic coordinate of the location
   * @param lon the longitude geographic coordinate of the location
   * @param apiKey the source API key from the config
   */
  constructor(lat: number, lon: number, apiKey: string) {
    this._lat = lat;
    this._lon = lon;
    this._apiKey = apiKey;
  }

  /**
   * Retrieves actual weather from OpenWeatherMap One Call API 3.0.
   */
  get(): WeatherRetrieverResult {
    try {
      const response = syncFetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${String(this._lat)}&lon=${String(this._lon)}&appid=${this._apiKey}&units=metric`);
      if (response.status === 200) {
        // TODO: return the data
        console.log(response.json());

        const data: WeatherData = { timestamp: Date.now() };
        return { status: WeatherRetrieverStatus.Ok, data };
      }
      else {
        log.weathermanager.error(`Failed retrieving weather from 'openweathermapV3': status code ${String(response.status)}`);
        return { status: WeatherRetrieverStatus.Failed };
      }
    }
    catch (error) {
      log.weathermanager.error(`Failed retrieving weather from 'openweathermapV3': ${error as string}`);
      return { status: WeatherRetrieverStatus.Error };
    }
  }
}
