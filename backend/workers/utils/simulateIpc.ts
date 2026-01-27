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
  IpcSetConfigResult,
  WeatherManagerSetConfig
} from '../configmanager/types';
import { WeatherManagerConfig } from '../weathermanager/types';

let userInput: readline.Interface | undefined;

/**
 * Prints the help manual.
 */
function printHelp(): void {
  console.log('Enter one of the following commands:');
  console.log('  WeatherManager stop - Stops the WeatherManager by removing the configuration');
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
    console.log(`Stop the WeatherManager`);
    const config: WeatherManagerSetConfig = { name: 'weathermanager', config: {} };
    ipc.to.configmanager.request('SetConfig', config, (name, payload) => {
      const result = payload as IpcSetConfigResult;
      console.log('Stop the WeatherManager result:', result.result);
    });
  }
  else {
    console.error('Unknown command');
    printHelp();
  }
}

// Start IPC
ipc.start('ipcsimulator', 'configmanager', 'weathermanager');
ipc.to.configmanager.subscribe('WeatherManagerConfig', (name, payload) => {
  const config = payload as WeatherManagerConfig;
  console.log('Received WeatherManager configuration:', JSON.stringify(config.source));
});

// Handle user input as commands
console.log('IPC simulator running, press Ctrl+C twice to exit');
printHelp();
waitForUserInput();

// Gracefully shutdown
process.on('SIGINT', () => {
  userInput?.close();
  ipc.stop();
});
