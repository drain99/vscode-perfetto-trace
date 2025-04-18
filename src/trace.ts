// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { Utils } from 'vscode-uri';
import { PerfettoSession } from './webview';
import { TraceOpenResult } from './constants';

export class TraceOpenResultHandler {
  private showOpenTraceFailMessage: boolean;

  public constructor() {
    this.showOpenTraceFailMessage = true;
  }

  public handle(result: TraceOpenResult): boolean {
    // Show error message on trace open failure but allow user to disable these messages
    if (result !== TraceOpenResult.Success && this.showOpenTraceFailMessage) {
      vscode.window.showErrorMessage(`Failed to open trace: ${result}`, 'Do Not Show Again')
        .then(selection => {
          if (selection === 'Do Not Show Again') {
            this.showOpenTraceFailMessage = false;
          }
        });
    }
    return result === TraceOpenResult.Success;
  }
}

type Expected<T> = { ok: true, val: T } | { ok: false, err: TraceOpenResult };
function Ok<T>(val: T): Expected<T> { return { ok: true, val }; }
function Err<T>(err: TraceOpenResult): Expected<T> { return { ok: false, err }; }

async function showFileSelector(fileUri: vscode.Uri | undefined): Promise<Expected<vscode.Uri>> {
  if (fileUri) {
    return Ok(fileUri);
  }

  const selection = await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectMany: false });
  if (!selection) {
    return Err(TraceOpenResult.NoFileSelected);
  }
  if (selection.length !== 1) {
    return Err(TraceOpenResult.MultipleFileSelected);
  }
  return Ok(selection[0]);
}

export function openTraceForActiveEditor(_context: vscode.ExtensionContext): Thenable<TraceOpenResult> {
  return new Promise<TraceOpenResult>(resolve => {
    const activeDoc = vscode.window.activeTextEditor?.document;
    if (!activeDoc) {
      return resolve(TraceOpenResult.NoActiveEditor);
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

        const fileName = Utils.basename(activeDoc.uri);
        const fileBuffer = new TextEncoder().encode(activeDoc.getText()).buffer;

        perfettoSession.activate(fileName, fileBuffer, () => {
          tokenListener.dispose();
          return resolve(TraceOpenResult.UserCanceledAction);
        }, () => resolve(TraceOpenResult.Success));
      });
    }));
  });
}

export function openTraceForFile(_context: vscode.ExtensionContext, fileUri: vscode.Uri | undefined): Thenable<TraceOpenResult> {
  return showFileSelector(fileUri).then(selection => {
    return new Promise<TraceOpenResult>(resolve => {
      if (!selection.ok) {
        return resolve(selection.err);
      }

      const fileUri = selection.val;

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

          const fileName = Utils.basename(fileUri);
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
