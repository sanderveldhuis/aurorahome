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

import { WeatherManagerConfig } from '../weathermanager/types';

/**
 * The IPC message for setting configuration in the Config Manager.
 * @details the message ID for this message is 'SetConfig'
 */
export interface IpcSetConfig {
  /** The name of the configuration */
  name: string;
  /** The configuration for the name */
  config: object;
}

/**
 * The IPC result message for setting configuration in the Config Manager.
 */
export interface IpcSetConfigResult {
  /** The result of setting the configuration */
  result: 'ok' | 'disconnected' | 'error';
}

/**
 * The IPC message for setting Weather Manager configuration in the Config Manager.
 * @details the message ID for this message is 'SetConfig'
 */
export type WeatherManagerSetConfig = IpcSetConfig & {
  /** The name of the Weather Manager configuration */
  name: 'WeatherManager';
  /** The Weather Manager configuration */
  config: WeatherManagerConfig;
};
