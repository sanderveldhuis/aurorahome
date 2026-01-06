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
import './profile.css';

function displayProfile(onEdit: () => void) {
  // TODO: retrieve via API
  return (
    <>
      <h4 className='mb-1'>Veldhuis</h4>
      <h5 className='fw-light mb-3'>Tunneloven 9, Albergen</h5>
      <div className='d-grid gap-2'>
        <button
          className='btn btn-secondary btn-sm'
          type='button'
          onClick={onEdit}
        >
          Edit profile
        </button>
      </div>
    </>
  );
}

function editProfile(onSave: () => void, onCancel: () => void) {
  // TODO: retrieve values via API
  return (
    <>
      <div className='mb-2'>
        <label className='form-label fw-semibold small mb-1'>Name</label>
        <input type='text' className='form-control form-control-sm' placeholder='Name' id='profileName' value='Veldhuis' />
      </div>
      <div className='mb-2'>
        <label className='form-label fw-semibold small mb-1'>Address</label>
        <input type='text' className='form-control form-control-sm' placeholder='Address' id='profileAddress' value='Tunneloven 9, Albergen' />
      </div>
      <div className='mb-2'>
        <label className='form-label fw-semibold small mb-1'>Email</label>
        <input type='email' className='form-control form-control-sm' placeholder='Email' id='profileEmail' value='mail@sanderveldhuis.nl' />
      </div>
      <button
        className='btn btn-secondary btn-sm mt-2'
        type='button'
        onClick={onSave}
      >
        Save
      </button>
      <button
        className='btn btn-secondary btn-sm mt-2 ms-1'
        type='button'
        onClick={onCancel}
      >
        Cancel
      </button>
    </>
  );
}

function Profile({ component }: { component: string; }) {
  const [edit, setEdit] = useState(false);
  if (component !== Profile.name) {
    return null;
  }

  return (
    <>
      <div className='row mb-3 mt-1 mt-md-3'>
        <div className='col-12 col-lg-6 col-xl-3'>
          <div className='card'>
            <div className='card-body'>
              <img src='https://github.com/sanderveldhuis.png' alt='' className='img-fluid rounded-circle mb-3' />
              {edit ? editProfile(() => {
                // TODO: store via API
                setEdit(false);
              }, () => {
                setEdit(false);
              }) : displayProfile(() => {
                setEdit(true);
              })}
            </div>
          </div>
        </div>
        <div className='col-12 col-lg-6 col-xl-9 ps-lg-0 mt-3 mt-lg-0'>
          <div className='card'>
            <div className='card-body'>
              Password and authentication
            </div>
            <div
              className='card-body'
              style={{
                borderTop: 'inherit',
                borderBottom: 'inherit'
              }}
            >
              Web sessions
            </div>
            <div className='card-body'>
              Profile activity
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
