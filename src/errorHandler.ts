// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { Unit, Expected, TraceOpenFailure } from './constants';

export class TraceOpenErrorHandler {
  private showOpenTraceFailMessage: boolean;
  private userShownErrors: TraceOpenFailure[];

  public constructor() {
    this.showOpenTraceFailMessage = true;
    this.userShownErrors = [TraceOpenFailure.NoActiveDocument, TraceOpenFailure.FileReadFailure];
  }

  public handleTracked(result: Expected<any>): boolean {
    if (!result.ok) {
      console.log("Tracked error detected:", result.err);
      if (this.showOpenTraceFailMessage && this.userShownErrors.includes(result.err)) {
        vscode.window.showErrorMessage(`Failed To Open Trace: ${result.err}`, 'Do Not Show Again')
          .then(selection => {
            if (selection === 'Do Not Show Again') {
              this.showOpenTraceFailMessage = false;
            }
          });
      }
    }
    return result.ok;
  }

  public handleUnknown(err: any): boolean {
    console.log("Unknown error detected:", err);
    return false;
  }
}