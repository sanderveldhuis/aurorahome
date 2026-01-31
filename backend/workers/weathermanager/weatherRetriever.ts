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

import { IpcWeatherData } from './types';

/**
 * The status of a weather data retrieval.
 */
export enum WeatherRetrieverStatus {
  Ok,
  Failed,
  Error
}

/**
 * The weather data retrieval result.
 */
export interface WeatherRetrieverResult {
  /** The status of the weahter data retrieval */
  status: WeatherRetrieverStatus;
  /** The retrieved weather data */
  data?: IpcWeatherData;
}

/**
 * Retrieves weather data from a weather source.
 */
export interface WeatherRetriever {
  /**
   * Retrieves weather data from a weather source.
   * @returns the weather data retrieval result
   */
  get(): WeatherRetrieverResult;
}
