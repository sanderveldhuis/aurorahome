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
  ApiShellyConfigResponse,
  isApiShellyDisable,
  isApiShellyEnable
} from '../../../../shared/apiConfig';
import {
  IpcShellyServerSetConfig,
  isIpcSetConfigReponseMessage
} from '../../../ipc/configManager';
import { isIpcShellyServerConfigMessage } from '../../../ipc/shellyServer';

// Caches published configuration
const config: ApiShellyConfigResponse = { enable: false };

// Subscribe to updates from the Config Manager
ipc.to.configmanager.subscribe('ShellyServerConfig', (name, payload) => {
  if (isIpcShellyServerConfigMessage(name, payload)) {
    config.enable = payload.mqtt ? true : false;
    config.port = payload.mqtt ? payload.mqtt.port : undefined;
    config.hostname = payload.mqtt ? payload.mqtt.hostname : undefined;
    config.username = payload.mqtt ? payload.mqtt.username : undefined;
    // For safety the password is not in the response
  }
  else {
    log.apiserver.warn(`Received unknown IPC publish with name: ${name}: ${JSON.stringify(payload)}`);
  }
});

// Construct the Express router
const router = express.Router();

// The router implementation
router.get('/config/shelly', (req, res) => {
  res.status(200).json(config);
});
router.post('/config/shelly', (req, res, next) => {
  const config: IpcShellyServerSetConfig = { name: 'ShellyServer', config: {} };
  if (isApiShellyEnable(req.body)) {
    config.config.mqtt = {
      port: req.body.port,
      hostname: req.body.hostname,
      username: req.body.username,
      password: req.body.password
    };
  }
  else if (!isApiShellyDisable(req.body)) {
    res.status(400).end();
    return;
  }

  ipc.to.configmanager.request('SetConfig', config, (name, payload) => {
    if (isIpcSetConfigReponseMessage(name, payload)) {
      if (payload.result === 'ok') {
        res.status(201).end();
      }
      else {
        next(new Error(`Failed setting config via POST /config/shelly, result: ${payload.result}`));
      }
    }
    else {
      next(new Error(`Received unknown IPC response with name '${name}': ${JSON.stringify(payload)}`));
    }
  });
});

export default router;
