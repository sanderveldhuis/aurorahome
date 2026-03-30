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
import useInterval from '../hooks/useInterval';
import './Widget.scss';
import { useState } from 'react';
import {
  type ApiApplicationStatus,
  type ApiStatusResponse,
  isApiStatusResponse
} from '../../../shared/apiStatus';
import ConfigConfig from './ConfigConfig';
import ShellyConfig from './ShellyConfig';
import WeatherConfig from './WeatherConfig';

/**
 * Searches for the application status with the specified name in the result.
 * @param name the application name
 * @param result the result to search in
 * @returns the application status, or `undefined` if not found
 */
function getStatusForName(name: string, status: ApiStatusResponse): ApiApplicationStatus | undefined {
  for (const application of status.applications) {
    if (application.name === name) {
      return application;
    }
  }
  return undefined;
}

/**
 * The Config Widget component showing configuration and status of components.
 */
function ConfigWidget() {
  const [configHealth, setConfigHealth] = useState('');
  const [weatherHealth, setWeatherHealth] = useState('');
  const [weatherDetails, setWeatherDetails] = useState({});
  const [shellyHealth, setShellyHealth] = useState('');
  const [shellyDetails, setShellyDetails] = useState({});

  useInterval(() => {
    api.get({ path: '/status', responseType: 'json', timeout: 800 })
      .then(payload => {
        // Validate response payload
        if (!isApiStatusResponse(payload)) {
          throw new Error();
        }

        let status: ApiApplicationStatus | undefined;

        // Handle Config Manager status
        status = getStatusForName('configmanager', payload);
        setConfigHealth(status ? status.health : 'stopped');
        // No details available for Config Manager

        // Handle Weather Manager status
        status = getStatusForName('weathermanager', payload);
        setWeatherHealth(status ? status.health : 'stopped');
        // Only update details when changed to prevent re-render on each received API response
        if (JSON.stringify(status?.details ?? {}) !== JSON.stringify(weatherDetails)) {
          setWeatherDetails(status?.details ?? {});
        }

        // Handle Shelly Server status
        status = getStatusForName('shellyserver', payload);
        setShellyHealth(status ? status.health : 'stopped');
        // Only update details when changed to prevent re-render on each received API response
        if (JSON.stringify(status?.details ?? {}) !== JSON.stringify(shellyDetails)) {
          setShellyDetails(status?.details ?? {});
        }
      }).catch(() => {
        // On failure display the placeholder
        setConfigHealth('');
        setWeatherHealth('');
        setShellyHealth('');
      });
  }, 1000);

  return (
    <>
      <div className='card config-widget'>
        <div className='card-body'>
          <div className='row'>
            <div className='col-lg-4 col-sm-6 col-12 mb-lg-0 mb-3'>
              <ConfigConfig health={configHealth} />
            </div>
            <div className='col-lg-4 col-sm-6 col-12 mb-lg-0 mb-3'>
              <WeatherConfig health={weatherHealth} details={weatherDetails} />
            </div>
            <div className='col-lg-4 col-sm-6 col-12 mb-lg-0 mb-3'>
              <ShellyConfig health={shellyHealth} details={shellyDetails} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConfigWidget;
