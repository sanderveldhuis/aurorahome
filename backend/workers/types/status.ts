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

/**
 * The status type.
 * @details
 * - worker - indicates the application is an AuroraHome worker
 * - shelly - indicates the application is a Shelly device
 */
export type StatusType = 'worker' | 'shelly';

/**
 * The status health.
 * @details
 * - starting - indicates the application is starting and not yet operationable
 * - running - indicates the application is started and operationable
 * - instable - indicates the application has some issues but is still operationable
 */
export type StatusHealth = 'starting' | 'running' | 'instable';

/**
 * The status message name for IPC.
 */
export type StatusMessageName = 'status';

/**
 * The status message for IPC.
 */
export interface StatusMessage {
  name: string;
  type: StatusType;
  health: StatusHealth;
  status?: object;
}
