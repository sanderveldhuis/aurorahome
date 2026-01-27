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
 * The Weather Manager weather data source.
 */
export interface WeatherManagerSource {
  /** Interval of fetching from the source in seconds */
  interval: number;
  /** The source name */
  name: 'openweathermapV3';
  /** The latitude geographic coordinate of the location */
  lat: number;
  /** The longitude geographic coordinate of the location */
  lon: number;
  /** The source API key */
  apiKey: string;
}

/**
 * The Weather Manager configuration.
 */
export interface WeatherManagerConfig {
  /** The source of the weather data, `undefined` means no weather should be fetched */
  source?: WeatherManagerSource;
}

/**
 * The Weather Manager status details.
 */
export interface WeatherManagerStatusDetails {
  /** The source of the weather data */
  source?: string;
  /** The timestamp of the last weather data update, `undefined` when not (yet) updated */
  lastUpdate?: number;
  /** The timestamp of the next weather data update */
  nextUpdate?: number;
}
