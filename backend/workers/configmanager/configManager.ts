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
import { ConnectionStates } from 'mongoose';
import { status } from '../statusmanager/statusReporter';
import Config from './configModel';
import {
  CONFIG_NAME,
  IpcSetConfig,
  IpcSetConfigResponse
} from './types';

/**
 * A Config Manager handles configuration by storing it in a database and publishing it via IPC.
 */
export class ConfigManager {
  _publishRetryTimer: NodeJS.Timeout | undefined;
  _isRunning = true;

  /**
   * Starts the Config Manager.
   */
  start(): void {
    // Start IPC communication
    ipc.start('configmanager', 'statusmanager');
    ipc.onRequest((name, payload, response) => {
      this._onRequest(name, payload, response);
    });

    // Start status reporting
    status.configmanager.start('worker');

    // Start database connection
    this._connectDatabase();

    log.configmanager.info('Started');
  }

  /**
   * Stops the Config Manager.
   * @details the Config Manager should not be used anymore after being stopped
   */
  stop(): void {
    this._isRunning = false;

    // Stop publish retry timer
    clearTimeout(this._publishRetryTimer);

    // Stop database connection
    mongoose.connection.removeAllListeners();
    mongoose.disconnect().catch(() => {
      // Ignore
    });

    // Stop status reporting
    status.configmanager.stop();

    // Stop IPC communication
    ipc.stop();

    log.configmanager.info('Stopped');
  }

  /**
   * Connects to the database.
   */
  _connectDatabase(): void {
    // Start the connection
    mongoose.connect(glconfig.config.database, { serverSelectionTimeoutMS: 1000 }).then(() => {
      // Add listeners for future disconnect and connect events
      mongoose.connection.addListener('disconnected', () => {
        this._handleDatabaseDisconnect();
      });
      mongoose.connection.addListener('connected', () => {
        this._handleDatabaseConnect();
      });

      // Handle current connect
      this._handleDatabaseConnect();
    }).catch(() => {
      // This will only occur on initial connection
      if (this._isRunning) {
        this._connectDatabase();
      }
    });
  }

  /**
   * Handles database connection disconnect.
   */
  _handleDatabaseDisconnect(): void {
    status.configmanager.setHealth('instable');
    log.configmanager.warn(`Disconnected from database '${glconfig.config.database as string}'`);
  }

  /**
   * Handles database connection establishment.
   */
  _handleDatabaseConnect(): void {
    log.configmanager.info(`Connected to database '${glconfig.config.database as string}'`);
    this._publishAllConfigs();
  }

  /**
   * Publishes all available configurations.
   * @details should only be used after a database connection establishment
   */
  _publishAllConfigs(): void {
    // Find all available configurations
    Config.find().then(configs => {
      // Publish all available configurations
      for (const config of configs) {
        ipc.publish(`${config.name}Config`, config.config);
      }

      status.configmanager.setHealth('running');
      log.configmanager.info(`Published ${String(configs.length)} available configurations`);
    }).catch((error: unknown) => {
      if (this._isRunning) {
        // Start retry timer for publishing all available configurations
        this._publishRetryTimer = setTimeout(() => {
          this._publishAllConfigs();
        }, glconfig.config.databaseReadRetry);

        status.configmanager.setHealth('instable');
        log.configmanager.error(`Failed getting all available configurations from database: ${error instanceof Error ? error.message : 'unknown'}`);
      }
    });
  }

  /**
   * Handles received IPC requests.
   * @param name the request message name
   * @param payload the request payload
   * @param response the response function
   */
  _onRequest(name: string, payload: IpcPayload, response: (payload?: IpcPayload) => void): void {
    if (this._isSetConfigMessage(name, payload)) {
      log.configmanager.info(`Received SetConfig request via IPC for name '${payload.name}'`);
      this._handleSetConfigMessage(payload, response);
    }
    else {
      log.configmanager.warn(`Received unknown IPC request with name '${name}': ${JSON.stringify(payload)}`);
      response({ result: 'error' } as IpcSetConfigResponse);
    }
  }

  /**
   * Checks whether the specified message is a SetConfig message.
   * @param name the message name
   * @param payload the message payload
   * @returns `true` when the message is a SetConfig message, or `false` otherwise
   */
  _isSetConfigMessage(name: string, payload: IpcPayload): payload is IpcSetConfig {
    return name === 'SetConfig' && typeof payload === 'object' && payload !== null &&
      'name' in payload && typeof payload.name === 'string' && CONFIG_NAME.find(name => name === payload.name) !== undefined &&
      'config' in payload && typeof payload.config === 'object' && payload.config !== null;
  }

  /**
   * Handles SetConfig message.
   * @param setConfig the SetConfig message
   * @param response the response function
   */
  _handleSetConfigMessage(setConfig: IpcSetConfig, response: (payload?: IpcPayload) => void): void {
    // Do not try to update the database if not connected
    if (mongoose.connection.readyState !== ConnectionStates.connected) {
      response({ result: 'disconnected' } as IpcSetConfigResponse);
      return;
    }

    // Update or create configuration for the specified name
    Config.findOneAndUpdate({ name: setConfig.name }, setConfig, { upsert: true }).then(() => {
      response({ result: 'ok' } as IpcSetConfigResponse);

      // Publish the new configuration
      ipc.publish(`${setConfig.name}Config`, setConfig.config);
    }).catch((error: unknown) => {
      log.configmanager.error(`Failed SetConfig request via IPC for name '${setConfig.name}': ${error instanceof Error ? error.message : 'unknown'}`);
      response({ result: 'error' } as IpcSetConfigResponse);
    });
  }
}
