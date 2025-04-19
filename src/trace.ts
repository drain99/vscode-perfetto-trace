// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { Utils } from 'vscode-uri';
import { PerfettoSession } from './webview';
import { Expected, Ok, Err } from './utils';
import { TraceOpenFailure, TraceOpenSuccess } from './constants';

export class TraceOpenResultHandler {
  private showOpenTraceFailMessage: boolean;

  public constructor() {
    this.showOpenTraceFailMessage = true;
  }

  public handle(result: Expected<TraceOpenSuccess>): boolean {
    // Show error message on trace open failure but allow user to disable these messages
    if (!result.ok && this.showOpenTraceFailMessage) {
      vscode.window.showErrorMessage(`Failed to open trace: ${result.err}`, 'Do Not Show Again')
        .then(selection => {
          if (selection === 'Do Not Show Again') {
            this.showOpenTraceFailMessage = false;
          }
        });
    }
    return result.ok;
  }
}

async function showFileSelector(fileUri: vscode.Uri | undefined): Promise<Expected<vscode.Uri>> {
  if (fileUri) {
    return Ok(fileUri);
  }

  const files = await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectMany: false });
  if (!files) {
    return Err(TraceOpenFailure.NoFileSelected);
  }
  if (files.length !== 1) {
    return Err(TraceOpenFailure.MultipleFileSelected);
  }
  return Ok(files[0]);
}

export async function openTraceForActiveEditor(_context: vscode.ExtensionContext): Promise<Expected<TraceOpenSuccess>> {
  const activeDoc = vscode.window.activeTextEditor?.document;
  if (!activeDoc) {
    return Err(TraceOpenFailure.NoActiveEditor);
  }

  return vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    cancellable: true,
    title: "Opening Trace"
  }, (_progress, token) => {
    return new Promise<Expected<TraceOpenSuccess>>(resolve => {
      const sess = new PerfettoSession();
      const tokenListener = token.onCancellationRequested(() => sess.deactivate());

      const fileName = Utils.basename(activeDoc.uri);
      const fileBuffer = new TextEncoder().encode(activeDoc.getText()).buffer;

      sess.activate(fileName, fileBuffer, () => resolve(Ok(TraceOpenSuccess.Success)), () => {
        tokenListener.dispose();
        resolve(Err(TraceOpenFailure.UserCanceledAction));
      });
    });
  });
}

export async function openTraceForFile(_context: vscode.ExtensionContext, fileUri: vscode.Uri | undefined): Promise<Expected<TraceOpenSuccess>> {
  const selection = await showFileSelector(fileUri);
  if (!selection.ok) {
    return Err(selection.err);
  }

  return vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    cancellable: true,
    title: "Opening Trace"
  }, (_progress, token) => {
    return new Promise<Expected<TraceOpenSuccess>>(resolve => {
      const sess = new PerfettoSession();
      const tokenListener = token.onCancellationRequested(() => sess.deactivate());

      const fileName = Utils.basename(selection.val);
      vscode.workspace.fs.readFile(selection.val).then(fileBuffer => fileBuffer.buffer).then(fileBuffer => {
        sess.activate(fileName, fileBuffer, () => resolve(Ok(TraceOpenSuccess.Success)), () => {
          tokenListener.dispose();
          resolve(Err(TraceOpenFailure.UserCanceledAction));
        });
      });
    });
  });
}
