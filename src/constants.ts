// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';

// This should be in sync with package.json configuration default for "perfetto-trace.path"
const DefaultPerfettoOrigin: string = "https://ui.perfetto.dev";

export const WebviewConsts = {
  PerfettoOrigin: vscode.workspace.getConfiguration("perfetto-trace").get<string>("path", DefaultPerfettoOrigin),
  PerfettoFrameId: "perfetto-ui-iframe",
  VsCodeUiReadyCommand: "vscode-ui-ready",
  VsCodeLoadTraceCommand: "vscode-load-trace",
  VsCodeTraceLoadedCommand: "vscode-load-trace-complete",
};

export enum Commands {
  OpenTraceActiveEditor = "perfetto-trace.open-trace-active-editor",
  OpenTraceFile = "perfetto-trace.open-trace-file",
};

export enum EditorViewTypes {
  PerfettoNativeEditor = "perfetto-trace.perfetto-native-editor",
  PerfettoWebviewEditor = "perfetto-trace.perfetto-webview-editor",
};

export enum QuickPickItemType {
  Separator,
  File,
  Workspace,
  CurrentDirectory,
};
