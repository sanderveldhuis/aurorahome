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
import './applicationConfig.css';

function ApplicationConfig({ id, name, health, details }: { id: string; name: string; health: string; details: Record<string, string>; }) {
  let svgPath = '';
  switch (health) {
    case 'starting':
      svgPath = 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6';
      break;
    case 'running':
      svgPath = 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z';
      break;
    case 'instable':
      svgPath = 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2';
      break;
    case 'disabled':
      svgPath = 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5';
      break;
    case 'stopped':
      svgPath = 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z';
      break;
    default:
      break;
  }

  const detailText = [];
  for (const key of Object.keys(details)) {
    detailText.push(
      <>
        <strong>{key}:</strong> {details[key]}
        <br />
      </>
    );
  }

  const [isEnabled, setEnabled] = useState(false);
  const [host, setHost] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      <div className='application-config placeholder-glow'>
        <button className='btn btn-outline-secondary d-flex w-100 text-start' type='button' data-bs-toggle='collapse' data-bs-target={`#application-status-${id}`}>
          <div className={`me-auto ${health ? '' : 'placeholder'}`}>{name}</div>
          <svg className={`ms-1 mt-1 ${health ? health : 'placeholder'}`} width='20' height='20'>
            <path d={svgPath} />
          </svg>
        </button>
        <div className='collapse' id={`application-status-${id}`}>
          <div className='card card-body'>
            <div className='mb-3'>
              <div className='form-check'>
                <input
                  type='checkbox'
                  className='form-check-input'
                  checked={isEnabled}
                  onChange={event => {
                    const input = event.target as HTMLInputElement;
                    setEnabled(input.checked);
                  }}
                />
                <label className='form-check-label'>Enable</label>
              </div>
            </div>
            <div className={`alert ${health ? health : 'placeholder'}`} role='alert'>
              <p className='mb-0'>
                <strong>Health:</strong> {health}
                <br />
                {detailText}
              </p>
            </div>
            <div className='mb-2'>
              <div className='input-group'>
                <div className='input-group-text'>
                  <svg width='16' height='16'>
                    <path d='M14 10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1zM2 9a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2z' />
                    <path d='M5 11.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M14 3a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z' />
                    <path d='M5 4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0' />
                  </svg>
                </div>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Eg: 0.0.0.0:1883'
                  disabled={!isEnabled}
                  value={host}
                  onChange={event => {
                    const input = event.target as HTMLInputElement;
                    setHost(input.value);
                  }}
                />
              </div>
            </div>
            <div className='mb-2'>
              <div className='input-group'>
                <div className='input-group-text'>
                  <svg width='16' height='16'>
                    <path d='M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6' />
                  </svg>
                </div>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Username'
                  disabled={!isEnabled}
                  value={username}
                  onChange={event => {
                    const input = event.target as HTMLInputElement;
                    setUsername(input.value);
                  }}
                />
              </div>
            </div>
            <div className='mb-3'>
              <div className='input-group'>
                <div className='input-group-text'>
                  <svg width='16' height='16'>
                    <path d='M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4m0 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3' />
                  </svg>
                </div>
                <input
                  type='password'
                  className='form-control'
                  placeholder='Password'
                  disabled={!isEnabled}
                  value={password}
                  onChange={event => {
                    const input = event.target as HTMLInputElement;
                    setPassword(input.value);
                  }}
                />
              </div>
            </div>
            <div className='input-group'>
              <button
                type='submit'
                className='form-control btn btn-primary'
                onClick={() => {
                  saveConfig(isEnabled, host, username, password);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApplicationConfig;
