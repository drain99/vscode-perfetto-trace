// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';

export class WebviewDisposedError extends Error {
  public constructor() {
    super("Webview disposed!");
  }
};

export class UntitledUriPerfettoEditorNotSupportedError extends Error {
  public constructor() {
    super("Use command: Open Trace For Active Editor instead!");
  }
}

export class NoActiveEditorError extends Error {
  public constructor() {
    super("No active editor!");
  }
};

export class NoFileSelectedError extends Error {
  public constructor() {
    super("No file selected!");
  }
};

export class MultipleFilesSelectedError extends Error {
  public constructor() {
    super("Multiple files selected!");
  }
};

// create a new promise from an existing promise that supports early cancellation signalled by a ``vscode.CancellationToken``
export function withCancellationToken<T>(promise: Promise<T>, token: vscode.CancellationToken, disposable?: vscode.Disposable): Promise<T> {
  if (token.isCancellationRequested) {
    return Promise.reject();
  }

  let handler: vscode.Disposable | undefined;
  return new Promise<T>((resolve, reject) => {
    handler = token.onCancellationRequested(() => {
      if (disposable) {
        disposable.dispose();
      }
      reject(new vscode.CancellationError());
    });

    promise
      .then(result => resolve(result))
      .catch(error => reject(error));
  }).finally(() => handler?.dispose());
}

