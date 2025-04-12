import * as vscode from 'vscode';
import * as path from 'path';
import { setupWebview } from './webview';

function isValidTraceFile(filePath: string): boolean {
  const validExtensions = [".json", ".trace", ".chrome-trace", ".perfetto-trace"];
  const ext = path.extname(filePath);
  return validExtensions.includes(ext);
}

export async function openTraceForActiveEditor(context: vscode.ExtensionContext): Promise<void> {
  const activeDoc = vscode.window.activeTextEditor?.document;
  if (!activeDoc) {
    return Promise.reject("No active editor found!");
  }

  const filePath = activeDoc.fileName;
  if (!isValidTraceFile(filePath)) {
    return Promise.reject("Active file has invalid extension!");
  }

  const fileName = path.basename(filePath);
  const fileBuffer = new TextEncoder().encode(activeDoc.getText()).buffer;
  setupWebview(context, fileName, fileBuffer);
}

export async function openTraceForFile(context: vscode.ExtensionContext): Promise<void> {
  const selection = await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectMany: false });
  if (!selection || selection.length !== 1) {
    return Promise.reject("No file is selected!");
  }

  const fileUri = selection[0];
  if (!isValidTraceFile(fileUri.fsPath)) {
    return Promise.reject("Chosen file has invalid extension!");
  }

  const fileName = path.basename(fileUri.fsPath);
  const fileBuffer = (await vscode.workspace.fs.readFile(fileUri)).buffer;
  setupWebview(context, fileName, fileBuffer);
}