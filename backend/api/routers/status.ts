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

import express from 'express';
import {
  ipc,
  log
} from 'glidelite';
import { IpcPayload } from 'glidelite/lib/ipcMessage';
import {
  IpcApplicationStatus,
  IpcStatus,
  STATUS_HEALTH,
  STATUS_TYPE
} from '../../ipc/statusManager';

let statusses: IpcApplicationStatus[] = [];

/**
 * Checks whether the specified message is a Status message.
 * @param name the message name
 * @param payload the message payload
 * @returns `true` when the message is a Status message, or `false` otherwise
 */
function isStatusMessage(name: string, payload: IpcPayload): payload is IpcStatus {
  if (
    name === 'Status' && typeof payload === 'object' && payload !== null &&
    'applications' in payload && typeof payload.applications === 'object' && Array.isArray(payload.applications)
  ) {
    for (const obj of payload.applications) {
      if (typeof obj === 'object' && obj !== null) {
        const applicationStatus = obj as object;
        if (
          'name' in applicationStatus && typeof applicationStatus.name === 'string' &&
          'type' in applicationStatus && typeof applicationStatus.type === 'string' && STATUS_TYPE.find(type => type === applicationStatus.type) !== undefined &&
          'health' in applicationStatus && typeof applicationStatus.health === 'string' && STATUS_HEALTH.find(health => health === applicationStatus.health) !== undefined &&
          (!('details' in applicationStatus) || ('details' in applicationStatus && typeof applicationStatus.details === 'object' && applicationStatus.details !== null))
        ) {
          // Application status is ok
          continue;
        }
        else {
          return false;
        }
      }
      else {
        return false;
      }
    }
  }
  else {
    return false;
  }

  return true;
}

// Subscribe to updates from the Status Manager
ipc.to.statusmanager.subscribe('Status', (name, payload) => {
  if (isStatusMessage(name, payload)) {
    statusses = payload.applications;
  }
  else {
    log.apiserver.warn(`Received unknown IPC publish with name: ${name}: ${JSON.stringify(payload)}`);
  }
});

// Construct the Express router
const router = express.Router();

// The router implementation
router.get('/status', (req, res) => {
  res.status(200).json(statusses);
});

export default router;
