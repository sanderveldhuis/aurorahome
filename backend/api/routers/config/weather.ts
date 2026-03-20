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

import express from 'express';
import {
  ipc,
  log
} from 'glidelite/backend';
import {
  ApiWeatherConfigResponse,
  isApiWeatherDisable,
  isApiWeatherEnable
} from '../../../../shared/apiConfig';
import {
  IpcWeatherManagerSetConfig,
  isIpcSetConfigReponseMessage
} from '../../../ipc/configManager';
import { isIpcWeatherManagerConfigMessage } from '../../../ipc/weatherManager';

// Caches published configuration
const config: ApiWeatherConfigResponse = { enable: false };

// Subscribe to updates from the Config Manager
ipc.to.configmanager.subscribe('WeatherManagerConfig', (name, payload) => {
  if (isIpcWeatherManagerConfigMessage(name, payload)) {
    config.enable = payload.source ? true : false;
    config.interval = payload.source ? payload.source.interval : undefined;
    config.name = payload.source ? payload.source.name : undefined;
    config.lat = payload.source ? payload.source.lat : undefined;
    config.lon = payload.source ? payload.source.lon : undefined;
    config.units = payload.source ? payload.source.units : undefined;
    // For safety the API key is not in the response
  }
  else {
    log.apiserver.warn(`Received unknown IPC publish with name: ${name}: ${JSON.stringify(payload)}`);
  }
});

// Construct the Express router
const router = express.Router();

// The router implementation
router.get('/config/weather', (req, res) => {
  res.status(200).json(config);
});
router.post('/config/weather', (req, res, next) => {
  const config: IpcWeatherManagerSetConfig = { name: 'WeatherManager', config: {} };
  if (isApiWeatherEnable(req.body)) {
    config.config.source = {
      interval: req.body.interval,
      name: req.body.name,
      lat: req.body.lat,
      lon: req.body.lon,
      units: req.body.units,
      apiKey: req.body.apiKey
    };
  }
  else if (!isApiWeatherDisable(req.body)) {
    res.status(400).end();
    return;
  }

  ipc.to.configmanager.request('SetConfig', config, (name, payload) => {
    if (isIpcSetConfigReponseMessage(name, payload)) {
      if (payload.result === 'ok') {
        res.status(201).end();
      }
      else {
        next(new Error(`Failed setting config via POST /config/weather, result: ${payload.result}`));
      }
    }
    else {
      next(new Error(`Received unknown IPC response with name '${name}': ${JSON.stringify(payload)}`));
    }
  });
});

export default router;
