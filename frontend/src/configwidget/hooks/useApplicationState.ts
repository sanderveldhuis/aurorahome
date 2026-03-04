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

import { useState } from 'react';
import { toHtmlId } from '../../utils/html';

/**
 * The application state.
 */
interface ApplicationState {
  /** The HTML element identifier */
  id: string;
  /** The application name */
  name: string;
  /** The application health */
  health: string;
  /** The application details */
  details: Record<string, string>;
  /**
   * Sets the application health.
   * @param value the application health
   */
  setHealth: (value: string) => void;
  /**
   * Sets the application details.
   * @param value the application details
   */
  setDetails: (value: Record<string, string>) => void;
}

/**
 * Defines an application state.
 * @param applicationName the application name
 * @returns the application state
 */
function useApplicationState(applicationName: string): ApplicationState {
  const id = toHtmlId(applicationName);
  const name = applicationName;
  const [health, setHealthInternal] = useState('');
  const [details, setDetailsInternal] = useState<Record<string, string>>({});

  function setHealth(value: string): void {
    setHealthInternal(value);
  }

  function setDetails(value: Record<string, string>): void {
    // Check for changes in object because objects are references and assignment of
    // an object will always trigger a refresh as it is seen as a change in value
    if (JSON.stringify(value) !== JSON.stringify(details)) {
      setDetailsInternal(value);
    }
  }

  return {
    id,
    name,
    health,
    details,
    setHealth,
    setDetails
  };
}

export default useApplicationState;
