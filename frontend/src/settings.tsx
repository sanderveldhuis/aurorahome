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

import './settings.css';

function Settings({ component }: { component: string; }) {
  if (component !== 'Settings') {
    return null;
  }

  return (
    <>
      <div className='row mb-3 mt-1 mt-md-3'>
        <div className='col-12'>
          <div className='card'>
            <div className='card-body'>
              Single card
            </div>
          </div>
        </div>
      </div>
      <div className='row mb-3'>
        <div className='col-6'>
          <div className='card'>
            <div className='card-body'>
              Split card
            </div>
          </div>
        </div>
        <div className='col-6 ps-0'>
          <div className='card'>
            <div className='card-body'>
              Split card
            </div>
          </div>
        </div>
      </div>
      <div className='row mb-3'>
        <div className='col-6'>
          <div className='card'>
            <div className='card-body'>
              Split card
            </div>
          </div>
        </div>
        <div className='col-2 ps-0'>
          <div className='card'>
            <div className='card-body'>
              Split card
            </div>
          </div>
        </div>
        <div className='col-4 ps-0'>
          <div className='card'>
            <div className='card-body'>
              Split card
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
