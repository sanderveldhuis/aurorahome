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
const mqtt_1 = __importDefault(require("mqtt"));
const client = mqtt_1.default.connect('mqtt://127.0.0.1:1235', {
    clientId: 'testclient',
    username: 'test1',
    password: 'test2'
});
client.on('connect', () => {
    console.log('connected');
    client.subscribe('testclient/rpc', err => {
        console.log(err);
    });
});
client.on('packetreceive', packet => {
    if (packet.cmd == 'publish') {
        console.log(packet.topic);
        client.publish('shelly/rpc', '{"id":"Shelly.GetStatus","result":{"sys":{"mac":"aa:bb:cc:dd:ee:ff"},"wifi":{"sta_ip":"127.0.0.1"},"switch:0":{"id":0, "source":"init", "output":true, "brightness":31, "temperature":{"tC":42.9, "tF":109.2},"aenergy":{"total":1139.115,"by_minute":[42.453,39.135,40.474],"minute_ts":1762004640},"apower":2.6,"current":0.018,"voltage":228.0}}}', { qos: 1 });
    }
    else {
        console.log(packet.cmd);
    }
});
// Gracefully shutdown
process.on('SIGINT', () => {
    client.end(true);
});
