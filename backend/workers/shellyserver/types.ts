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

/**
 * The IPC message for setting a Shelly switch.
 * @details the IPC message name should be the Shelly device MAC address
 */
export interface IpcSetSwitch {
  /** Identifier of the switch component */
  id: number;
  /** `true` for switch on, or `false` otherwise  */
  on: boolean;
}

/**
 * The IPC message for setting a Shelly light.
 * @details the IPC message name should be the Shelly device MAC address
 */
export interface IpcSetLight {
  /** Identifier of the light component */
  id: number;
  /** `true` for light on, or `false` otherwise (optional)  */
  on?: boolean;
  /** Brightness level of the light (optional) */
  brightness?: number;
}

/**
 * The Shelly Server MQTT settings.
 */
export interface ShellyServerMqtt {
  /** The port number of the MQTT server */
  port: number;
  /** The host name of the MQTT server */
  hostname: string;
  /** The MQTT username */
  username: string;
  /** The MQTT password */
  password: string;
}

/**
 * The Shelly Server configuration.
 * @details the message ID for this message is 'ShellyServerConfig'
 */
export interface IpcShellyServerConfig {
  /** The MQTT settings, `undefined` means no MQTT server should be started */
  mqtt?: ShellyServerMqtt;
}

/**
 * The Shelly Server status details.
 */
export interface ShellyServerStatusDetails {
  /** The port number of the MQTT server */
  port: number;
  /** The host name of the MQTT server */
  hostname: string;
}
