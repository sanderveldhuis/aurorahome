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
exports.StatusReporter = void 0;
const glidelite_1 = require("glidelite");
/**
 * Class providing cyclic status reporting to the Status Manager.
 */
class StatusReporter {
    _health = 'starting';
    _status;
    _interval;
    /**
     * Starts reporting the status cyclic to the Status Manager.
     * @param name the application name
     * @param type the application name
     * @param status the application status (optional)
     */
    start(name, type, status) {
        this._status = status;
        this._interval = setInterval(() => {
            glidelite_1.ipc.to[glidelite_1.glconfig.status.endpoint].indication('status', { name, type, health: this._health, status: this._status });
        }, glidelite_1.glconfig.status.interval);
    }
    /**
     * Stops reporting the status to the Status Manager.
     */
    stop() {
        clearInterval(this._interval);
    }
    /**
     * Sets the health to be reported to the Status Manager.
     * @param health the health
     */
    setHealth(health) {
        this._health = health;
    }
    /**
     * Sets the status to be reported to the Status Manager.
     * @param status the status
     */
    setStatus(status) {
        this._status = status;
    }
}
exports.StatusReporter = StatusReporter;
