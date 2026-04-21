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
import { ApiWeatherResponse } from '../../../shared/apiWeather';
import { isIpcWeatherDataMessage } from '../../ipc/weatherManager';

// Caches published weather data
const weather: ApiWeatherResponse = {};

// Subscribe to updates from the Weather Manager
ipc.to.weathermanager.subscribe('WeatherData', (name, payload) => {
  if (isIpcWeatherDataMessage(name, payload)) {
    weather.current = payload.current;
    weather.minutely = payload.minutely;
    weather.hourly = payload.hourly;
    weather.daily = payload.daily;
    weather.alerts = payload.alerts;
  }
  else {
    log.apiserver.warn(`Received unknown IPC publish with name: ${name}: ${JSON.stringify(payload)}`);
  }
});

// Construct the Express router
const router = express.Router();

// The router implementation
router.get('/weather', (req, res) => {
  res.status(200).json(weather);
});

export default router;
