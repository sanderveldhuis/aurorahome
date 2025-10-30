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

import {
  glconfig,
  log
} from 'glidelite';
import net from 'node:net';
import { AuroraWorker } from '../controller/auroraWorker';
import { ShellyDevice } from './shellyDevice';

/**
 * A Shelly server handling Shelly devices.
 */
export class ShellyServer extends AuroraWorker {
  _server: net.Server = new net.Server();
  _devices: ShellyDevice[] = [];

  /**
   * Starts the Shelly server and listens for new Shelly devices.
   */
  start() {
    // Start IPC and health reporting
    super.start(glconfig.shelly.endpoint);

    // Register all listeners
    this._server.on('error', (error: Error) => {
      this._onError(error);
    });
    this._server.on('close', () => {
      this._onClose();
    });
    this._server.on('connection', (socket: net.Socket) => {
      this._onConnection(socket);
    });

    // Start listening
    this._server.listen(glconfig.shelly.mqtt.port, glconfig.shelly.mqtt.hostname, () => {
      this._onListening();
    });
  }

  /**
   * Stops the Shelly server and the connected Shelly devices.
   * @details the Shelly server should not be used anymore after being stopped
   */
  stop() {
    // Stop IPC and health reporting
    super.stop();

    // First stop the server to prevent Shelly devices being connected before cleaning up the Shelly devices
    this._server.close();

    // Stop all Shelly devices
    for (const device of Object.values(this._devices)) {
      device.stop();
    }
  }

  /**
   * Handles successfull start of the Shelly server.
   */
  _onListening() {
    super.setStatus('running');
  }

  /**
   * Handles errors of the Shelly server.
   * @param error the error
   */
  _onError(error: Error) {
    log.shellyserver.error(error.message);
    this._server.close();
  }

  /**
   * Handles closure of the Shelly server.
   */
  _onClose() {
    this._server.removeAllListeners();
    this.stop();
  }

  /**
   * Handles a new Shelly device connecting to the Shelly server.
   * @param socket the client socket
   */
  _onConnection(socket: net.Socket) {
    // Accept new connection
    const device = new ShellyDevice(socket);
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
