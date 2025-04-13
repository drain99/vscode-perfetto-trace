// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { openTraceForActiveEditor, openTraceForFile } from './trace';
import { Commands, TraceOpenResult } from './constants';

export function activate(context: vscode.ExtensionContext): void {
	console.log("activate() called");

	let showOpenTraceFailMessage = true;

	context.subscriptions.push(
		vscode.commands.registerCommand(
			Commands.OpenTraceActiveEditor,
			() => openTraceForActiveEditor(context).then(event => {
				if (event !== TraceOpenResult.Success && showOpenTraceFailMessage) {
					vscode.window.showErrorMessage(`Failed to open trace: ${event}`, 'Do Not Show Again').then(selection => {
						if (selection === 'Do Not Show Again') {
							showOpenTraceFailMessage = false;
						}
					});
				}
			})
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			Commands.OpenTraceFile,
			() => openTraceForFile(context).then(event => {
				if (event !== TraceOpenResult.Success && showOpenTraceFailMessage) {
					vscode.window.showErrorMessage(`Failed to open trace: ${event}`, 'Do Not Show Again').then(selection => {
						if (selection === 'Do Not Show Again') {
							showOpenTraceFailMessage = false;
						}
					});
				}
			})
		)
	);
}

export function deactivate(): void {
	console.log("deactivate() called");
}
