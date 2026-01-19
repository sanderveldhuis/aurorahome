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
 * The Weather Manager source name.
 */
export type WeatherManagerSourceName = 'openweathermapV3' | 'TBD';

/**
 * The Weather Manager weather source.
 */
export interface WeatherManagerSource {
  /** Interval of weather retrieval from the specified source in seconds */
  interval: number;
  /** The source name */
  name: WeatherManagerSourceName;
  /** The latitude geographic coordinate of the location */
  lat: number;
  /** The longitude geographic coordinate of the location */
  lon: number;
  /** The source API key */
  apiKey: string;
}

/**
 * The Weather Manager configuration message name for IPC.
 */
export type WeatherManagerMessageName = 'WeatherManagerConfig';

/**
 * The IPC message for the Weather Manager configuration.
 */
export interface WeatherManagerConfig {
  /** The source to retrieve the weather from, empty means no weather is retrieved */
  source?: WeatherManagerSource;
}
