// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { NoActiveEditorError, UntitledUriPerfettoEditorNotSupportedError } from './utils';

export class PerfettoErrorHandler {
  private showOpenTraceFailMessage: boolean = true;
  private readonly userShownErrors: (new () => Error)[] = [NoActiveEditorError, UntitledUriPerfettoEditorNotSupportedError];

  public constructor() { }

  public handle(error: any): void {
    if (error instanceof Error) {
      console.log("Handled error:", error.message);
    } else {
      console.log("Handled non-Error error:", error);
    }

    if (this.showOpenTraceFailMessage && this.userShownErrors.some(cls => error instanceof cls)) {
      vscode.window.showErrorMessage(`Failed To Open Trace: ${error.message}`, 'Do Not Show Again')
        .then(selection => {
          if (selection === 'Do Not Show Again') {
            this.showOpenTraceFailMessage = false;
          }
        });
    }
  }
}