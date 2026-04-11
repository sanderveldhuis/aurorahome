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
const express_1 = __importDefault(require("express"));
const backend_1 = require("glidelite/backend");
const logManager_1 = require("../../ipc/logManager");
// Construct the Express router
const router = express_1.default.Router();
// The router implementation
router.get('/log', (req, res, next) => {
    backend_1.ipc.to.logmanager.request('GetLog', undefined, (name, payload) => {
        if ((0, logManager_1.isIpcGetLogResponseMessage)(name, payload)) {
            if (payload.result === 'ok') {
                const response = { logs: payload.logs ?? [] };
                res.status(200).json(response);
            }
            else {
                next(new Error(`Failed getting log via GET /log, result: ${payload.result}`));
            }
        }
        else {
            next(new Error(`Received unknown IPC response with name '${name}': ${JSON.stringify(payload)}`));
        }
    });
});
exports.default = router;
