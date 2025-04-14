// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import * as path from 'path';
import { PerfettoSession } from './webview';
import { TraceOpenResult } from './constants';

export class TraceOpenResultHandler {
  private showOpenTraceFailMessage: boolean;

  public constructor() {
    this.showOpenTraceFailMessage = true;
  }

  public handle(result: TraceOpenResult): void {
    // Show error message on trace open failure but allow user to disable these messages
    if (result !== TraceOpenResult.Success && this.showOpenTraceFailMessage) {
      vscode.window.showErrorMessage(`Failed to open trace: ${result}`, 'Do Not Show Again')
        .then(selection => {
          if (selection === 'Do Not Show Again') {
            this.showOpenTraceFailMessage = false;
          }
        });
    }
  }
}

function hasValidTraceExtension(filePath: string): boolean {
  // Skip extention check for now, perfetto accepts a variety of formats with non-standard extensions
  return true;
  const validExtensions = [".json", ".trace", ".chrome-trace", ".perfetto-trace"];
  const ext = path.extname(filePath);
  return validExtensions.includes(ext);
}

export function openTraceForActiveEditor(_context: vscode.ExtensionContext): Thenable<TraceOpenResult> {
  return new Promise<TraceOpenResult>(resolve => {
    const activeDoc = vscode.window.activeTextEditor?.document;
    if (!activeDoc) {
      return resolve(TraceOpenResult.NoActiveEditor);
    }

    const filePath = activeDoc.fileName;
    if (!hasValidTraceExtension(filePath)) {
      return resolve(TraceOpenResult.FileInvalidExtention);
    }

    return resolve(vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      cancellable: true,
      title: "Opening Trace"
    }, (_progress, token) => {
      return new Promise<TraceOpenResult>(resolve => {
        const perfettoSession = new PerfettoSession();
        const tokenListener = token.onCancellationRequested(() => {
          perfettoSession.deactivate();
        });

        const fileName = path.basename(filePath);
        const fileBuffer = new TextEncoder().encode(activeDoc.getText()).buffer;

        perfettoSession.activate(fileName, fileBuffer, () => {
          tokenListener.dispose();
          return resolve(TraceOpenResult.UserCanceledAction);
        }, () => resolve(TraceOpenResult.Success));
      });
    }));
  });
}

export function openTraceForFile(_context: vscode.ExtensionContext): Thenable<TraceOpenResult> {
  return vscode.window.showOpenDialog({ canSelectFiles: true, canSelectMany: false }).then(selection => {
    return new Promise<TraceOpenResult>(resolve => {
      if (!selection) {
        return resolve(TraceOpenResult.NoFileSelected);
      }

      if (selection.length !== 1) {
        return resolve(TraceOpenResult.MultipleFileSelected);
      }

      const fileUri = selection[0];
      if (!hasValidTraceExtension(fileUri.fsPath)) {
        return resolve(TraceOpenResult.FileInvalidExtention);
      }

      return resolve(vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        cancellable: true,
        title: "Opening Trace"
      }, (_progress, token) => {
        return new Promise<TraceOpenResult>(resolve => {
          const perfettoSession = new PerfettoSession();
          const tokenListener = token.onCancellationRequested(() => {
            perfettoSession.deactivate();
          });

          const fileName = path.basename(fileUri.fsPath);
          vscode.workspace.fs.readFile(fileUri).then(fileBuffer => {
            perfettoSession.activate(fileName, fileBuffer.buffer, () => {
              tokenListener.dispose();
              return resolve(TraceOpenResult.UserCanceledAction);
            }, () => resolve(TraceOpenResult.Success));
          });
        });
      }));
    });
  });
}
