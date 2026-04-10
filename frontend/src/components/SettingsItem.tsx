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

import type { ReactNode } from 'react';
import { toHtmlId } from '../utils/html';

/**
 * The settings item component showing items in accordion style.
 */
function SettingsItem({ name, health, children }: { name: string; health: string; children: ReactNode; }) {
  const id = `settings${toHtmlId(name)}`;
  return (
    <>
      <div className='card mb-2'>
        <div className='card-body'>
          <div className='d-grid'>
            <button className='btn btn-accordion collapsed d-flex align-items-center p-0' type='button' data-bs-toggle='collapse' data-bs-target={`#${id}`}>
              <div className={`me-auto ${health ? '' : 'placeholder'}`}>{name}</div>
              <span className={`p-2 rounded-circle ${health ? `bg-${health}` : 'placeholder'}`} />
            </button>
          </div>
          <div className='collapse' id={id} data-bs-parent='#settings'>
            <hr />
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsItem;
