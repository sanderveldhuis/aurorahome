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
 * The status reporter health:
 * - running - indicates the application is started and operationable
 * - instable - indicates the application has some issues but is still operationable
 */
export type StatusReporterHealth = 'running' | 'instable';

/**
 * The status reporter type:
 * - worker - indicates the application is a AuroraHome worker
 * - shelly - indicates the application is a Shelly device
 */
export type StatusReporterType = 'worker' | 'shelly';

/**
 * Class providing cyclic status reporting to the Status Manager.
 */
export class StatusReporter {
  _health: StatusReporterHealth | 'starting' = 'starting';
  _status: object | undefined;
  _interval: NodeJS.Timeout | undefined;

  /**
   * Starts reporting the status cyclic to the Status Manager.
   * @param name the application name
   * @param type the application name
   * @param status the application status (optional)
   */
  start(name: string, type: StatusReporterType, status?: object) {
    this._status = status;
    this._interval = setInterval(() => {
      ipc.to[glconfig.status.endpoint].indication('status', { health: this._health, name, type, status: this._status });
    }, glconfig.status.interval);
  }

  /**
   * Stops reporting the status to the Status Manager.
   */
  stop() {
    clearInterval(this._interval);
  }

  /**
   * Sets the health to be reported to the Status Manager.
   * @param health the health
   */
  setHealth(health: StatusReporterHealth) {
    this._health = health;
  }

  /**
   * Sets the status to be reported to the Status Manager.
   * @param status the status
   */
  setStatus(status: object) {
    this._status = status;
  }
}
