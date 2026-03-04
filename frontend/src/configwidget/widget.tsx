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

import Api from '../hooks/api';
import useInterval from '../hooks/useInterval';
import './widget.css';
import ApplicationConfig from './applicationConfig';
import useApplicationState from './hooks/useApplicationState';

/**
 * The application health.
 */
type StatusHealth = typeof STATUS_HEALTH[number];
const STATUS_HEALTH = ['starting', 'running', 'instable', 'stopped'] as const;

/**
 * The API message containing application statusses.
 */
interface ApiApplicationStatus {
  /** The applicaton name */
  name: string;
  /** The application status health */
  health: StatusHealth;
  /** Application status details (optional) */
  details?: object;
}

/**
 * Searches for the application status with the specified name in the result.
 * @param name the application name
 * @param result the result to search in
 * @returns the application status
 */
function getStatusForName(name: string, result: any): ApiApplicationStatus {
  if (typeof result === 'object' || Array.isArray(result)) {
    for (const obj of result) {
      if (typeof obj === 'object' && obj !== null) {
        const application = obj as object;
        if (
          'name' in application && typeof application.name === 'string' && application.name === name &&
          'health' in application && typeof application.health === 'string' && STATUS_HEALTH.find(health => health === application.health) !== undefined &&
          (!('details' in application) || ('details' in application && typeof application.details === 'object' && application.details !== null))
        ) {
          return application as ApiApplicationStatus;
        }
      }
    }
  }
  return { name, health: 'stopped' };
}

function ConfigWidget() {
  const configManagerState = useApplicationState('Config Manager');
  const weatherManagerState = useApplicationState('Weather Manager');
  const shellyServerState = useApplicationState('Shelly Server');

  useInterval(() => {
    // TODO: replace by GlideLite API helper to /api/status
    Api.get('http://localhost:12002/status')
      .then(result => {
        // TODO: instead checking the message in each 'getStatusForName' do it only once here to make it more lightweight?

        // Handle Config Manager status
        let status = getStatusForName('configmanager', result);
        configManagerState.setHealth(status.health);
        let record: Record<string, string> = {};
        configManagerState.setDetails(record);

        // Handle Weather Manager status
        status = getStatusForName('weathermanager', result);
        weatherManagerState.setHealth(status.health);
        record = {};
        if (status.details && 'source' in status.details && typeof status.details.source === 'string') {
          record.Source = status.details.source;
        }
        if (status.details && 'lastUpdate' in status.details && typeof status.details.lastUpdate === 'number') {
          // TODO: get locale string from settings
          record['Last update'] = new Date(status.details.lastUpdate).toLocaleString('nl-NL');
        }
        if (status.details && 'nextUpdate' in status.details && typeof status.details.nextUpdate === 'number') {
          // TODO: get locale string from settings
          record['Next update'] = new Date(status.details.nextUpdate).toLocaleString('nl-NL');
        }
        weatherManagerState.setDetails(record);

        // Handle Shelly Server status
        status = getStatusForName('shellyserver', result);
        shellyServerState.setHealth(status.health);
        record = {};
        if (status.details && 'hostname' in status.details && typeof status.details.hostname === 'string') {
          record.Hostname = status.details.hostname;
        }
        if (status.details && 'port' in status.details && typeof status.details.port === 'number') {
          record.Port = String(status.details.port);
        }
        shellyServerState.setDetails(record);
      }).catch(() => {
        // On failure display the placeholder
        configManagerState.setHealth('');
        configManagerState.setDetails({});
        weatherManagerState.setHealth('');
        weatherManagerState.setDetails({});
        shellyServerState.setHealth('');
        shellyServerState.setDetails({});
      });
  }, 5000); // TODO: configure time somewhere

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
