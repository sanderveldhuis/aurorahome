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
  WeatherManagerConfig,
  WeatherManagerStatusDetails
} from './types';
import {
  WeatherRetriever,
  WeatherRetrieverStatus
} from './weatherRetriever';

/**
 * A Weather Manager retrieving actual weather online and publishing the information via IPC.
 */
export class WeatherManager {
  _status: WeatherManagerStatusDetails = {};
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
   * Handles IPC publishes.
   * @param name the publish name
   * @param payload the publish payload
   */
  _onPublish(name: string, payload: IpcPayload): void {
    if (this._isConfigMessage(name, payload)) {
      this._handleConfig(payload);
    }
    else {
      log.weathermanager.error(`Received unknown publish with name: ${name}, payload: ${JSON.stringify(payload)}`);
    }
  }

  /**
   * Checks whether the specified message is a config message.
   * @param name the message name
   * @param payload the message payload
   * @returns `true` when the message is a config message, or `false` otherwise
   */
  _isConfigMessage(name: string, payload: IpcPayload): payload is WeatherManagerConfig {
    return name === 'WeatherManagerConfig' && typeof payload === 'object' && payload !== null && (!('source' in payload) ||
      ('interval' in (payload.source as object)) && ('name' in (payload.source as object)) && ('lat' in (payload.source as object)) && ('lon' in (payload.source as object)) && ('apiKey' in (payload.source as object)));
  }

  /**
   * Handles the specified configuration.
   * @param config the configuration
   */
  _handleConfig(config: WeatherManagerConfig): void {
    // Always cleanup for safety
    clearInterval(this._retrievalTimer);
    status.weathermanager.resetDetails();
    status.weathermanager.setHealth('running');

    // If no source is available the weather retrieval should stop
    if (!config.source) {
      log.weathermanager.info(`Stopped weather retrieval`);
      return;
    }

    // Construct the health status
    this._status = { source: config.source.name };
    status.weathermanager.setDetails(this._status);

    // Construct the dedicated weather retriever
    if (config.source.name === 'openweathermapV3') {
      this._weatherRetriever = new OpenWeatherMapV3(config.source.lat, config.source.lon, config.source.apiKey);
    }
    else {
      status.weathermanager.setHealth('instable');
      log.weathermanager.error(`Failed starting weather retrieval from '${config.source.name as string}': source not implemented`);
      return;
    }

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
    if (!this._weatherRetriever) {
      return;
    }

    const result = this._weatherRetriever.get();
    if (result.status === WeatherRetrieverStatus.Ok) {
      this._status.lastUpdate = Date.now();
      this._status.nextUpdate = Date.now() + (interval * 1000);
      status.weathermanager.setHealth('running');

      if (result.data) {
        ipc.publish('WeatherData', result.data);
      }
    }
    else {
      this._status.nextUpdate = Date.now() + (interval * 1000);
      status.weathermanager.setHealth('instable');
    }
  }
}
