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
  ipc,
  log
} from 'glidelite';
import { IpcPayload } from 'glidelite/lib/ipcMessage';
import net from 'node:net';
import { status } from '../statusmanager/statusReporter';
import { ShellyDevice } from './shellyDevice';
import {
  IpcSetLight,
  IpcSetSwitch
} from './types';

/**
 * A Shelly server handling Shelly devices.
 */
export class ShellyServer {
  _server: net.Server = new net.Server();
  _devices: ShellyDevice[] = [];

  /**
   * Starts the Shelly server and listens for new Shelly devices.
   */
  start(): void {
    // Start IPC communication
    ipc.start('shellyserver', 'statusmanager');
    ipc.onIndication((name, payload) => {
      this._onIndication(name, payload);
    });

    // Start status reporting
    status.shellyserver.start('worker', { port: glconfig.shelly.mqtt.port as number, hostname: glconfig.shelly.mqtt.hostname as string });

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
  stop(): void {
    // Stop status reporting
    status.shellyserver.stop();

    // Stop IPC communication
    ipc.stop();

    // First stop the server to prevent Shelly devices being connected before cleaning up the Shelly devices
    this._server.close();

    // Stop all Shelly devices
    for (const device of Object.values(this._devices)) {
      device.stop();
    }
  }

  /**
   * Handles received IPC indications.
   * @param name the indication message name
   * @param payload the indication payload
   */
  _onIndication(name: string, payload: IpcPayload): void {
    if (this._isSetSwitchMessage(name, payload)) {
      log.shellyserver.info(`Received SetSwitch indication via IPC for MAC address: ${name}`);
      for (const device of Object.values(this._devices)) {
        device.setSwitch(name, payload);
      }
    }
    else if (this._isSetLightMessage(name, payload)) {
      log.shellyserver.info(`Received SetLight indication via IPC for MAC address: ${name}`);
      for (const device of Object.values(this._devices)) {
        device.setLight(name, payload);
      }
    }
    else {
      log.shellyserver.warn(`Received unknown IPC indication with name: ${name}: ${JSON.stringify(payload)}`);
    }
  }

  /**
   * Checks whether the specified message is a SetSwitch message.
   * @param name the message name
   * @param payload the message payload
   * @returns `true` when the message is a SetSwitch message, or `false` otherwise
   */
  _isSetSwitchMessage(name: string, payload: IpcPayload): payload is IpcSetSwitch {
    // The message name should contain the Shelly device MAC address, it is checked later
    return typeof payload === 'object' && payload !== null &&
      'id' in payload && typeof payload.id === 'number' &&
      'on' in payload && typeof payload.on === 'boolean';
  }

  /**
   * Checks whether the specified message is a SetLight message.
   * @param name the message name
   * @param payload the message payload
   * @returns `true` when the message is a SetLight message, or `false` otherwise
   */
  _isSetLightMessage(name: string, payload: IpcPayload): payload is IpcSetLight {
    // The message name should contain the Shelly device MAC address, it is checked later
    return typeof payload === 'object' && payload !== null &&
      'id' in payload && typeof payload.id === 'number' &&
      (!('on' in payload) || typeof payload.on === 'boolean') &&
      (!('brightness' in payload) || typeof payload.brightness === 'number');
  }

  /**
   * Handles successfull start of the Shelly server.
   */
  _onListening(): void {
    status.shellyserver.setHealth('running');
    log.shellyserver.info(`Started listening on: ${glconfig.shelly.mqtt.hostname as string}:${glconfig.shelly.mqtt.port as string}`);
  }

  /**
   * Handles errors of the Shelly server.
   * @param error the error
   */
  _onError(error: Error): void {
    log.shellyserver.error(error.message);
    this._server.close();
  }

  /**
   * Handles closure of the Shelly server.
   */
  _onClose(): void {
    this._server.removeAllListeners();
    this.stop();
    log.shellyserver.info('Stopped');
  }

  /**
   * Handles a new Shelly device connecting to the Shelly server.
   * @param socket the client socket
   */
  _onConnection(socket: net.Socket): void {
    log.shellyserver.info(`Device connected with IP address: ${String(socket.remoteAddress)}, number of devices: ${String(this._devices.length + 1)}`);

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
