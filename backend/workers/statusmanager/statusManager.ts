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
import {
  IpcStatus,
  STATUS_HEALTH,
  STATUS_TYPE,
  StatusHealth,
  StatusType
} from './types';

/**
 * Defines the application status health, status details, and timestamp of the last update.
 */
export interface ApplicationStatus {
  /** Timestamp of the last status update */
  timestamp: number;
  /** The application status health */
  health: StatusHealth;
  /** The application status details */
  details?: object;
}

/**
 * A Status Manager keeping track of all application statusses.
 */
export class StatusManager {
  _applicationStatus: Record<StatusType, Record<string, ApplicationStatus>> = {} as Record<StatusType, Record<string, ApplicationStatus>>;
  _cleanupTimer: NodeJS.Timeout | undefined;

  /**
   * Starts the Status Manager.
   */
  start(): void {
    // Start IPC communication
    ipc.start('statusmanager');
    ipc.onIndication((name, payload) => {
      this._onIndication(name, payload);
    });
    ipc.onRequest((name, payload, response) => {
      this._onRequest(name, payload, response);
    });

    // Start cleanup timer
    this._cleanupTimer = setInterval(() => {
      this._cleanupExpiredStatus();
    }, 60000);

    log.statusmanager.info('Started');
  }

  /**
   * Stops the Status Manager.
   * @details the Status Manager should not be used anymore after being stopped
   */
  stop(): void {
    // Stop cleanup timer
    clearInterval(this._cleanupTimer);

    // Stop IPC communication
    ipc.stop();

    log.statusmanager.info('Stopped');
  }

  /**
   * Cleans applications which do not report a status anymore to prevent overflooding memory.
   */
  _cleanupExpiredStatus(): void {
    const now = Date.now();
    for (const applications of Object.values(this._applicationStatus)) {
      for (const name of Object.keys(applications)) {
        if (applications[name].timestamp + glconfig.status.validity < now) {
          delete applications[name]; /* eslint-disable-line @typescript-eslint/no-dynamic-delete */
        }
      }
    }
  }

  /**
   * Handles received IPC indications.
   * @param name the indication message name
   * @param payload the indication payload
   */
  _onIndication(name: string, payload: IpcPayload): void {
    if (this._isStatusMessage(name, payload)) {
      this._handleStatusMessage(payload);
    }
    else {
      log.statusmanager.warn(`Received unknown IPC indication with name: ${name}: ${JSON.stringify(payload)}`);
    }
  }

  /**
   * Checks whether the specified message is a Status message.
   * @param name the message name
   * @param payload the message payload
   * @returns `true` when the message is a Status message, or `false` otherwise
   */
  _isStatusMessage(name: string, payload: IpcPayload): payload is IpcStatus {
    return name === 'Status' && typeof payload === 'object' && payload !== null &&
      'name' in payload && typeof payload.name === 'string' &&
      'type' in payload && typeof payload.type === 'string' && STATUS_TYPE.find(type => type === payload.type) !== undefined &&
      'health' in payload && typeof payload.health === 'string' && STATUS_HEALTH.find(health => health === payload.health) !== undefined &&
      (!('status' in payload) || (typeof payload.status === 'object' && payload.status !== null));
  }

  /**
   * Handles Status message.
   * @param status the Status message
   */
  _handleStatusMessage(status: IpcStatus): void {
    // Add type to application status list
    if (!Object.keys(this._applicationStatus).includes(status.type)) {
      this._applicationStatus[status.type] = {} as Record<string, ApplicationStatus>;
    }

    // Add application status to application status list
    this._applicationStatus[status.type][status.name] = { timestamp: Date.now(), health: status.health, details: status.details };
  }

  /**
   * Handles received IPC requests.
   * @param name the request message name
   * @param payload the request payload
   * @param response the response function
   */
  _onRequest(name: string, payload: IpcPayload, response: (payload?: IpcPayload) => void): void {
    // TODO: implement once known which request we require
    response({ result: 'not implemented' });
  }
}
