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

import { WeatherRetriever } from './weatherRetriever';

/**
 * Retrieves actual weather from OpenWeatherMap One Call API 3.0.
 */
export class OpenWeatherMapV3 implements WeatherRetriever {
  _apiKey: string;

  /**
   * Constructs a new OpenWeatherMap One Call API 3.0 retriever.
   * @param apiKey the source API key from the config
   */
  constructor(apiKey: string) {
    this._apiKey = apiKey;
  }

  /**
   * Retrieves actual weather from OpenWeatherMap One Call API 3.0.
   */
  get(): void {
    // TODO: get the weather from the configured source
    // TODO: return the data and let the root application publish it via IPC
  }
}
