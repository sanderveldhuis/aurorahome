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
  type ApiWeatherDisable,
  type ApiWeatherEnable,
  isApiWeatherConfigResponse
} from '../../../shared/apiConfig';
import useInterval from '../hooks/useInterval';
import {
  type MessagePopupContextType,
  useMessagePopup
} from '../hooks/useMessagePopup';
import SettingsStatus from './SettingsStatus';

/**
 * Saves the weather configuration using the dedicated API.
 * @param enable indicates whether weather is enabled
 * @param interval the interval of retrieving from the source in seconds
 * @param name the source name
 * @param location the latitude/longitude geographic coordinates of the location
 * @param units the units applied to the data
 * @param units the source API key
 * @param setIntervalInvalid function to set the interval as valid/invalid
 * @param setNameInvalid function to set the name as valid/invalid
 * @param setLocationInvalid function to set the location as valid/invalid
 * @param setUnitsInvalid function to set the units as valid/invalid
 * @param setApiKeyInvalid function to set the API key as valid/invalid
 * @param setSaveEnabled function to set the save button enabled/disabled
 * @param messagePopup the Message Popup used to display messages
 */
function saveConfig(enable: boolean, interval: string, name: string, location: string, units: string, apiKey: string, setIntervalInvalid: React.Dispatch<React.SetStateAction<boolean>>, setNameInvalid: React.Dispatch<React.SetStateAction<boolean>>, setLocationInvalid: React.Dispatch<React.SetStateAction<boolean>>, setUnitsInvalid: React.Dispatch<React.SetStateAction<boolean>>, setApiKeyInvalid: React.Dispatch<React.SetStateAction<boolean>>, setSaveEnabled: React.Dispatch<React.SetStateAction<boolean>>, messagePopup: MessagePopupContextType): void {
  // Reset validation and disable save button
  setIntervalInvalid(false);
  setNameInvalid(false);
  setLocationInvalid(false);
  setUnitsInvalid(false);
  setApiKeyInvalid(false);
  setSaveEnabled(false);

  // Validate input
  let inputOk = true;
  if (enable) {
    if (!validator.isNumeric(interval) || Number(interval) <= 0) {
      setIntervalInvalid(true);
      inputOk = false;
    }
    if (!validator.isLatLong(location)) {
      setLocationInvalid(true);
      inputOk = false;
    }
    if (!validator.isAlphanumeric(apiKey) || apiKey.length !== 32) {
      setApiKeyInvalid(true);
      inputOk = false;
    }
  }

  // Execute API call when all input is valid
  if (inputOk && name === 'openweathermapV3' && (units === 'standard' || units === 'metric' || units === 'imperial')) {
    const request: ApiWeatherDisable | ApiWeatherEnable = enable ? { enable: true, interval: Number(interval), name, lat: Number(location.split(',')[0]), lon: Number(location.split(',')[1]), units, apiKey } : { enable: false };
    api.post({ path: '/config/weather', responseType: 'json', params: request }).then(() => {
      messagePopup.showSuccess('Weather settings changed successfully');
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
 * The settings weather component showing configuration and status of weather.
 */
function SettingsWeather({ health, details }: { health: string; details: Record<string, string>; }) {
  // Use the Message Popup context
  const messagePopup = useMessagePopup();

  // States for this component
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval] = useState('');
  const [intervalInvalid, setIntervalInvalid] = useState(false);
  const [name, setName] = useState('');
  const [nameInvalid, setNameInvalid] = useState(false);
  const [location, setLocation] = useState('');
  const [locationInvalid, setLocationInvalid] = useState(false);
  const [units, setUnits] = useState('');
  const [unitsInvalid, setUnitsInvalid] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInvalid, setApiKeyInvalid] = useState(false);
  const [saveEnabled, setSaveEnabled] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Fetch the current configuration from the API
  useInterval(
    () => {
      api.get({ path: '/config/weather', responseType: 'json', timeout: 1500 })
        .then(payload => {
          // Validate response payload
          if (!isApiWeatherConfigResponse(payload)) {
            throw new Error();
          }

          // Set the values
          setEnabled(payload.enable);
          setInterval(String(payload.interval ?? ''));
          setName(payload.name ?? 'openweathermapV3');
          setLocation(payload.lat && payload.lon ? `${String(payload.lat)},${String(payload.lon)}` : '');
          setUnits(payload.units ?? 'standard');
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
              setEnabled(event.target.checked);
            }}
          />
          <label className='form-check-label'>Enable</label>
        </div>
      </div>
      <SettingsStatus health={health}>
        {'lastUpdate' in details && (
          <div>
            <strong>Last update:</strong> {new Date(details.lastUpdate).toLocaleTimeString(navigator.languages[0] || navigator.language)}
          </div>
        )}
        {'nextUpdate' in details && (
          <div>
            <strong>Next update:</strong> {new Date(details.nextUpdate).toLocaleTimeString(navigator.languages[0] || navigator.language)}
          </div>
        )}
      </SettingsStatus>
      <div className='mt-3 mb-2'>
        <div className='input-group'>
          <div className={`input-group-text ${configLoaded ? '' : 'placeholder'}`}>
            <svg fill='currentColor' width='16' height='16'>
              <path d='M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5z' />
              <path d='M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64l.012-.013.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5M8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3' />
            </svg>
          </div>
          <input
            type='number'
            className={`form-control ${intervalInvalid ? 'is-invalid' : ''} ${configLoaded ? '' : 'placeholder'}`}
            placeholder='Refresh interval in seconds'
            disabled={!enabled || !configLoaded}
            value={interval}
            onChange={event => {
              setInterval(event.target.value);
            }}
          />
          <div className='invalid-feedback'>Minimum required refresh interval is 1 second</div>
        </div>
      </div>
      <div className='mb-2'>
        <div className='input-group'>
          <div className={`input-group-text ${configLoaded ? '' : 'placeholder'}`}>
            <svg fill='currentColor' width='16' height='16'>
              <path d='M14 10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1zM2 9a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2z' />
              <path d='M5 11.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M14 3a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z' />
              <path d='M5 4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0' />
            </svg>
          </div>
          <select
            className={`form-control ${nameInvalid ? 'is-invalid' : ''} ${configLoaded ? '' : 'placeholder'}`}
            disabled={!enabled || !configLoaded}
            value={name}
            onChange={event => {
              setName(event.target.value);
            }}
          >
            <option value='openweathermapV3'>OpenWeatherMap One Call API 3.0</option>
          </select>
        </div>
      </div>
      <div className='mb-2'>
        <div className='input-group'>
          <div className={`input-group-text ${configLoaded ? '' : 'placeholder'}`}>
            <svg fill='currentColor' width='16' height='16'>
              <path d='M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6' />
            </svg>
          </div>
          <input
            type='text'
            className={`form-control ${locationInvalid ? 'is-invalid' : ''} ${configLoaded ? '' : 'placeholder'}`}
            placeholder='Eg: 52.377956,4.897070'
            disabled={!enabled || !configLoaded}
            value={location}
            onChange={event => {
              setLocation(event.target.value);
            }}
          />
          <div className='invalid-feedback'>Enter a latutude and longitude, eg: 52.377956,4.897070</div>
        </div>
      </div>
      <div className='mb-2'>
        <div className='input-group'>
          <div className={`input-group-text ${configLoaded ? '' : 'placeholder'}`}>
            <svg fill='currentColor' width='16' height='16'>
              <path d='M1 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5v-1H2v-1h4v-1H4v-1h2v-1H2v-1h4V9H4V8h2V7H2V6h4V2h1v4h1V4h1v2h1V2h1v4h1V4h1v2h1V2h1v4h1V1a1 1 0 0 0-1-1z' />
            </svg>
          </div>
          <select
            className={`form-control ${unitsInvalid ? 'is-invalid' : ''} ${configLoaded ? '' : 'placeholder'}`}
            disabled={!enabled || !configLoaded}
            value={units}
            onChange={event => {
              setUnits(event.target.value);
            }}
          >
            <option value='standard'>Standard</option>
            <option value='metric'>Metric</option>
            <option value='imperial'>Imperial</option>
          </select>
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
            type='text'
            className={`form-control ${apiKeyInvalid ? 'is-invalid' : ''} ${configLoaded ? '' : 'placeholder'}`}
            placeholder='API key'
            disabled={!enabled || !configLoaded}
            value={apiKey}
            onChange={event => {
              setApiKey(event.target.value);
            }}
          />
          <div className='invalid-feedback'>Enter an API key consisting of 32 characters: a-z, A-Z, 0-9</div>
        </div>
      </div>
      <div className='input-group'>
        <button
          type='submit'
          className='form-control btn btn-primary'
          disabled={!saveEnabled || !configLoaded}
          onClick={() => {
            saveConfig(enabled, interval, name, location, units, apiKey, setIntervalInvalid, setNameInvalid, setLocationInvalid, setUnitsInvalid, setApiKeyInvalid, setSaveEnabled, messagePopup);
          }}
        >
          Save
        </button>
      </div>
    </>
  );
}

export default SettingsWeather;
