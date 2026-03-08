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

import { IpcPayload } from 'glidelite/backend';

/**
 * The application type.
 */
export type StatusType = typeof STATUS_TYPE[number];
const STATUS_TYPE = ['worker', 'shellydevice'] as const;

/**
 * The application health.
 */
export type StatusHealth = typeof STATUS_HEALTH[number];
const STATUS_HEALTH = ['starting', 'running', 'instable', 'disabled'] as const;

/**
 * The IPC message for indicating statusses to the Status Manager.
 * @details the message ID for this message is 'Status'
 */
export interface IpcApplicationStatus {
  /** The applicaton name */
  name: string;
  /** The application status type */
  type: StatusType;
  /** The application status health */
  health: StatusHealth;
  /** Application status details (optional) */
  details?: object;
}

/**
 * Checks whether the specified message is an IPC Status message.
 * @param name the message name
 * @param payload the message payload
 * @returns `true` when the message is a Status message, or `false` otherwise
 */
export function isIpcApplicationStatusMessage(name: string, payload: IpcPayload): payload is IpcApplicationStatus {
  return name === 'Status' && typeof payload === 'object' && payload !== null &&
    'name' in payload && typeof payload.name === 'string' &&
    'type' in payload && typeof payload.type === 'string' && STATUS_TYPE.find(type => type === payload.type) !== undefined &&
    'health' in payload && typeof payload.health === 'string' && STATUS_HEALTH.find(health => health === payload.health) !== undefined &&
    (!('details' in payload) || (typeof payload.details === 'object' && payload.details !== null));
}

/**
 * The IPC message for published statusses from the Status Manager.
 * @details the message ID for this message is 'Status'
 */
export interface IpcStatus {
  applications: IpcApplicationStatus[];
}

/**
 * Checks whether the specified message is an IPC Status message.
 * @param name the message name
 * @param payload the message payload
 * @returns `true` when the message is a Status message, or `false` otherwise
 */
export function isIpcStatusMessage(name: string, payload: IpcPayload): payload is IpcStatus {
  if (name !== 'Status' || typeof payload !== 'object' || payload === null || !('applications' in payload) || !Array.isArray(payload.applications)) {
    return false;
  }
  for (const obj of payload.applications) {
    if (typeof obj === 'object' && obj !== null) {
      const applicationStatus = obj as object;
      if (
        'name' in applicationStatus && typeof applicationStatus.name === 'string' &&
        'type' in applicationStatus && typeof applicationStatus.type === 'string' && STATUS_TYPE.find(type => type === applicationStatus.type) !== undefined &&
        'health' in applicationStatus && typeof applicationStatus.health === 'string' && STATUS_HEALTH.find(health => health === applicationStatus.health) !== undefined &&
        (!('details' in applicationStatus) || (typeof applicationStatus.details === 'object' && applicationStatus.details !== null))
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
  return true;
}
