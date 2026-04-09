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
 * The log level.
 */
export type ApiLogLevel = typeof LOG_LEVEL[number];
const LOG_LEVEL = ['ERR', 'WRN', 'INF', 'DBG'] as const;

/**
 * The log message.
 */
export interface ApiLogMessage {
  /** The timestamp of the log message in milliseconds */
  timestamp: number;
  /** The level of the log message */
  level: ApiLogLevel;
  /** The applicaton name of the log message */
  name: string;
  /** The log message */
  message: string;
}

/**
 * The API response containing logs.
 */
export interface ApiLogResponse {
  /** The log messages */
  logs: ApiLogMessage[];
}

/**
 * Checks whether the specified payload is an API Log response.
 * @param payload the response payload
 * @returns `true` when the payload is a Log response, or `false` otherwise
 */
export function isApiLogResponse(payload: object | null): payload is ApiLogResponse {
  if (payload === null || !('logs' in payload) || !Array.isArray(payload.logs)) {
    return false;
  }
  for (const obj of payload.logs) {
    if (typeof obj === 'object' && obj !== null) {
      const log = obj as object;
      if (
        'timestamp' in log && typeof log.timestamp === 'number' &&
        'level' in log && typeof log.level === 'string' && LOG_LEVEL.find(level => level === log.level) !== undefined &&
        'name' in log && typeof log.name === 'string' &&
        'message' in log && typeof log.message === 'string'
      ) {
        // Log message is ok
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
