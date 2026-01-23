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
import mongoose from 'mongoose';
import { StatusReporter } from '../controller/statusReporter';
import { WeatherManagerConfig } from '../types/config';
import Config from './configModel';

/**
 * A Config Manager handles configuration by storing it in a database and publishing it via IPC.
 */
export class ConfigManager {
  _statusReporter = new StatusReporter();

  /**
   * Starts the Config Manager.
   */
  start(): void {
    // Start IPC communication
    ipc.start(glconfig.config.endpoint, glconfig.status.endpoint);
    ipc.onRequest((name, payload, response) => {
      this._onRequest(name, payload, response);
    });

    // Start status reporting
    this._statusReporter.start(glconfig.config.endpoint, 'worker');

    // Start database connection
    this._connectDatabase();

    log.configmanager.info('Started');
  }

  /**
   * Stops the Config Manager.
   * @details the Config Manager should not be used anymore after being stopped
   */
  stop(): void {
    // Stop database connection
    mongoose.connection.removeAllListeners();
    mongoose.disconnect();

    // Stop status reporting
    this._statusReporter.stop();

    // Stop IPC communication
    ipc.stop();

    log.configmanager.info('Stopped');
  }

  /**
   * Connects to the database.
   */
  _connectDatabase(): void {
    // Remove old connection listeners and add new connection listeners
    mongoose.connection.removeAllListeners();
    mongoose.connection.addListener('connected', () => {
      this._statusReporter.setHealth('running');
      log.configmanager.info(`Connected to database '${glconfig.config.database as string}'`);
    });
    mongoose.connection.addListener('disconnected', () => {
      this._statusReporter.setHealth('instable');
      log.configmanager.warn(`Disconnected from database '${glconfig.config.database as string}'`);
    });

    // Start the connection
    mongoose.connect(glconfig.config.database).then(() => {
      // Reconnect is performed by Mongoose
    }).catch((error: unknown) => {
      // This will only occur on startup
      this._connectDatabase();
    });
  }

  /**
   * Handles received IPC requests.
   * @param name the request message name
   * @param payload the request payload
   * @param response the response function
   */
  _onRequest(name: string, payload: IpcPayload, response: (payload?: IpcPayload) => void): void {
    console.log('Received request with name:', name, 'payload:', payload);
    // TODO: implement GetConfig and SetConfig

    // TODO: somehow ensure it times out after 3 seconds or something
    Config.find().then(configs => {
      console.log(configs);

      const msg: WeatherManagerConfig = {};
      msg.source = { interval: 2, lat: 52.368230, lon: 6.772290, name: 'openweathermapV3', apiKey: '36fed7a1ef0bc680402a9a0e7b9967e2' }; // 36fed7a1ef0bc680402a9a0e7b9967e2
      ipc.publish('WeatherManagerConfig', msg);

      response({ result: 'successful' });
    }).catch((error: unknown) => {
      log.configmanager.error(`Failed finding configuration`);
      response({ result: 'error' });
    });
  }
}
