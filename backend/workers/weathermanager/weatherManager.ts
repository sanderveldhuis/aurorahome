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
  glconfig,
  ipc,
  log
} from 'glidelite';
import { IpcPayload } from 'glidelite/lib/ipcMessage';
import { StatusReporter } from '../controller/statusReporter';
import { WeatherManagerConfig } from '../types/config';

/**
 * A Weather Manager retrieving actual weather online and publishing the information via IPC.
 */
export class WeatherManager {
  _statusReporter: StatusReporter = new StatusReporter();

  /**
   * Starts the Weather Manager.
   */
  start(): void {
    // Start IPC communication
    ipc.start(glconfig.weather.endpoint, glconfig.status.endpoint, glconfig.config.endpoint);
    ipc.to.configmanager.subscribe('WeatherManagerConfig', (name, payload) => {
      this._onPublish(name, payload);
    });

    // Start status reporting
    this._statusReporter.start(glconfig.weather.endpoint, 'worker');
    this._statusReporter.setHealth('running');

    log.weathermanager.info('Started');

  }

  /**
   * Stops the Weather Manager.
   * @details the Weather Manager should not be used anymore after being stopped
   */
  stop(): void {
    // Stop status reporting
    this._statusReporter.stop();

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
      return name === 'WeatherManagerConfig' && typeof payload === 'object' && payload !== null;
    }

    /**
     * Handles the specified configuration.
     * @param config the configuration
    */
    _handleConfig(config: WeatherManagerConfig): void {
      // TODO: get the weather from the configured source
      log.weathermanager.error(`Received config: ${JSON.stringify(config)}`);
    }
}
