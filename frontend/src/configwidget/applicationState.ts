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
import { toHtmlId } from '../utils/html';

/**
 * Defines an application state.
 */
class ApplicationState {
  _id: string;
  _name: string;
  _health: string;
  _setHealth: React.Dispatch<React.SetStateAction<string>>;
  _details: Record<string, string>;
  _setDetails: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  /**
   * Constructs an application state.
   * @param name the application name
   */
  constructor(name: string) {
    this._id = toHtmlId(name);
    this._name = name;
    [this._health, this._setHealth] = useState('');
    [this._details, this._setDetails] = useState({});
  }

  /**
   * Returns the application HTML identifier.
   * @returns the application HTML identifier
   */
  getId(): string {
    return this._id;
  }

  /**
   * Returns the application name.
   * @returns the application name
   */
  getName(): string {
    return this._name;
  }

  /**
   * Returns the application health.
   * @returns the application health
   */
  getHealth(): string {
    return this._health;
  }

  /**
   * Sets the application health.
   * @param value the application health
   */
  setHealth(value: string): void {
    this._setHealth(value);
  }

  /**
   * Returns the application details.
   * @returns the application details
   */
  getDetails(): Record<string, string> {
    return this._details;
  }

  /**
   * Sets the application details.
   * @param value the application details
   */
  setDetails(value: Record<string, string>): void {
    // Check for changes in object because objects are references and assignment of
    // an object will always trigger a refresh as it is seen as a change in value
    if (JSON.stringify(value) !== JSON.stringify(this._details)) {
      this._setDetails(value);
    }
  }
}

export default ApplicationState;
