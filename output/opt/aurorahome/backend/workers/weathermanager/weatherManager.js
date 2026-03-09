"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherManager = void 0;
const backend_1 = require("glidelite/backend");
const statusReporter_1 = require("../../ipc/statusReporter");
const weatherManager_1 = require("../../ipc/weatherManager");
const openweathermapV3_1 = require("./openweathermapV3");
const weatherRetriever_1 = require("./weatherRetriever");
/**
 * A Weather Manager retrieving weather data from a configured source and publishing the weather data via IPC.
 */
class WeatherManager {
    _statusDetails;
    _weatherRetriever;
    _retrievalTimer;
    /**
     * Starts the Weather Manager.
     */
    start() {
        // Start IPC communication
        backend_1.ipc.start('weathermanager', 'statusmanager', 'configmanager');
        backend_1.ipc.to.configmanager.subscribe('WeatherManagerConfig', (name, payload) => {
            this._onPublish(name, payload);
        });
        // Start status reporting
        statusReporter_1.status.weathermanager.start('worker');
        statusReporter_1.status.weathermanager.setHealth('disabled');
        backend_1.log.weathermanager.info('Started');
    }
    /**
     * Stops the Weather Manager.
     * @details the Weather Manager should not be used anymore after being stopped
     */
    stop() {
        // Stop retrieving weather
        clearInterval(this._retrievalTimer);
        // Stop status reporting
        statusReporter_1.status.weathermanager.stop();
        // Stop IPC communication
        backend_1.ipc.stop();
        backend_1.log.weathermanager.info('Stopped');
    }
    /**
     * Handles received IPC publishes.
     * @param name the publish message name
     * @param payload the publish payload
     */
    _onPublish(name, payload) {
        if ((0, weatherManager_1.isIpcWeatherManagerConfigMessage)(name, payload)) {
            backend_1.log.weathermanager.info('Received WeatherManagerConfig publish via IPC');
            this._handleWeatherManagerConfig(payload);
        }
        else {
            backend_1.log.weathermanager.warn(`Received unknown IPC publish with name '${name}': ${JSON.stringify(payload)}`);
        }
    }
    /**
     * Handles WeatherManagerConfig message.
     * @param config the WeatherManagerConfig message
     */
    _handleWeatherManagerConfig(config) {
        // Always cleanup for safety
        clearInterval(this._retrievalTimer);
        statusReporter_1.status.weathermanager.clearDetails();
        // If no source is available the weather retrieval should stop
        if (!config.source) {
            statusReporter_1.status.weathermanager.setHealth('disabled');
            backend_1.log.weathermanager.info(`Stopped weather retrieval`);
            return;
        }
        // Construct the status details
        this._statusDetails = { source: config.source.name };
        statusReporter_1.status.weathermanager.setDetails(this._statusDetails);
        statusReporter_1.status.weathermanager.setHealth('running');
        // Construct the dedicated weather retriever
        // TODO: currently only supporting OpenWeatherMapV3, add if-statement once more protocols are supported
        this._weatherRetriever = new openweathermapV3_1.OpenWeatherMapV3(config.source.lat, config.source.lon, config.source.units, config.source.apiKey);
        // Start the weather retriever
        this._retrievalTimer = setInterval(() => {
            this._executeWeatherRetriever(config.source?.interval ?? 0);
        }, config.source.interval * 1000);
        this._executeWeatherRetriever(config.source.interval);
        backend_1.log.weathermanager.info(`Started weather retrieval from '${config.source.name}' each ${String(config.source.interval)} seconds`);
    }
    /**
     * Executes the weather retriever and stores the results.
     * @param interval the interval in seconds
     */
    _executeWeatherRetriever(interval) {
        if (!this._weatherRetriever || !this._statusDetails) {
            // Should not happen
            return;
        }
        // Get weather data using the weather retriever
        const result = this._weatherRetriever.get();
        if (result.status === weatherRetriever_1.WeatherRetrieverStatus.Ok) {
            // Set status details
            this._statusDetails.lastUpdate = Date.now();
            this._statusDetails.nextUpdate = Date.now() + (interval * 1000);
            statusReporter_1.status.weathermanager.setHealth('running');
            // Publish weather data if available
            if (result.data) {
                backend_1.ipc.publish('WeatherData', result.data);
            }
        }
        else {
            // Set status details
            this._statusDetails.nextUpdate = Date.now() + (interval * 1000);
            statusReporter_1.status.weathermanager.setHealth('instable');
        }
    }
}
exports.WeatherManager = WeatherManager;
