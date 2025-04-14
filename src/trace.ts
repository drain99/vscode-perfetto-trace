// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import * as path from 'path';
import { getWebviewHTML } from './webview';
import { TraceOpenResult, WebviewConsts } from './constants';

function hasValidTraceExtension(filePath: string): boolean {
  // Skip extention check for now, perfetto accepts a variety of formats with non-standard extensions
  return true;
  const validExtensions = [".json", ".trace", ".chrome-trace", ".perfetto-trace"];
  const ext = path.extname(filePath);
  return validExtensions.includes(ext);
}

export function openTraceForActiveEditor(_context: vscode.ExtensionContext): Thenable<TraceOpenResult> {
  // Initial sanity checks before showing progress to user to avoid sudden progress bar start & end
  const activeDoc = vscode.window.activeTextEditor?.document;
  if (!activeDoc) {
    return Promise.resolve(TraceOpenResult.NoActiveEditor);
  }

  const filePath = activeDoc.fileName;
  if (!hasValidTraceExtension(filePath)) {
    return Promise.resolve(TraceOpenResult.FileInvalidExtention);
  }

  return vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    cancellable: true,
    title: "Opening Trace"
  }, (_progress, token) => {
    return new Promise<TraceOpenResult>(resolve => {
      let panel: vscode.WebviewPanel | undefined;
      token.onCancellationRequested(() => {
        if (panel) {
          panel.dispose();
        }
        return resolve(TraceOpenResult.UserCanceledProgress);
      });

      const fileName = path.basename(filePath);
      const fileBuffer = new TextEncoder().encode(activeDoc.getText()).buffer;

      panel = vscode.window.createWebviewPanel(
        "perfettoUi", `${fileName} - Perfetto`,
        { viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
        { enableScripts: true, retainContextWhenHidden: true }
      );

      let panelCallbacks: vscode.Disposable[] = [];
      panel.onDidDispose(() => {
        console.log('perfetto webview is disposed, disposing callbacks');
        panelCallbacks.forEach(disposable => disposable.dispose());
        return resolve(TraceOpenResult.UserClosedWindow);
      }, null, panelCallbacks);

      // See [Note: State machine to synchronize between extension, webview & perfetto ui iframe]
      panel.webview.onDidReceiveMessage(message => {
        switch (message.command) {
          case WebviewConsts.VsCodeUiReadyCommand:
            panel.webview.postMessage({
              command: WebviewConsts.VsCodeLoadTraceCommand,
              payload: {
                buffer: fileBuffer,
                title: fileName,
                fileName: fileName,
                keepApiOpen: true,
              }
            });
            return;
          case WebviewConsts.VsCodeTraceLoadedCommand:
            return resolve(TraceOpenResult.Success);
          default:
            console.log("webview received unexpected message:", message);
        }
      }, null, panelCallbacks);

      panel.webview.html = getWebviewHTML(panel.webview.cspSource);
    });
  });
}

export function openTraceForFile(_context: vscode.ExtensionContext): Thenable<TraceOpenResult> {
  return vscode.window.showOpenDialog({ canSelectFiles: true, canSelectMany: false }).then(selection => {
    // Initial sanity checks before showing progress to user to avoid sudden progress bar start & end
    if (!selection) {
      return Promise.resolve(TraceOpenResult.NoFileSelected);
    }

    if (selection.length !== 1) {
      return Promise.resolve(TraceOpenResult.MultipleFileSelected);
    }

    const fileUri = selection[0];
    if (!hasValidTraceExtension(fileUri.fsPath)) {
      return Promise.resolve(TraceOpenResult.FileInvalidExtention);
    }

    return vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      cancellable: true,
      title: "Opening Trace"
    }, (_progress, token) => {
      return new Promise<TraceOpenResult>(resolve => {
        let panel: vscode.WebviewPanel | undefined;
        token.onCancellationRequested(() => {
          if (panel) {
            panel.dispose();
          }
          return resolve(TraceOpenResult.UserCanceledProgress);
        });

        const fileName = path.basename(fileUri.fsPath);
        vscode.workspace.fs.readFile(fileUri).then(fileBuffer => {
          panel = vscode.window.createWebviewPanel(
            "perfettoUi", `${fileName} - Perfetto`,
            { viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
            { enableScripts: true, retainContextWhenHidden: true }
          );

          let panelCallbacks: vscode.Disposable[] = [];
          panel.onDidDispose(() => {
            console.log('perfetto webview is disposed, disposing callbacks');
            panelCallbacks.forEach(disposable => disposable.dispose());
            return resolve(TraceOpenResult.UserClosedWindow);
          }, null, panelCallbacks);

          panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
              case WebviewConsts.VsCodeUiReadyCommand:
                panel!.webview.postMessage({
                  command: WebviewConsts.VsCodeLoadTraceCommand,
                  payload: {
                    buffer: fileBuffer.buffer,
                    title: fileName,
                    fileName: fileName,
                    keepApiOpen: true,
                  }
                });
                return;
              case WebviewConsts.VsCodeTraceLoadedCommand:
                return resolve(TraceOpenResult.Success);
              default:
                console.log("webview received unexpected message:", message);
            }
          }, null, panelCallbacks);

          panel.webview.html = getWebviewHTML(panel.webview.cspSource);
        });
      });
    });
  });
}