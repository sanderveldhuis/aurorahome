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
import { StatusReporter } from '../controller/statusReporter';

/**
 * A Config Manager handles configuration by storing it in a database and publishing it via IPC.
 */
export class ConfigManager {
  _statusReporter: StatusReporter = new StatusReporter();

  /**
   * Starts the Config Manager.
   */
  start(): void {
    // Start IPC communication
    ipc.start(glconfig.config.endpoint, glconfig.status.endpoint);

    // Start status reporting
    this._statusReporter.start(glconfig.config.endpoint, 'worker');

    // TODO: connect to the MongoDB and this._statusReporter.setHealth('running') once the connection to the database is established

    log.configmanager.info('Started');
  }

  /**
   * Stops the Config Manager.
   * @details the Config Manager should not be used anymore after being stopped
   */
  stop(): void {
    // Stop status reporting
    this._statusReporter.stop();

    // Stop IPC communication
    ipc.stop();

    log.configmanager.info('Stopped');
  }
}
