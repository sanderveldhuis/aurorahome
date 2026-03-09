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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const backend_1 = require("glidelite/backend");
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const configManager_1 = require("../../ipc/configManager");
const statusReporter_1 = require("../../ipc/statusReporter");
const configModel_1 = __importDefault(require("./configModel"));
/**
 * A Config Manager handles configuration by storing it in a database and publishing it via IPC.
 */
class ConfigManager {
    _publishRetryTimer;
    _isRunning = true;
    /**
     * Starts the Config Manager.
     */
    start() {
        // Start IPC communication
        backend_1.ipc.start('configmanager', 'statusmanager');
        backend_1.ipc.onRequest((name, payload, response) => {
            this._onRequest(name, payload, response);
        });
        // Start status reporting
        statusReporter_1.status.configmanager.start('worker');
        // Start database connection
        this._connectDatabase();
        backend_1.log.configmanager.info('Started');
    }
    /**
     * Stops the Config Manager.
     * @details the Config Manager should not be used anymore after being stopped
     */
    stop() {
        this._isRunning = false;
        // Stop publish retry timer
        clearTimeout(this._publishRetryTimer);
        // Stop database connection
        mongoose_1.default.connection.removeAllListeners();
        mongoose_1.default.disconnect().catch(() => {
            // Ignore
        });
        // Stop status reporting
        statusReporter_1.status.configmanager.stop();
        // Stop IPC communication
        backend_1.ipc.stop();
        backend_1.log.configmanager.info('Stopped');
    }
    /**
     * Connects to the database.
     */
    _connectDatabase() {
        // Start the connection
        mongoose_1.default.connect(backend_1.glconfig.config.database, { serverSelectionTimeoutMS: 1000 }).then(() => {
            // Add listeners for future disconnect and connect events
            mongoose_1.default.connection.addListener('disconnected', () => {
                this._handleDatabaseDisconnect();
            });
            mongoose_1.default.connection.addListener('connected', () => {
                this._handleDatabaseConnect();
            });
            // Handle current connect
            this._handleDatabaseConnect();
        }).catch(() => {
            // This will only occur on initial connection
            if (this._isRunning) {
                this._connectDatabase();
            }
        });
    }
    /**
     * Handles database connection disconnect.
     */
    _handleDatabaseDisconnect() {
        statusReporter_1.status.configmanager.setHealth('instable');
        backend_1.log.configmanager.warn(`Disconnected from database '${backend_1.glconfig.config.database}'`);
    }
    /**
     * Handles database connection establishment.
     */
    _handleDatabaseConnect() {
        backend_1.log.configmanager.info(`Connected to database '${backend_1.glconfig.config.database}'`);
        this._publishAllConfigs();
    }
    /**
     * Publishes all available configurations.
     * @details should only be used after a database connection establishment
     */
    _publishAllConfigs() {
        // Find all available configurations
        configModel_1.default.find().then(configs => {
            // Publish all available configurations
            for (const config of configs) {
                backend_1.ipc.publish(`${config.name}Config`, config.config);
            }
            statusReporter_1.status.configmanager.setHealth('running');
            backend_1.log.configmanager.info(`Published ${String(configs.length)} available configurations`);
        }).catch((error) => {
            if (this._isRunning) {
                // Start retry timer for publishing all available configurations
                this._publishRetryTimer = setTimeout(() => {
                    this._publishAllConfigs();
                }, backend_1.glconfig.config.databaseReadRetry);
                statusReporter_1.status.configmanager.setHealth('instable');
                backend_1.log.configmanager.error(`Failed getting all available configurations from database: ${error instanceof Error ? error.message : 'unknown'}`);
            }
        });
    }
    /**
     * Handles received IPC requests.
     * @param name the request message name
     * @param payload the request payload
     * @param response the response function
     */
    _onRequest(name, payload, response) {
        if ((0, configManager_1.isIpcSetConfigMessage)(name, payload)) {
            backend_1.log.configmanager.info(`Received SetConfig request via IPC for name '${payload.name}'`);
            this._handleSetConfigMessage(payload, response);
        }
        else {
            backend_1.log.configmanager.warn(`Received unknown IPC request with name '${name}': ${JSON.stringify(payload)}`);
            response({ result: 'error' });
        }
    }
    /**
     * Handles SetConfig message.
     * @param setConfig the SetConfig message
     * @param response the response function
     */
    _handleSetConfigMessage(setConfig, response) {
        // Do not try to update the database if not connected
        if (mongoose_1.default.connection.readyState !== mongoose_2.ConnectionStates.connected) {
            response({ result: 'disconnected' });
            return;
        }
        // Update or create configuration for the specified name
        configModel_1.default.findOneAndUpdate({ name: setConfig.name }, setConfig, { upsert: true }).then(() => {
            response({ result: 'ok' });
            // Publish the new configuration
            backend_1.ipc.publish(`${setConfig.name}Config`, setConfig.config);
        }).catch((error) => {
            backend_1.log.configmanager.error(`Failed SetConfig request via IPC for name '${setConfig.name}': ${error instanceof Error ? error.message : 'unknown'}`);
            response({ result: 'error' });
        });
    }
}
exports.ConfigManager = ConfigManager;
