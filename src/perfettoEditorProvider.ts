// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { PerfettoDocument } from './perfettoDocument';
import { PerfettoEditor } from './perfettoEditor';
import { WebviewDisposedError, withCancellationToken } from './utils';
import { PerfettoErrorHandler } from './errorHandler';
import { PersistentFileSelector } from './fileSelector';
import { EditorViewTypes } from './constants';
import { resolve } from 'path';

export class PerfettoEditorProvider implements vscode.CustomReadonlyEditorProvider<PerfettoDocument> {
  public readonly context: vscode.ExtensionContext;
  public readonly fileSelector: PersistentFileSelector;
  public readonly errorHandler: PerfettoErrorHandler;

  public constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.fileSelector = new PersistentFileSelector();
    this.errorHandler = new PerfettoErrorHandler();
  }

  public openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Promise<PerfettoDocument> {
    return PerfettoDocument.create(uri, openContext, token);
  }

  public createWebviewPanelForEditor(document: PerfettoDocument, token: vscode.CancellationToken): Promise<vscode.WebviewPanel> {
    const webviewPromise = Promise.resolve(vscode.window.createWebviewPanel(
      EditorViewTypes.PerfettoWebviewEditor,
      `${document.fileName} - Perfetto`,
      { viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
      { retainContextWhenHidden: true }));

    return withCancellationToken(webviewPromise, token);
  }

  public initializeCustomEditor(document: PerfettoDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Promise<PerfettoEditor> {
    const editorPromise = PerfettoEditor.create(document, webviewPanel, token);

    return editorPromise.then(editor => {
      this.fileSelector.markAsMostRecentlyOpened(editor.document.uri);
      return editor;
    });
  }

  public loadCustomEditor(editor: PerfettoEditor): Promise<void> {
    const loadPromise = new Promise<void>((resolve, reject) => {
      editor.webviewPanel.onDidDispose(() => reject(new WebviewDisposedError()));

      // Pool every second.
      const poolInterval = 1_000;
      const pool = setInterval(() => {
        if (editor.isTraceLoaded) {
          clearInterval(pool);
          resolve();
        }
      }, poolInterval);
    });

    const loadWithProgressPromise = vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, cancellable: true, title: "Loading Trace" },
      // Dispose editor on cancellation token trigger
      (_progress, token) => withCancellationToken(loadPromise, token, editor)
    );

    return Promise.resolve(loadWithProgressPromise);
  }

  public resolveCustomEditor(document: PerfettoDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Promise<void> {
    const initPromise = this.initializeCustomEditor(document, webviewPanel, token);

    // VSCode needs the initialization promise.
    // When this is finished, initial html is shown and loading begins.
    initPromise.then(editor => {
      // Handle errors from the loader.
      // Errors from initialization is handled by consumer of ``resolveCustomEditor``.
      this.loadCustomEditor(editor)
        .catch(error => this.errorHandler.handle(error));
    });

    // VSCode don't want the Editor, just void to signal completion.
    return initPromise.then(() => {});
  }
};