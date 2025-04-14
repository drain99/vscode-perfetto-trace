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

export enum TraceOpenResult {
  Success = "Successfully Opened Trace!",
  NoActiveEditor = "No Active Editor Found!",
  FileInvalidExtention = "File Has Invalid Extension!",
  NoFileSelected = "No File Is Selected To Be Opened!",
  MultipleFileSelected = "Multiple Files Are Selected To Be Opened!",
  UserCanceledAction = "User canceled action!",
};