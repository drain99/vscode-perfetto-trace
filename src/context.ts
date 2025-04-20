// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { PersistentFileSelector } from "./fileSelector";
import { TraceOpenErrorHandler } from './errorHandler';

export class Context {
  public extensionContext: vscode.ExtensionContext;
  public fileSelector: PersistentFileSelector;
  public errorHandler: TraceOpenErrorHandler;

  public constructor(extensionContext: vscode.ExtensionContext) {
    this.extensionContext = extensionContext;
    this.fileSelector = new PersistentFileSelector();
    this.errorHandler = new TraceOpenErrorHandler();
  }
};
