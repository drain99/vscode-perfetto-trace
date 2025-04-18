// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as path from 'path';
import Mocha from 'mocha';
import * as glob from 'glob';

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((resolve, reject) => {
    const testsStream = glob.globStream('**/**.test.js', {cwd: testsRoot});
    testsStream.on('data', file => { mocha.addFile(path.resolve(testsRoot, file)); });
    testsStream.on('error', err => reject(err));
    testsStream.on('end', () => {
      try {
        mocha.run(failures => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}