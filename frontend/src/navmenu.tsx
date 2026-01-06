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
import './navmenu.css';

function setActive(event: React.MouseEvent<HTMLLIElement>) {
  const elements = document.getElementsByClassName('nav-item active');
  for (const element of elements) {
    element.classList.remove('active');
  }
  event.currentTarget.classList.add('active');
}

function NavMenu({ setComponent }: { setComponent: React.Dispatch<React.SetStateAction<string>>; }) {
  const [expanded, setExpanded] = useState(false);

  // TODO: retrieve values via API, can be configured by the user
  const navItems = [
    { name: 'Dashboard', active: true, svgPaths: ['M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z'] },
    { name: 'Analysis', active: false, svgPaths: ['M0 0h1v15h15v1H0zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07'] }
  ];

  return (
    <>
      <div className='navmenu col-auto p-0'>
        <div className='offcanvas-md offcanvas-end' id='navMenu'>
          <div className='offcanvas-header'>
            <button type='button' className='btn-close btn-close-white' data-bs-dismiss='offcanvas' data-bs-target='#navMenu' />
          </div>
          <div className='offcanvas-body d-md-flex flex-column vh-100 p-0 overflow-y-auto'>
            <ul className='nav flex-column mb-auto'>
              {navItems.map(item => (
                <li
                  role='button'
                  className={'nav-item' + (item.active ? ' active' : '')}
                  data-bs-dismiss='offcanvas'
                  data-bs-target='#navMenu'
                  onClick={(event: React.MouseEvent<HTMLLIElement>) => {
                    setActive(event);
                    setComponent(item.name);
                  }}
                >
                  <div className='triangle' />
                  <button type='button' className={'nav-link d-flex align-items-center gap-2 mx-5' + (expanded ? '' : ' mx-md-3')}>
                    <svg width='16' height='16' viewBox='0 0 16 16'>{item.svgPaths.map(path => <path d={path} />)}</svg> <div className={expanded ? '' : 'd-md-none'}>{item.name}</div>
                  </button>
                </li>
              ))}
            </ul>
            <ul className='nav flex-column d-none d-md-block mb-2'>
              <li
                role='button'
                data-bs-toggle='offcanvas'
                data-bs-target='#userMenu'
              >
                <button type='button' className='nav-link d-flex align-items-center gap-2 mx-auto'>
                  <img src='https://github.com/sanderveldhuis.png' alt='' width={expanded ? '32' : '24'} height={expanded ? '32' : '24'} className='rounded-circle' />
                  {expanded && 'Veldhuis'}
                </button>
              </li>
              <li
                role='button'
                className='nav-item'
                onClick={() => {
                  setExpanded(!expanded);
                }}
              >
                <button type='button' className='nav-link d-flex align-items-center gap-2 mx-auto'>
                  <svg width='16' height='16' viewBox='0 0 16 16' className={expanded ? 'text-white-50' : 'd-none'}>
                    <path fill-rule='evenodd' d='M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0' />
                    <path fill-rule='evenodd' d='M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0' />
                  </svg>
                  <svg width='16' height='16' viewBox='0 0 16 16' className={expanded ? 'd-none' : 'text-white-50'}>
                    <path fill-rule='evenodd' d='M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708' />
                    <path fill-rule='evenodd' d='M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708' />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default NavMenu;
