// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { openTraceForActiveEditor, openTraceForFile } from './trace';
import { Commands, TraceOpenResult } from './constants';

export function activate(context: vscode.ExtensionContext): void {
	console.log("activate() called");

	context.subscriptions.push(
		vscode.commands.registerCommand(
			Commands.OpenTraceActiveEditor,
			() => openTraceForActiveEditor(context).then(event => {
				if (event !== TraceOpenResult.Success) {
					vscode.window.showErrorMessage(`Failed to launch with reason: ${event}`);
				}
			})
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			Commands.OpenTraceFile,
			() => openTraceForFile(context).then(event => {
				if (event !== TraceOpenResult.Success) {
					vscode.window.showErrorMessage(`Failed to launch with reason: ${event}`);
				}
			})
		)
	);
}

export function deactivate(): void {
	console.log("deactivate() called");
}
