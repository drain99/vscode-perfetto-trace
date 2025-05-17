// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { Utils } from 'vscode-uri';
import { NoActiveEditorError, UntitledUriPerfettoEditorNotSupportedError, withCancellationToken } from './utils';

export class PerfettoDocument implements vscode.CustomDocument, vscode.Disposable {
  public readonly uri: vscode.Uri;
  public readonly title: string;
  public readonly fileName: string;
  public readonly data: Uint8Array;

  private constructor(uri: vscode.Uri, data: Uint8Array) {
    this.uri = uri;
    this.title = Utils.basename(this.uri);
    this.fileName = Utils.basename(this.uri);
    this.data = data;
  }

  public static create(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Promise<PerfettoDocument> {
    const documentPromise = new Promise<PerfettoDocument>((resolve, reject) => {
      let dataPromise: Promise<Uint8Array>;

      // read data from backup if exists
      // empty string evaluates to false hence must use ``typeof``
      if (typeof openContext.backupId === "string") {
        dataPromise = Promise.resolve(vscode.workspace.fs.readFile(vscode.Uri.parse(openContext.backupId)));
      } // read data from untitled data if exists
      else if (openContext.untitledDocumentData) {
        // return reject(new UntitledUriPerfettoEditorNotSupportedError());
        // FIXME
        dataPromise = Promise.resolve(openContext.untitledDocumentData);
      } // read from workspace
      else {
        dataPromise = Promise.resolve(vscode.workspace.fs.readFile(uri));
      }

      dataPromise
        .then(data => resolve(new PerfettoDocument(uri, data)))
        .catch(error => reject(error));
    });

    // nothing extra to dispose in case token cancelled
    return withCancellationToken(documentPromise, token);
  }

  public static async createForUri(uri: vscode.Uri, token: vscode.CancellationToken): Promise<PerfettoDocument> {
    const documentPromise = Promise.resolve(vscode.workspace.fs.readFile(uri))
      .then(data => new PerfettoDocument(uri, data));

    return withCancellationToken(documentPromise, token);
  }

  public static async createForActiveEditor(token: vscode.CancellationToken): Promise<PerfettoDocument> {
    if (!vscode.window.activeTextEditor) {
      throw new NoActiveEditorError();
    }

    const document = vscode.window.activeTextEditor.document;
    const data = new TextEncoder().encode(document.getText());
    const documentPromise = Promise.resolve(new PerfettoDocument(document.uri, data));

    return withCancellationToken(documentPromise, token);
  }

  public dispose(): void { }
};
