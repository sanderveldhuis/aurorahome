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

import Http from '../hooks/api';
import useInterval from '../hooks/useInterval';
import './widget.css';
import ApplicationConfig from './applicationConfig';
import ApplicationState from './applicationState';

function getStatusForName(name: string, result: any): Record<string, unknown> | undefined {
  if (typeof result !== 'object' || !Array.isArray(result)) {
    return;
  }
  // TODO: can we use API interfaces (just like IPC) to ensure TypeScript safety between API and frontend?
  for (const obj of result) {
    if (typeof obj !== 'object' || obj === null) {
      continue;
    }
    const application = obj as object;
    if (
      'name' in application && typeof application.name === 'string' && application.name === name
    ) {
      return application;
    }
  }

  return undefined;
}

function ConfigWidget() {
  const configManagerState = new ApplicationState('Config Manager');
  const weatherManagerState = new ApplicationState('Weather Manager');
  const shellyServerState = new ApplicationState('Shelly Server');

  useInterval(() => {
    Http.get('http://localhost:12002/status')
      .then(result => {
        let status = getStatusForName('configmanager', result);
        if (status) {
          // TODO: can we use API interfaces (just like IPC) to ensure TypeScript safety between API and frontend?
          const health = 'health' in status && typeof status.health === 'string' ? status.health : 'stopped';
          const details = 'details' in status && typeof status.details === 'object' && status.details !== null ? status.details as object : {};
          configManagerState.setHealth(health);
          const record: Record<string, string> = {};
          configManagerState.setDetails(record);
        }
        else {
          configManagerState.setHealth('stopped');
          configManagerState.setDetails({});
        }

        status = getStatusForName('weathermanager', result);
        if (status) {
          const health = 'health' in status && typeof status.health === 'string' ? status.health : 'stopped';
          const details = 'details' in status && typeof status.details === 'object' && status.details !== null ? status.details as object : {};
          weatherManagerState.setHealth(health);
          const record: Record<string, string> = {};
          if ('source' in details && typeof details.source === 'string') {
            record['Source'] = details.source;
          }
          if ('lastUpdate' in details && typeof details.lastUpdate === 'number') {
            // TODO: get locale string from settings
            record['Last update'] = new Date(details.lastUpdate).toLocaleString('nl-NL');
          }
          if ('nextUpdate' in details && typeof details.nextUpdate === 'number') {
            // TODO: get locale string from settings
            record['Next update'] = new Date(details.nextUpdate).toLocaleString('nl-NL');
          }
          weatherManagerState.setDetails(record);
        }
        else {
          weatherManagerState.setHealth('stopped');
          weatherManagerState.setDetails({});
        }

        status = getStatusForName('shellyserver', result);
        if (status) {
          const health = 'health' in status && typeof status.health === 'string' ? status.health : 'stopped';
          const details = 'details' in status && typeof status.details === 'object' && status.details !== null ? status.details as object : {};
          shellyServerState.setHealth(health);
          const record: Record<string, string> = {};
          if ('hostname' in details && typeof details.hostname === 'string') {
            record['Hostname'] = details.hostname;
          }
          if ('port' in details && typeof details.port === 'number') {
            record['Port'] = String(details.port);
          }
          shellyServerState.setDetails(record);
        }
        else {
          shellyServerState.setHealth('stopped');
          shellyServerState.setDetails({});
        }
      }).catch((error: unknown) => {
        configManagerState.setHealth('');
        weatherManagerState.setHealth('');
        shellyServerState.setHealth('');
        if (typeof error === 'number') {
          // TODO: somehow the 404 does not work
          console.log(`Code: ${error}`);
        }
        else {
          console.log(error);
        }
        // TODO: display popup in the screen which does not overflood on each request
        // TODO: ensure to display 'placeholder' again
      });
  }, 1000); // TODO: configure time somewhere

  return (
    <>
      <div className='card config-widget'>
        <div className='card-body'>
          <div className='row'>
            <div className='col-lg-4 col-sm-6 col-12 mb-lg-0 mb-3'>
              <ApplicationConfig state={configManagerState} />
            </div>
            <div className='col-lg-4 col-sm-6 col-12 mb-lg-0 mb-3'>
              <ApplicationConfig state={weatherManagerState} />
            </div>
            <div className='col-lg-4 col-sm-6 col-12 mb-lg-0 mb-3'>
              <ApplicationConfig state={shellyServerState} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConfigWidget;
