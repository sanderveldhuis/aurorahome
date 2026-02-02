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
import {
  IpcStatus,
  StatusHealth,
  StatusType
} from './types';

/**
 * Helper class providing cyclic status reporting to the Status Manager.
 */
export class StatusReporter {
  _status: IpcStatus;
  _reportTimer: NodeJS.Timeout | undefined;

  /**
   * Constructs a new status reporter.
   * @param name the application name
   */
  constructor(name: string) {
    this._status = { name, type: 'worker', health: 'starting' };
  }

  /**
   * Starts reporting the status cyclic to the Status Manager.
   * @param type the application type
   * @param details the application status details (optional)
   */
  start(type: StatusType, details?: object): void {
    this._status.type = type;
    this._status.details = details;
    this._reportTimer = setInterval(() => {
      ipc.to.statusmanager.indication('Status', this._status);
    }, glconfig.status.interval);
  }

  /**
   * Stops reporting the status to the Status Manager.
   */
  stop(): void {
    clearInterval(this._reportTimer);
  }

  /**
   * Sets the health to be reported to the Status Manager.
   * @param health the health
   */
  setHealth(health: StatusHealth): void {
    this._status.health = health;
  }

  /**
   * Sets the status details to be reported to the Status Manager.
   * @param details the status details
   */
  setDetails(details: object): void {
    this._status.details = details;
  }

  /**
   * Resets the status details to be reported to the Status Manager.
   */
  clearDetails(): void {
    this._status.details = undefined;
  }
}

/**
 * Provides cyclic status reporting to the Status Manager.
 */
export const status: Record<string, StatusReporter> = new Proxy({}, {
  /**
   * The proxy is used to trap getting a specific status reporter by name and creates the status reporter if it does not yet exist.
   * @param target the target with created status reporter, default empty
   * @param name the status reporter name
   * @returns the existing or newly created status reporter
   */
  get(target: Record<string, StatusReporter>, name: string) {
    return target[name] ?? (target[name] = new StatusReporter(name));
  }
});
