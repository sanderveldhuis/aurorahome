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
  createContext,
  useContext
} from 'react';

/**
 * Interface defining the information of the Message Alert context.
 */
export interface MessageAlertContextType {
  error: string;
  warning: string;
  success: string;
  showError: React.Dispatch<React.SetStateAction<string>>;
  showWarning: React.Dispatch<React.SetStateAction<string>>;
  showSuccess: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Defines the Message Alert context.
 */
export const MessageAlertContext = createContext<MessageAlertContextType | undefined>(undefined);

/**
 * Returns the Message Alert, and functions to update it.
 * @returns the Message Alert
 */
export const useMessageAlert = () => {
  const context = useContext(MessageAlertContext);
  if (!context) {
    throw new Error('Component must be used within a MessageAlertProvider');
  }
  return context;
};
