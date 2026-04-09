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
  IpcPayload,
  log
} from 'glidelite/backend';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  IpcGetLogResponse,
  isIpcGetLogMessage,
  LogMessage
} from '../../ipc/logManager';
import { status } from '../../ipc/statusReporter';

const MAX_RESPONSE_SIZE = 900000; // 0.9MB

/**
 * A Log Manager retrieving log data from log files and responds the log messages via IPC on requests.
 */
export class LogManager {
  /**
   * Starts the Log Manager.
   */
  start(): void {
    // Start IPC communication
    ipc.start('logmanager', 'statusmanager');
    ipc.onRequest((name, payload, response) => {
      this._onRequest(name, payload, response);
    });

    // Start status reporting
    status.logmanager.start('worker');
    status.logmanager.setHealth('running');

    log.logmanager.info('Started');
  }

  /**
   * Stops the Log Manager.
   * @details the Log Manager should not be used anymore after being stopped
   */
  stop(): void {
    // Stop status reporting
    status.logmanager.stop();

    // Stop IPC communication
    ipc.stop();

    log.logmanager.info('Stopped');
  }

  /**
   * Handles received IPC requests.
   * @param name the request message name
   * @param payload the request payload
   * @param response the response function
   */
  _onRequest(name: string, payload: IpcPayload, response: (payload?: IpcPayload) => void): void {
    if (isIpcGetLogMessage(name, payload)) {
      this._handleGetLogMessage(response);
    }
    else {
      log.logmanager.warn(`Received unknown IPC request with name '${name}': ${JSON.stringify(payload)}`);
      response({ result: 'error' } as IpcGetLogResponse);
    }
  }

  /**
   * Handles GetLog message.
   * @param getConfig the GetLog message
   * @param response the response function
   */
  _handleGetLogMessage(response: (payload?: IpcPayload) => void): void {
    const responseMsg: IpcGetLogResponse = { result: 'ok', logs: [] };

    // If the name element is available in the GlideLite configuration file it runs in production mode
    if ('name' in glconfig) {
      responseMsg.logs?.push(...this._readLog(join('/', 'var', 'log', glconfig.name as string, 'api.log')));
      responseMsg.logs?.push(...this._readLog(join('/', 'var', 'log', glconfig.name as string, 'api.log.1')));
      responseMsg.logs?.push(...this._readLog(join('/', 'var', 'log', glconfig.name as string, 'workers.log')));
      responseMsg.logs?.push(...this._readLog(join('/', 'var', 'log', glconfig.name as string, 'workers.log.1')));
    }
    else {
      responseMsg.logs?.push(...this._readLog(join(__dirname, 'example.log')));
    }

    // Prevent overflooding the IPC buffer which is 1MB
    const size = JSON.stringify(responseMsg).length;
    if (size > MAX_RESPONSE_SIZE) {
      log.logmanager.error(`Failed constructing IPC response due to exceeding IPC buffer size with '${String(size)}' bytes`);
      response({ result: 'error' } as IpcGetLogResponse);
    }
    else {
      response(responseMsg as IpcPayload);
    }
  }

  /**
   * Reads the log messages from the specified log file.
   * @param file the log file
   * @returns the log messages
   */
  _readLog(file: string): LogMessage[] {
    const logs: LogMessage[] = [];

    try {
      const content = readFileSync(file, 'utf8');

      // Parse all log messages
      const regex = new RegExp('^([\\d]+):(DBG|INF|WRN|ERR):([\\w]+):(.*?(?=^[\\d]+)|.*)', 'gms');
      let match = regex.exec(content);
      while (match) {
        // Statisfy TypeScript, should not happen otherwise the regex is invalid
        if (match[2] !== 'DBG' && match[2] !== 'INF' && match[2] !== 'WRN' && match[2] !== 'ERR') {
          continue;
        }
        logs.push({ timestamp: Number(match[1]), level: match[2], name: match[3], message: match[4].trim() });
        match = regex.exec(content);
      }
    }
    catch {
      // Ignore
    }

    return logs;
  }
}
