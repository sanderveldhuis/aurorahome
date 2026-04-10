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

import DataTablesCore, { type Api } from 'datatables.net-bs5';
import { api } from 'glidelite/frontend';
import {
  useEffect,
  useRef,
  useState
} from 'react';
import { isApiLogResponse } from '../../../shared/apiLog';
import useInterval from '../hooks/useInterval';

/**
 * The settings log component showing logs and applies filtering.
 */
function SettingsLog() {
  const [logsLoaded, setLogsLoaded] = useState(false);

  // Create the DataTable reference after rendering otherwise the identifier cannot be found
  const table = useRef<Api>(null);
  useEffect(() => {
    table.current ??= new DataTablesCore('#logTable', {
      info: false,
      autoWidth: true,
      order: [[0, 'desc']],
      layout: {
        topStart: {
          buttons: [{
            text: 'Refresh',
            className: 'form-control btn-primary',
            action: () => {
              table.current?.clear().draw();
              setLogsLoaded(false);
            }
          }]
        }
      },
      createdRow: (row, data) => {
        if ('level' in data && typeof data.level === 'string') {
          if (data.level == `ERR`) {
            row.classList.add('bg-error');
          }
          else if (data.level == `WRN`) {
            row.classList.add('bg-instable');
            row.classList.add('text-dark');
          }
          else if (data.level == `DBG`) {
            row.classList.add('bg-disabled');
            row.classList.add('text-dark');
          }
        }
      },
      columns: [
        {
          data: 'timestamp',
          className: 'small',
          render: (data, type) => {
            return type === 'display' || type === 'filter'
              ? new Date(data as number).toLocaleString(navigator.languages[0] || navigator.language)
              : data as number;
          }
        },
        { data: 'level', visible: false },
        { data: 'name', className: 'small' },
        { data: 'message', className: 'small' }
      ]
    });
    // Workaround to remove default button styling
    document.querySelectorAll('.btn-primary').forEach(el => {
      el.classList.remove('btn-secondary');
    });
  }, []);

  // Fetch the logs from the API
  useInterval(
    () => {
      api.get({ path: '/log', responseType: 'json', timeout: 1500 })
        .then(payload => {
          // Validate response payload
          if (!isApiLogResponse(payload)) {
            throw new Error();
          }

          // Set the values
          table.current?.clear();
          table.current?.rows.add(payload.logs);
          table.current?.columns.adjust().draw();
          setLogsLoaded(true);
        }).catch(() => {
          // Nothing to do
        });
    },
    2000,
    !logsLoaded
  );

  return (
    <>
      <table id='logTable' className={`display ${logsLoaded ? '' : 'placeholder'}`}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Level</th>
            <th>Application</th>
            <th>Message</th>
          </tr>
        </thead>
      </table>
    </>
  );
}

export default SettingsLog;
