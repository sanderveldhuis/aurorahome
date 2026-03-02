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

import './applicationConfig.css';
import type ApplicationState from './applicationState';

function ApplicationConfig({ state }: { state: ApplicationState; }) {
  let svgPath = '';
  switch (state.getHealth()) {
    case 'starting':
      svgPath = 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6';
      break;
    case 'running':
      svgPath = 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z';
      break;
    case 'instable':
      svgPath = 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2';
      break;
    case 'stopped':
      svgPath = 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z';
      break;
    default:
      break;
  }

  let detailText = [];
  for (const key of Object.keys(state.getDetails())) {
    detailText.push(
      <>
        <strong>{key}:</strong> {state.getDetails()[key]}
        <br />
      </>
    );
  }

  return (
    <>
      <div className='application-config placeholder-glow'>
        <button className='btn btn-outline-secondary d-flex w-100 text-start' type='button' data-bs-toggle='collapse' data-bs-target={`#application-status-${state.getId()}`}>
          <div className={`me-auto ${state.getHealth() ? '' : 'placeholder'}`}>{state.getName()}</div>
          <svg className={`ms-1 mt-1 ${state.getHealth() ? state.getHealth() : 'placeholder'}`} width='20' height='20'>
            <path d={svgPath} />
          </svg>
        </button>
        <div className='collapse' id={`application-status-${state.getId()}`}>
          <div className='card card-body'>
            <div className={`alert ${state.getHealth() ? state.getHealth() : 'placeholder'}`} role='alert'>
              <p className='mb-0'>
                <strong>Health:</strong> {state.getHealth()}
                <br />
                {detailText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApplicationConfig;
