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
  StatusHealth,
  StatusMessage,
  StatusType
} from '../types/status';

interface DeviceStatus {
  timestamp: number;
  health: StatusHealth;
  status?: object;
}

const STATUS_VALID_TIMEOUT = 5000;

/**
 * A Status Manager handling all devices and workers.
 */
export class StatusManager {
  _deviceStatus: Record<StatusType, Record<string, DeviceStatus>> = {} as Record<StatusType, Record<string, DeviceStatus>>;

  /**
   * Starts the Status Manager.
   */
  start(): void {
    ipc.start(glconfig.status.endpoint);
    ipc.onIndication((name, payload) => {
      this._onIndication(name, payload);
    });
    ipc.onRequest((name, payload, response) => {
      this._onRequest(name, payload, response);
    });

    log.statusmanager.info('Started');
  }

  /**
   * Stops the Status Manager.
   * @details the Status Manager should not be used anymore after being stopped
   */
  stop(): void {
    ipc.stop();
    log.statusmanager.info('Stopped');
  }

  /**
   * Cleans devices which do not report a status anymore.
   */
  _cleanupOldDevices(): void {
    const now = Date.now();
    for (const devices of Object.values(this._deviceStatus)) {
      for (const name of Object.keys(devices)) {
        if (devices[name].timestamp + STATUS_VALID_TIMEOUT < now) {
          delete devices[name]; /* eslint-disable-line @typescript-eslint/no-dynamic-delete */
        }
      }
    }
  }

  /**
   * Handles IPC indications.
   * @param name the indication name
   * @param payload the indication payload
   */
  _onIndication(name: string, payload: IpcPayload): void {
    if (this._isStatusMessage(name, payload)) {
      this._handleStatusMessage(payload);
    }
    else {
      log.statusmanager.error(`Received unknown indication with name: ${name}, payload: ${JSON.stringify(payload)}`);
    }
  }

  /**
   * Handles IPC requests.
   * @param name the request name
   * @param payload the request payload
   * @param response the response callback
   */
  _onRequest(name: string, payload: IpcPayload, response: (payload?: IpcPayload) => void): void {
    this._cleanupOldDevices();
    // TODO: implement once known which request we require
    response(this._deviceStatus);
  }

  /**
   * Checks whether the specified message is a status message.
   * @param name the message name
   * @param payload the message payload
   * @returns `true` when the message is a status message, or `false` otherwise
   */
  _isStatusMessage(name: string, payload: IpcPayload): payload is StatusMessage {
    return name === 'Status' && typeof payload === 'object' && payload !== null && 'name' in payload && 'type' in payload && 'health' in payload;
  }

  /**
   * Handles the specified status message.
   * @param message the status message
   */
  _handleStatusMessage(message: StatusMessage): void {
    // Add type to device status list
    if (!Object.keys(this._deviceStatus).includes(message.type)) {
      this._deviceStatus[message.type] = {} as Record<string, DeviceStatus>;
    }

    // Add device status to device status list
    this._deviceStatus[message.type][message.name] = { timestamp: Date.now(), health: message.health, status: message.status };
  }
}
