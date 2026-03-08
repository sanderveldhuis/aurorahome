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
import './widget.css';
import {
  type ApiApplicationStatus,
  type ApiStatusResponse,
  isApiStatusResponse
} from '../../../shared/apiStatus';
import ApplicationConfig from './applicationConfig';
import useApplicationState from './hooks/useApplicationState';

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

function ConfigWidget() {
  const configManagerState = useApplicationState('Config Manager');
  const weatherManagerState = useApplicationState('Weather Manager');
  const shellyServerState = useApplicationState('Shelly Server');

  useInterval(() => {
    api.get({ path: '/status', responseType: 'json', timeout: 800 })
      .then(payload => {
        // Validate response payload
        if (!isApiStatusResponse(payload)) {
          throw new Error();
        }

        let status: ApiApplicationStatus | undefined;
        let details: Record<string, string>;

        // Handle Config Manager status
        status = getStatusForName('configmanager', payload);
        configManagerState.setHealth(status ? status.health : 'stopped');
        details = {};
        configManagerState.setDetails(details);

        // Handle Weather Manager status
        status = getStatusForName('weathermanager', payload);
        weatherManagerState.setHealth(status ? status.health : 'stopped');
        details = {};
        if (status && status.details && 'source' in status.details && typeof status.details.source === 'string') {
          details.Source = status.details.source;
        }
        if (status && status.details && 'lastUpdate' in status.details && typeof status.details.lastUpdate === 'number') {
          // TODO: get locale string from settings
          details['Last update'] = new Date(status.details.lastUpdate).toLocaleString('nl-NL');
        }
        if (status && status.details && 'nextUpdate' in status.details && typeof status.details.nextUpdate === 'number') {
          // TODO: get locale string from settings
          details['Next update'] = new Date(status.details.nextUpdate).toLocaleString('nl-NL');
        }
        weatherManagerState.setDetails(details);

        // Handle Shelly Server status
        status = getStatusForName('shellyserver', payload);
        shellyServerState.setHealth(status ? status.health : 'stopped');
        details = {};
        if (status && status.details && 'hostname' in status.details && typeof status.details.hostname === 'string') {
          details.Hostname = status.details.hostname;
        }
        if (status && status.details && 'port' in status.details && typeof status.details.port === 'number') {
          details.Port = String(status.details.port);
        }
        shellyServerState.setDetails(details);
      }).catch(() => {
        // On failure display the placeholder
        configManagerState.setHealth('');
        configManagerState.setDetails({});
        weatherManagerState.setHealth('');
        weatherManagerState.setDetails({});
        shellyServerState.setHealth('');
        shellyServerState.setDetails({});
      });
  }, 1000);

  return (
    <>
      <div className='card config-widget'>
        <div className='card-body'>
          <div className='row'>
            <div className='col-lg-4 col-sm-6 col-12 mb-lg-0 mb-3'>
              <ApplicationConfig {...configManagerState} />
            </div>
            <div className='col-lg-4 col-sm-6 col-12 mb-lg-0 mb-3'>
              <ApplicationConfig {...weatherManagerState} />
            </div>
            <div className='col-lg-4 col-sm-6 col-12 mb-lg-0 mb-3'>
              <ApplicationConfig {...shellyServerState} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConfigWidget;
