// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { Utils } from 'vscode-uri';
import { PerfettoSession } from './webview';
import { Unit, TraceOpenFailure, Expected, Err, Ok } from './constants';
import { Context } from './context';

export async function openTraceForActiveEditor(_context: Context): Promise<Expected<Unit>> {
  const activeDoc = vscode.window.activeTextEditor?.document;
  if (!activeDoc) {
    return Err(TraceOpenFailure.NoActiveDocument);
  }

  return vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    cancellable: true,
    title: "Opening Trace"
  }, (_progress, token) => {
    return new Promise<Expected<Unit>>(resolve => {
      const session = new PerfettoSession();
      const tokenListener = token.onCancellationRequested(() => session.deactivate());

      const fileName = Utils.basename(activeDoc.uri);
      const fileBuffer = new TextEncoder().encode(activeDoc.getText()).buffer;

      session.activate(fileName, fileBuffer, () => resolve(Ok(Unit.unit)), () => {
        tokenListener.dispose();
        resolve(Err(TraceOpenFailure.UserCanceledAction));
      });
    });
  });
}

export async function openTraceForFile(context: Context, fileUri: vscode.Uri | undefined): Promise<Expected<vscode.Uri>> {
  const selection = fileUri ? Ok(fileUri) : (await context.fileSelector.selectFile());
  if (!selection.ok) {
    return Err(selection.err);
  }

  return vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    cancellable: true,
    title: "Opening Trace"
  }, (_progress, token) => {
    return new Promise<Expected<vscode.Uri>>(resolve => {
      const session = new PerfettoSession();
      const tokenListener = token.onCancellationRequested(() => session.deactivate());

      const fileName = Utils.basename(selection.val);
      Promise.resolve<Uint8Array>(vscode.workspace.fs.readFile(selection.val))
        .then(fileBuffer => fileBuffer.buffer)
        .then(fileBuffer => {
          session.activate(fileName, fileBuffer, () => resolve(Ok(selection.val)), () => {
            tokenListener.dispose();
            resolve(Err(TraceOpenFailure.UserCanceledAction));
          });
        })
        .catch(() => resolve(Err(TraceOpenFailure.FileReadFailure)));
    });
  });
}
