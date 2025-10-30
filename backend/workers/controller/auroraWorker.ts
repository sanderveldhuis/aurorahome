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
  ipc
} from 'glidelite';

/**
 * The AuroraHome worker status:
 * - running - indicates the worker is started and operationable
 * - instable - indicates the worker has some issues but is still operationable
 */
export type AuroraWorkerStatus = 'running' | 'instable';

/**
 * Super class for AuroraHome workers providing IPC startup and shutdown, and health reporting.
 */
export abstract class AuroraWorker {
  _status: AuroraWorkerStatus | 'starting' = 'starting';
  _interval: NodeJS.Timeout | undefined;

  /**
   * Starts the AuroraHome worker by starting IPC and health reporting.
   * @param name the IPC endpoint name, should be unique for the project
   */
  start(name: string) {
    ipc.start(name, glconfig.health.endpoint);
    this._interval = setInterval(() => {
      ipc.to[glconfig.health.endpoint].indication('health', { status: this._status });
    }, glconfig.health.interval);
  }

  /**
   * Stops the AuroraHome worker by stopping IPC and health reporting.
   */
  stop() {
    clearInterval(this._interval);
    ipc.stop();
  }

  /**
   * Sets the AuroraHome worker status for health reporting.
   * @param status the status
   */
  setStatus(status: AuroraWorkerStatus) {
    this._status = status;
  }
}
