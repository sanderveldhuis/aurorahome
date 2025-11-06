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
const glidelite_1 = require("glidelite");
const node_net_1 = __importDefault(require("node:net"));
const statusReporter_1 = require("../controller/statusReporter");
const shellyDevice_1 = require("./shellyDevice");
/**
 * A Shelly server handling Shelly devices.
 */
class ShellyServer {
    _server = new node_net_1.default.Server();
    _devices = [];
    _statusReporter = new statusReporter_1.StatusReporter();
    /**
     * Starts the Shelly server and listens for new Shelly devices.
     */
    start() {
        // Start IPC communication
        glidelite_1.ipc.start(glidelite_1.glconfig.shelly.endpoint, glidelite_1.glconfig.status.endpoint);
        glidelite_1.ipc.onIndication((name, payload) => {
            this._onIndication(name, payload);
        });
        // Start status reporting
        this._statusReporter.start(glidelite_1.glconfig.shelly.endpoint, 'worker', { port: glidelite_1.glconfig.shelly.mqtt.port, hostname: glidelite_1.glconfig.shelly.mqtt.hostname });
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
        this._server.listen(glidelite_1.glconfig.shelly.mqtt.port, glidelite_1.glconfig.shelly.mqtt.hostname, () => {
            this._onListening();
        });
    }
    /**
     * Stops the Shelly server and the connected Shelly devices.
     * @details the Shelly server should not be used anymore after being stopped
     */
    stop() {
        // Stop status reporting
        this._statusReporter.stop();
        // Stop IPC communication
        glidelite_1.ipc.stop();
        // First stop the server to prevent Shelly devices being connected before cleaning up the Shelly devices
        this._server.close();
        // Stop all Shelly devices
        for (const device of Object.values(this._devices)) {
            device.stop();
        }
    }
    /**
     * Handles IPC indications.
     * @param name the indication name
     * @param payload the indication payload
     */
    _onIndication(name, payload) {
        // Forward command to all devices
        if (typeof payload === 'object' && payload !== null) {
            glidelite_1.log.shellyserver.info(`Received command with name: ${name}, payload: ${JSON.stringify(payload)}`);
            for (const device of Object.values(this._devices)) {
                device.command(name, payload);
            }
        }
        else {
            glidelite_1.log.shellyserver.error(`Received unknown command with name: ${name}, payload: ${String(payload)}`);
        }
    }
    /**
     * Handles successfull start of the Shelly server.
     */
    _onListening() {
        this._statusReporter.setHealth('running');
        glidelite_1.log.shellyserver.info(`Started listening on: ${glidelite_1.glconfig.shelly.mqtt.hostname}:${glidelite_1.glconfig.shelly.mqtt.port}`);
    }
    /**
     * Handles errors of the Shelly server.
     * @param error the error
     */
    _onError(error) {
        glidelite_1.log.shellyserver.error(error.message);
        this._server.close();
    }
    /**
     * Handles closure of the Shelly server.
     */
    _onClose() {
        this._server.removeAllListeners();
        this.stop();
        glidelite_1.log.shellyserver.info('Stopped');
    }
    /**
     * Handles a new Shelly device connecting to the Shelly server.
     * @param socket the client socket
     */
    _onConnection(socket) {
        glidelite_1.log.shellyserver.info(`Device connected with IP address: ${String(socket.remoteAddress)}, number of devices: ${String(this._devices.length + 1)}`);
        // Accept new connection
        const device = new shellyDevice_1.ShellyDevice(socket);
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
