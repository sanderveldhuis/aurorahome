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

import { ipc } from 'glidelite';
import readline from 'node:readline';
import {
  IpcSetConfigResponse,
  IpcShellyServerSetConfig,
  IpcWeatherManagerSetConfig
} from '../configmanager/types';
import { IpcShellyServerConfig } from '../shellyserver/types';

let userInput: readline.Interface | undefined;

/**
 * Prints the help manual.
 */
function printHelp(): void {
  console.log('Enter one of the following commands:');
  console.log('  WeatherManager stop - Stops the Weather Manager by removing the configuration');
  console.log('  ShellyServer stop - Stops the Shelly Server by removing the configuration');
  console.log('  ShellyServer <port> - Starts the Shelly Server by setting the configuration');
}

/**
 * Waits for user input.
 */
function waitForUserInput(): void {
  userInput = readline.createInterface({ input: process.stdin, output: process.stdout });
  userInput.question('', input => {
    userInput?.close();
    handleUserInput(input);
    waitForUserInput();
  });
}

/**
 * Handles user input.
 * @param input the user input
 */
function handleUserInput(input: string): void {
  // Parse command
  const command = input.split(/\s+/);
  if (command.length <= 0) {
    return;
  }

  // Handle command
  if (command[0] === 'WeatherManager' && command.length === 2 && command[1] === 'stop') {
    console.log(`Stop the Weather Manager`);
    const setConfig: IpcWeatherManagerSetConfig = { name: 'WeatherManager', config: {} };
    ipc.to.configmanager.request('SetConfig', setConfig, (name, payload) => {
      const response = payload as IpcSetConfigResponse;
      console.log('Stop the Weather Manager result:', response.result);
    });
  }
  else if (command[0] === 'ShellyServer' && command.length === 2 && command[1] === 'stop') {
    console.log(`Stop the Shelly Server`);
    const setConfig: IpcShellyServerSetConfig = { name: 'ShellyServer', config: {} };
    ipc.to.configmanager.request('SetConfig', setConfig, (name, payload) => {
      const response = payload as IpcSetConfigResponse;
      console.log('Stop the Shelly Server result:', response.result);
    });
  }
  else if (command[0] === 'ShellyServer' && command.length === 2 && !Number.isNaN(command[1])) {
    console.log(`Start the Shelly Server`);
    const config: IpcShellyServerConfig = { mqtt: { port: Number(command[1]), hostname: '0.0.0.0', username: 'test1', password: 'test2' } };
    const setConfig: IpcShellyServerSetConfig = { name: 'ShellyServer', config };
    ipc.to.configmanager.request('SetConfig', setConfig, (name, payload) => {
      const response = payload as IpcSetConfigResponse;
      console.log('Start the Shelly Server result:', response.result);
    });
  }
  else {
    console.error('Unknown command');
    printHelp();
  }
}

// Start IPC
ipc.start('ipcsimulator', 'configmanager');

// Handle user input as commands
console.log('IPC simulator running, press Ctrl+C twice to exit');
printHelp();
waitForUserInput();

// Gracefully shutdown
process.on('SIGINT', () => {
  userInput?.close();
  ipc.stop();
});
