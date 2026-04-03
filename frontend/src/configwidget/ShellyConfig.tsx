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

import { api } from 'glidelite/frontend';
import { useState } from 'react';
import validator from 'validator';
import {
  type ApiShellyDisable,
  type ApiShellyEnable,
  isApiShellyConfigResponse
} from '../../../shared/apiConfig';
import useInterval from '../hooks/useInterval';
import {
  type MessagePopupContextType,
  useMessagePopup
} from '../hooks/useMessagePopup';
import ConfigWidgetStatus from './WidgetStatus';

/**
 * Saves the Shelly configuration using the dedicated API.
 * @param enable indicates whether Shelly is enabled
 * @param host the MQTT hostname and port in format `hostname:port`
 * @param username the MQTT username
 * @param password the MQTT password
 * @param setHostInvalid function to set the host as valid/invalid
 * @param setUsernameInvalid function to set the username as valid/invalid
 * @param setPasswordInvalid function to set the password as valid/invalid
 * @param setSaveEnabled function to set the save button enabled/disabled
 * @param messagePopup the Message Popup used to display messages
 */
function saveConfig(enable: boolean, host: string, username: string, password: string, setHostInvalid: React.Dispatch<React.SetStateAction<boolean>>, setUsernameInvalid: React.Dispatch<React.SetStateAction<boolean>>, setPasswordInvalid: React.Dispatch<React.SetStateAction<boolean>>, setSaveEnabled: React.Dispatch<React.SetStateAction<boolean>>, messagePopup: MessagePopupContextType): void {
  // Reset validation and disable save button
  setHostInvalid(false);
  setUsernameInvalid(false);
  setPasswordInvalid(false);
  setSaveEnabled(false);

  // Validate input
  let inputOk = true;
  const hostnamePort = host.split(':');
  if (enable) {
    if (hostnamePort.length !== 2 || !validator.isPort(hostnamePort[1]) || !validator.isIP(hostnamePort[0])) {
      setHostInvalid(true);
      inputOk = false;
    }
    if (!validator.isByteLength(username, { max: 65535 })) {
      setUsernameInvalid(true);
      inputOk = false;
    }
    if (!validator.isByteLength(password, { max: 65535 })) {
      setPasswordInvalid(true);
      inputOk = false;
    }
  }

  // Execute API call when all input is valid
  if (inputOk) {
    const request: ApiShellyDisable | ApiShellyEnable = enable ? { enable: true, port: Number(hostnamePort[1]), hostname: hostnamePort[0], username, password } : { enable: false };
    api.post({ path: '/config/shelly', responseType: 'json', params: request }).then(() => {
      messagePopup.showSuccess('Shelly settings changed successfully');
      setSaveEnabled(true);
    }).catch(() => {
      messagePopup.showError('An unexpected error occurred');
      setSaveEnabled(true);
    });
  }
  else {
    setSaveEnabled(true);
  }
}

/**
 * The Shelly Config component showing configuration and status of Shelly.
 */
function ShellyConfig({ health, details }: { health: string; details: Record<string, string>; }) {
  // Use the Message Popup context
  const messagePopup = useMessagePopup();

  // States for this component
  const [enabled, setEnabled] = useState(false);
  const [host, setHost] = useState('');
  const [hostInvalid, setHostInvalid] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameInvalid, setUsernameInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [saveEnabled, setSaveEnabled] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Fetch the current configuration from the API
  useInterval(
    () => {
      api.get({ path: '/config/shelly', responseType: 'json', timeout: 1500 })
        .then(payload => {
          // Validate response payload
          if (!isApiShellyConfigResponse(payload)) {
            throw new Error();
          }

          // Set the values
          setEnabled(payload.enable);
          setHost(payload.hostname && payload.port ? `${payload.hostname}:${String(payload.port)}` : '');
          setUsername(payload.username ?? '');
          setConfigLoaded(true);
        }).catch(() => {
          // Nothing to do
        });
    },
    2000,
    !configLoaded
  );

  return (
    <>
      <div className='mb-3'>
        <div className={`form-check ${configLoaded ? '' : 'placeholder'}`}>
          <input
            type='checkbox'
            className='form-check-input'
            checked={enabled}
            hidden={!configLoaded}
            onChange={event => {
              const input = event.target as HTMLInputElement;
              setEnabled(input.checked);
            }}
          />
          <label className='form-check-label'>Enable</label>
        </div>
      </div>
      <ConfigWidgetStatus health={health}>
        {'nofClients' in details && (
          <div>
            <strong>Number of clients:</strong> {details.nofClients}
          </div>
        )}
      </ConfigWidgetStatus>
      <div className='mt-3 mb-2'>
        <div className='input-group'>
          <div className={`input-group-text ${configLoaded ? '' : 'placeholder'}`}>
            <svg fill='currentColor' width='16' height='16'>
              <path d='M14 10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1zM2 9a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2z' />
              <path d='M5 11.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M14 3a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z' />
              <path d='M5 4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0' />
            </svg>
          </div>
          <input
            type='text'
            className={`form-control ${hostInvalid ? 'is-invalid' : ''} ${configLoaded ? '' : 'placeholder'}`}
            placeholder='Eg: 0.0.0.0:1883'
            disabled={!enabled || !configLoaded}
            value={host}
            onChange={event => {
              const input = event.target as HTMLInputElement;
              setHost(input.value);
            }}
          />
          <div className='invalid-feedback'>Enter a hostname and port, eg: 0.0.0.0:1883</div>
        </div>
      </div>
      <div className='mb-2'>
        <div className='input-group'>
          <div className={`input-group-text ${configLoaded ? '' : 'placeholder'}`}>
            <svg fill='currentColor' width='16' height='16'>
              <path d='M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6' />
            </svg>
          </div>
          <input
            type='text'
            className={`form-control ${usernameInvalid ? 'is-invalid' : ''} ${configLoaded ? '' : 'placeholder'}`}
            placeholder='Username'
            disabled={!enabled || !configLoaded}
            value={username}
            onChange={event => {
              const input = event.target as HTMLInputElement;
              setUsername(input.value);
            }}
          />
          <div className='invalid-feedback'>Maximum allowed length is 65535 characters</div>
        </div>
      </div>
      <div className='mb-3'>
        <div className='input-group'>
          <div className={`input-group-text ${configLoaded ? '' : 'placeholder'}`}>
            <svg fill='currentColor' width='16' height='16'>
              <path d='M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4m0 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3' />
            </svg>
          </div>
          <input
            type='password'
            className={`form-control ${passwordInvalid ? 'is-invalid' : ''} ${configLoaded ? '' : 'placeholder'}`}
            placeholder='Password'
            disabled={!enabled || !configLoaded}
            value={password}
            onChange={event => {
              const input = event.target as HTMLInputElement;
              setPassword(input.value);
            }}
          />
          <div className='invalid-feedback'>Maximum allowed length is 65535 characters</div>
        </div>
      </div>
      <div className='input-group'>
        <button
          type='submit'
          className='form-control btn btn-primary'
          disabled={!saveEnabled || !configLoaded}
          onClick={() => {
            saveConfig(enabled, host, username, password, setHostInvalid, setUsernameInvalid, setPasswordInvalid, setSaveEnabled, messagePopup);
          }}
        >
          Save
        </button>
      </div>
    </>
  );
}

export default ShellyConfig;
