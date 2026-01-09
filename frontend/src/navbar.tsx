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

import './navbar.css';

/* Import Bootstrap's plugins to enable functionality */

function Navbar() {
  // TODO: retrieve values via API

  return (
    <>
      <header className='navbar sticky-top flex-md-nowrap d-md-none p-0'>
        <button type='button' className='nav-link px-3' data-bs-toggle='offcanvas' data-bs-target='#userMenu'>
          <img src='https://github.com/sanderveldhuis.png' alt='' width='24' height='24' className='rounded-circle' />
        </button>
        <ul className='navbar-nav flex-row'>
          <li className='nav-item text-nowrap'>
            <button type='button' className='nav-link px-3 text-white' data-bs-toggle='offcanvas' data-bs-target='#navMenu'>
              <svg width='16' height='16' viewBox='0 0 16 16'>
                <path d='M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z' />
              </svg>
            </button>
          </li>
        </ul>
      </header>
    </>
  );
}

export default Navbar;
