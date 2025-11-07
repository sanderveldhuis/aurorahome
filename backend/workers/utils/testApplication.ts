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
  ipc
} from 'glidelite';

ipc.start('unknown', glconfig.shelly.endpoint, glconfig.status.endpoint);

// let on = false;
const interval = setInterval(() => {
  // ipc.to.shelly.indication('E4B063E5C430', { id: 0, on });
  // on = !on;
  // ipc.to.shelly.indication('E4B063D9D460', { id: 0, on: true, brightness: 31 });

  ipc.to[glconfig.status.endpoint].request('get', undefined, (name, payload) => {
    console.log(payload);
  });
}, 5000);

// Gracefully shutdown
process.on('SIGINT', () => {
  clearInterval(interval);
  ipc.stop();
});
