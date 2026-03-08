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
 * The application health.
 */
export type ApiStatusHealth = typeof STATUS_HEALTH[number];
const STATUS_HEALTH = ['starting', 'running', 'instable', 'disabled'] as const;

/**
 * The application status.
 */
export interface ApiApplicationStatus {
  /** The applicaton name */
  name: string;
  /** The application status health */
  health: ApiStatusHealth;
  /** Application status details (optional) */
  details?: object;
}

/**
 * The API response containing application statusses.
 */
export interface ApiStatusResponse {
  /** The applicaton statusses */
  applications: ApiApplicationStatus[];
}

/**
 * Checks whether the specified payload is an API Status response.
 * @param payload the response payload
 * @returns `true` when the payload is a Status response, or `false` otherwise
 */
export function isApiStatusResponse(payload: object | null): payload is ApiStatusResponse {
  if (payload === null || !('applications' in payload) || !Array.isArray(payload.applications)) {
    return false;
  }
  for (const obj of payload.applications) {
    if (typeof obj === 'object' && obj !== null) {
      const application = obj as object;
      if (
        'name' in application && typeof application.name === 'string' &&
        'health' in application && typeof application.health === 'string' && STATUS_HEALTH.find(health => health === application.health) !== undefined &&
        (!('details' in application) || ('details' in application && typeof application.details === 'object' && application.details !== null))
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
