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

import { useEffect } from 'react';
import { useMessageAlert } from '../hooks/useMessageAlert';

/**
 * Append a new alert to the window.
 * @param message the message
 * @param state the state
 */
function appendAlert(message: string, state: string): void {
  const messageAlert = document.getElementById('message-alert');
  if (messageAlert) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
      `<div class="alert alert-${state} alert-dismissible show fade rounded-0 mb-0" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert"></button>',
      '</div>'
    ].join('');
    messageAlert.append(wrapper);
  }
}

/**
 * The Message Alert component showing messages in an alert on top of the window.
 */
function MessageAlert() {
  // Use the Message Alert context
  const context = useMessageAlert();

  // Show the alert based on changes in the context
  useEffect(() => {
    if (context.success !== '') {
      appendAlert(context.success, 'success');
    }
    else if (context.warning !== '') {
      appendAlert(context.warning, 'warning');
    }
    else if (context.error !== '') {
      appendAlert(context.error, 'error');
    }
  }, [context]);

  return (
    <>
      <div className='message-alert' id='message-alert' />
    </>
  );
}

export default MessageAlert;
