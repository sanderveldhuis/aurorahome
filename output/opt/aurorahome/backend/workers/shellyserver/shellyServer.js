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
exports.ShellyServer = void 0;
const backend_1 = require("glidelite/backend");
const node_net_1 = __importDefault(require("node:net"));
const shellyServer_1 = require("../../ipc/shellyServer");
const statusReporter_1 = require("../../ipc/statusReporter");
const shellyDevice_1 = require("./shellyDevice");
/**
 * A Shelly Server handling Shelly devices using the MQTT protocol.
 */
class ShellyServer {
    _statusDetails;
    _server = new node_net_1.default.Server();
    _devices = [];
    _username = '';
    _password = '';
    /**
     * Starts the Shelly Server.
     */
    start() {
        // Start IPC communication
        backend_1.ipc.start('shellyserver', 'statusmanager', 'configmanager');
        backend_1.ipc.onIndication((name, payload) => {
            this._onIndication(name, payload);
        });
        backend_1.ipc.to.configmanager.subscribe('ShellyServerConfig', (name, payload) => {
            this._onPublish(name, payload);
        });
        // Start status reporting
        statusReporter_1.status.shellyserver.start('worker');
        statusReporter_1.status.shellyserver.setHealth('disabled');
        backend_1.log.shellyserver.info('Started');
    }
    /**
     * Stops the Shelly server and the connected Shelly devices.
     * @details the Shelly server should not be used anymore after being stopped
     */
    stop() {
        // Stop status reporting
        statusReporter_1.status.shellyserver.stop();
        // Stop IPC communication
        backend_1.ipc.stop();
        // First stop the server to prevent Shelly devices being connected before cleaning up the Shelly devices
        this._server.close();
        // Stop all Shelly devices
        for (const device of Object.values(this._devices)) {
            device.stop();
        }
        backend_1.log.shellyserver.info('Stopped');
    }
    /**
     * Handles received IPC indications.
     * @param name the indication message name
     * @param payload the indication payload
     */
    _onIndication(name, payload) {
        if ((0, shellyServer_1.isIpcSetSwitchMessage)(name, payload)) {
            backend_1.log.shellyserver.info(`Received SetSwitch indication via IPC for MAC address: ${name}`);
            for (const device of Object.values(this._devices)) {
                device.setSwitch(name, payload);
            }
        }
        else if ((0, shellyServer_1.isIpcSetLightMessage)(name, payload)) {
            backend_1.log.shellyserver.info(`Received SetLight indication via IPC for MAC address: ${name}`);
            for (const device of Object.values(this._devices)) {
                device.setLight(name, payload);
            }
        }
        else {
            backend_1.log.shellyserver.warn(`Received unknown IPC indication with name: ${name}: ${JSON.stringify(payload)}`);
        }
    }
    /**
     * Handles received IPC publishes.
     * @param name the publish message name
     * @param payload the publish payload
     */
    _onPublish(name, payload) {
        if ((0, shellyServer_1.isIpcShellyServerConfigMessage)(name, payload)) {
            backend_1.log.shellyserver.info('Received ShellyServerConfig publish via IPC');
            this._handleShellyServerConfig(payload);
        }
        else {
            backend_1.log.shellyserver.warn(`Received unknown IPC publish with name '${name}': ${JSON.stringify(payload)}`);
        }
    }
    /**
     * Handles ShellyServerConfig message.
     * @param config the ShellyServerConfig message
     */
    _handleShellyServerConfig(config) {
        // Always cleanup for safety
        statusReporter_1.status.shellyserver.clearDetails();
        // If no settings are available the MQTT server should stop
        if (!config.mqtt) {
            this._server.close();
            statusReporter_1.status.shellyserver.setHealth('disabled');
            return;
        }
        // Construct the status details
        this._statusDetails = { port: config.mqtt.port, hostname: config.mqtt.hostname };
        statusReporter_1.status.shellyserver.setDetails(this._statusDetails);
        statusReporter_1.status.shellyserver.setHealth('running');
        // Store credentials for future use
        this._username = config.mqtt.username;
        this._password = config.mqtt.password;
        // Ensure to stop any running server before starting the new one
        this._server.close(() => {
            // Register all listeners
            this._server.on('error', (error) => {
                this._onError(error);
            });
            this._server.on('close', () => {
                this._onClose();
            });
            this._server.on('connection', (socket) => {
                this._onConnection(socket);
            });
            // Start listening
            this._server.listen(config.mqtt?.port, config.mqtt?.hostname, () => {
                this._onListening();
            });
        });
    }
    /**
     * Handles successfull start of the Shelly server.
     */
    _onListening() {
        backend_1.log.shellyserver.info(`Started MQTT server on '${String(this._statusDetails?.hostname)}:${String(this._statusDetails?.port)}'`);
    }
    /**
     * Handles errors of the Shelly server.
     * @param error the error
     */
    _onError(error) {
        statusReporter_1.status.shellyserver.setHealth('instable');
        backend_1.log.shellyserver.error(error.message);
        this._server.close();
    }
    /**
     * Handles closure of the Shelly server.
     */
    _onClose() {
        this._server.removeAllListeners();
        backend_1.log.shellyserver.info('Stopped MQTT server');
    }
    /**
     * Handles a new Shelly device connecting to the Shelly server.
     * @param socket the client socket
     */
    _onConnection(socket) {
        backend_1.log.shellyserver.info(`Device connected with IP address: ${String(socket.remoteAddress)}, number of devices: ${String(this._devices.length + 1)}`);
        // Accept new connection
        const device = new shellyDevice_1.ShellyDevice(socket, this._username, this._password);
        this._devices.push(device);
        device.start();
        // Cleanup disconnected Shelly devices
        for (let i = 0; i < this._devices.length; i++) {
            if (!this._devices[i].isConnected()) {
                this._devices[i].stop();
                this._devices.splice(i, 1);
                i--;
            }
        }
    }
}
exports.ShellyServer = ShellyServer;
