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
  OpenTraceActiveDoc = "perfetto-trace.open-trace-active-doc",
  OpenTraceFile = "perfetto-trace.open-trace-file",
};

export enum TraceOpenFailure {
  NoActiveDocument = "Active Document Not Found!",
  NoFileSelected = "No File Is Selected To Be Opened!",
  MultipleFileSelected = "Multiple Files Are Selected To Be Opened!",
  UserCanceledAction = "User Canceled Action!",
  FileReadFailure = "Failed To Read Selected File!",
};

export enum QuickPickItemType {
  Separator,
  File,
  Workspace,
  CurrentDirectory,
};

export enum Unit {
  unit
};

export type Expected<T, E = TraceOpenFailure> = { ok: true, val: T } | { ok: false, err: E };
export function Ok<T, E = TraceOpenFailure>(val: T): Expected<T, E> { return { ok: true, val }; }
export function Err<T, E = TraceOpenFailure>(err: E): Expected<T, E> { return { ok: false, err }; }
