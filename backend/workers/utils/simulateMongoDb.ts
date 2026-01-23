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

import { downloadMongoDbWithVersionInfo } from '@mongodb-js/mongodb-downloader';
import { exec } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  rmSync
} from 'node:fs';
import { join } from 'node:path';

const mongoDir = join(__dirname, '..', '..', '..', 'node_modules', '.tmp', 'mongodb');
const mongoDbDir = join(mongoDir, 'db');

// Download and extract MongoDB latest version for current host
console.log('Downloading and extracting MongoDB...');
downloadMongoDbWithVersionInfo({ directory: mongoDir, useLockfile: true }).then(result => {
  // Create database directory
  if (existsSync(mongoDbDir) && process.argv.includes('--clean')) {
    console.log('Removing database...');
    rmSync(mongoDbDir, { recursive: true });
  }
  if (!existsSync(mongoDbDir)) {
    console.log('Creating database...');
    mkdirSync(mongoDbDir);
  }

  // Run MongoDB
  console.log('Starting MongoDB...');
  exec(`mongod --dbpath=${mongoDbDir}`, { cwd: result.downloadedBinDir }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Failed starting MongoDB: ${error}`);
    }
    else {
      console.log(stdout);
      console.log(stderr);
    }
  });
}).catch(error => {
  console.error(`Failed downloading and extracting MongoDB: ${error}`);
});
