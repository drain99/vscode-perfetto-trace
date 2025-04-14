// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { openTraceForActiveEditor, openTraceForFile } from './trace';
import { Commands, TraceOpenResult } from './constants';

export function activate(context: vscode.ExtensionContext): void {
	// Show error message on trace open failure but allow user to disable these messages
	let showOpenTraceFailMessage = true;
	const openTraceResultHandler = (result: TraceOpenResult) => {
		if (result !== TraceOpenResult.Success && showOpenTraceFailMessage) {
			vscode.window.showErrorMessage(`Failed to open trace: ${result}`, 'Do Not Show Again').then(selection => {
				if (selection === 'Do Not Show Again') {
					showOpenTraceFailMessage = false;
				}
			});
		}
	};

	// Register all commands
	context.subscriptions.push(
		vscode.commands.registerCommand(
			Commands.OpenTraceActiveEditor,
			() => openTraceForActiveEditor(context).then(event => openTraceResultHandler(event))
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			Commands.OpenTraceFile,
			() => openTraceForFile(context).then(event => openTraceResultHandler(event))
		)
	);
}

