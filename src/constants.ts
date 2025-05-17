// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

export enum WebviewConsts {
  PerfettoOrigin = "https://ui.perfetto.dev",
  PerfettoFrameId = "perfetto-ui-iframe",
  VsCodeUiReadyCommand = "vscode-ui-ready",
  VsCodeLoadTraceCommand = "vscode-load-trace",
  VsCodeTraceLoadedCommand = "vscode-load-trace-complete",
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
