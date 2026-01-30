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

import {
  ipc,
  log
} from 'glidelite';
import { IpcPayload } from 'glidelite/lib/ipcMessage';
import { status } from '../statusmanager/statusReporter';
import { OpenWeatherMapV3 } from './openweathermapV3';
import {
  IpcWeatherManagerConfig,
  SOURCE_NAME,
  SOURCE_UNITS,
  WeatherManagerStatusDetails
} from './types';
import {
  WeatherRetriever,
  WeatherRetrieverStatus
} from './weatherRetriever';

/**
 * A Weather Manager retrieving weather data from a configured source and publishing the weather data via IPC.
 */
export class WeatherManager {
  _statusDetails: WeatherManagerStatusDetails | undefined;
  _weatherRetriever: WeatherRetriever | undefined;
  _retrievalTimer: NodeJS.Timeout | undefined;

  /**
   * Starts the Weather Manager.
   */
  start(): void {
    // Start IPC communication
    ipc.start('weathermanager', 'statusmanager', 'configmanager');
    ipc.to.configmanager.subscribe('WeatherManagerConfig', (name, payload) => {
      this._onPublish(name, payload);
    });

    // Start status reporting
    status.weathermanager.start('worker');
    status.weathermanager.setHealth('running');

    log.weathermanager.info('Started');
  }

  /**
   * Stops the Weather Manager.
   * @details the Weather Manager should not be used anymore after being stopped
   */
  stop(): void {
    // Stop retrieving weather
    clearInterval(this._retrievalTimer);

    // Stop status reporting
    status.weathermanager.stop();

    // Stop IPC communication
    ipc.stop();

    log.weathermanager.info('Stopped');
  }

  /**
   * Handles received IPC publishes.
   * @param name the publish message name
   * @param payload the publish payload
   */
  _onPublish(name: string, payload: IpcPayload): void {
    if (this._isWeatherManagerConfigMessage(name, payload)) {
      log.weathermanager.info('Received WeatherManagerConfig publish via IPC');
      this._handleWeatherManagerConfig(payload);
    }
    else {
      log.weathermanager.warn(`Received unknown IPC publish with name '${name}': ${JSON.stringify(payload)}`);
    }
  }

  /**
   * Checks whether the specified message is a WeatherManagerConfig message.
   * @param name the message name
   * @param payload the message payload
   * @returns `true` when the message is a WeatherManagerConfig message, or `false` otherwise
   */
  _isWeatherManagerConfigMessage(name: string, payload: IpcPayload): payload is IpcWeatherManagerConfig {
    return name === 'WeatherManagerConfig' && typeof payload === 'object' && payload !== null &&
      (!('source' in payload) || (typeof payload.source === 'object' && payload.source !== null &&
        'interval' in payload.source && typeof payload.source.interval === 'number' &&
        'name' in payload.source && typeof payload.source.name === 'string' &&
        // @ts-ignore-line
        SOURCE_NAME.find(name => name === payload.source.name) !== undefined &&
        'lat' in payload.source && typeof payload.source.lat === 'number' &&
        'lon' in payload.source && typeof payload.source.lon === 'number' &&
        'units' in payload.source && typeof payload.source.units === 'string' &&
        // @ts-ignore-line
        SOURCE_UNITS.find(units => units === payload.source.units) !== undefined &&
        'apiKey' in payload.source && typeof payload.source.apiKey === 'string'));
  }

  /**
   * Handles WeatherManagerConfig message.
   * @param config the WeatherManagerConfig message
   */
  _handleWeatherManagerConfig(config: IpcWeatherManagerConfig): void {
    // Always cleanup for safety
    clearInterval(this._retrievalTimer);
    status.weathermanager.clearDetails();
    status.weathermanager.setHealth('running');

    // If no source is available the weather retrieval should stop
    if (!config.source) {
      log.weathermanager.info(`Stopped weather retrieval`);
      return;
    }

    // Construct the status details
    this._statusDetails = { source: config.source.name };
    status.weathermanager.setDetails(this._statusDetails);

    // Construct the dedicated weather retriever
    // TODO: currently only supporting OpenWeatherMapV3, add if-statement once more protocols are supported
    this._weatherRetriever = new OpenWeatherMapV3(config.source.lat, config.source.lon, config.source.units, config.source.apiKey);

    // Start the weather retriever
    this._retrievalTimer = setInterval(() => {
      this._executeWeatherRetriever(config.source?.interval ?? 0);
    }, config.source.interval * 1000);
    this._executeWeatherRetriever(config.source.interval);

    log.weathermanager.info(`Started weather retrieval from '${config.source.name}' each ${String(config.source.interval)} seconds`);
  }

  /**
   * Executes the weather retriever and stores the results.
   * @param interval the interval in seconds
   */
  _executeWeatherRetriever(interval: number): void {
    if (!this._weatherRetriever || !this._statusDetails) {
      // Should not happen
      return;
    }

    // Get weather data using the weather retriever
    const result = this._weatherRetriever.get();
    if (result.status === WeatherRetrieverStatus.Ok) {
      // Set status details
      this._statusDetails.lastUpdate = Date.now();
      this._statusDetails.nextUpdate = Date.now() + (interval * 1000);
      status.weathermanager.setHealth('running');

      // Publish weather data if available
      if (result.data) {
        ipc.publish('WeatherData', result.data);
      }
    }
    else {
      // Set status details
      this._statusDetails.nextUpdate = Date.now() + (interval * 1000);
      status.weathermanager.setHealth('instable');
    }
  }
}
