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

import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://127.0.0.1:1235', {
  username: 'test1',
  password: 'test2'
});
client.on('connect', () => {
  console.log('connected');

  client.subscribe(['test-topic1', 'test-topic2']);
  client.publish('test-topic', 'hoi', { qos: 2 });

  /*client.subscribe('presence', err => {
    if (!err) {
      client.publish('presence', 'Hello mqtt');
    }
  });*/
});

client.on('packetreceive', packet => {
  console.log(packet.cmd);
});

// Gracefully shutdown
process.on('SIGINT', () => {
  client.end(true);
});

/*client.on('message', (topic, message) => {
  // message is Buffer
  console.log(message.toString());
  client.end();
});*/
