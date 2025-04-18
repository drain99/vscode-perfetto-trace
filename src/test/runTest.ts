// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index.js');

    await runTests({ extensionDevelopmentPath, extensionTestsPath, launchArgs: ["test-workspace"] });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

main();
