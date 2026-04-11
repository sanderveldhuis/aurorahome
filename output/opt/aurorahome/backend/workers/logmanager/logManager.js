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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogManager = void 0;
const backend_1 = require("glidelite/backend");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const logManager_1 = require("../../ipc/logManager");
const statusReporter_1 = require("../../ipc/statusReporter");
const MAX_RESPONSE_SIZE = 900000; // 0.9MB
/**
 * A Log Manager retrieving log data from log files and responds the log messages via IPC on requests.
 */
class LogManager {
    /**
     * Starts the Log Manager.
     */
    start() {
        // Start IPC communication
        backend_1.ipc.start('logmanager', 'statusmanager');
        backend_1.ipc.onRequest((name, payload, response) => {
            this._onRequest(name, payload, response);
        });
        // Start status reporting
        statusReporter_1.status.logmanager.start('worker');
        statusReporter_1.status.logmanager.setHealth('running');
        backend_1.log.logmanager.info('Started');
    }
    /**
     * Stops the Log Manager.
     * @details the Log Manager should not be used anymore after being stopped
     */
    stop() {
        // Stop status reporting
        statusReporter_1.status.logmanager.stop();
        // Stop IPC communication
        backend_1.ipc.stop();
        backend_1.log.logmanager.info('Stopped');
    }
    /**
     * Handles received IPC requests.
     * @param name the request message name
     * @param payload the request payload
     * @param response the response function
     */
    _onRequest(name, payload, response) {
        if ((0, logManager_1.isIpcGetLogMessage)(name, payload)) {
            this._handleGetLogMessage(response);
        }
        else {
            backend_1.log.logmanager.warn(`Received unknown IPC request with name '${name}': ${JSON.stringify(payload)}`);
            response({ result: 'error' });
        }
    }
    /**
     * Handles GetLog message.
     * @param getConfig the GetLog message
     * @param response the response function
     */
    _handleGetLogMessage(response) {
        const responseMsg = { result: 'ok', logs: [] };
        // If the name element is available in the GlideLite configuration file it runs in production mode
        if ('name' in backend_1.glconfig) {
            responseMsg.logs?.push(...this._readLog((0, node_path_1.join)('/', 'var', 'log', backend_1.glconfig.name, 'api.log')));
            responseMsg.logs?.push(...this._readLog((0, node_path_1.join)('/', 'var', 'log', backend_1.glconfig.name, 'api.log.1')));
            responseMsg.logs?.push(...this._readLog((0, node_path_1.join)('/', 'var', 'log', backend_1.glconfig.name, 'workers.log')));
            responseMsg.logs?.push(...this._readLog((0, node_path_1.join)('/', 'var', 'log', backend_1.glconfig.name, 'workers.log.1')));
        }
        else {
            responseMsg.logs?.push(...this._readLog((0, node_path_1.join)(__dirname, 'example.log')));
        }
        // Prevent overflooding the IPC buffer which is 1MB
        const size = JSON.stringify(responseMsg).length;
        if (size > MAX_RESPONSE_SIZE) {
            backend_1.log.logmanager.error(`Failed constructing IPC response due to exceeding IPC buffer size with '${String(size)}' bytes`);
            response({ result: 'error' });
        }
        else {
            response(responseMsg);
        }
    }
    /**
     * Reads the log messages from the specified log file.
     * @param file the log file
     * @returns the log messages
     */
    _readLog(file) {
        const logs = [];
        try {
            const content = (0, node_fs_1.readFileSync)(file, 'utf8');
            // Parse all log messages
            const regex = new RegExp('^([\\d]+):(DBG|INF|WRN|ERR):([\\w]+):(.*?(?=^[\\d]+)|.*)', 'gms');
            let match = regex.exec(content);
            while (match) {
                // Statisfy TypeScript, should not happen otherwise the regex is invalid
                if (match[2] !== 'DBG' && match[2] !== 'INF' && match[2] !== 'WRN' && match[2] !== 'ERR') {
                    continue;
                }
                logs.push({ timestamp: Number(match[1]), level: match[2], name: match[3], message: match[4].trim() });
                match = regex.exec(content);
            }
        }
        catch {
            // Ignore
        }
        return logs;
    }
}
exports.LogManager = LogManager;
