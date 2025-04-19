// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { openTraceForActiveEditor, openTraceForFile, TraceOpenResultHandler } from './trace';
import { Commands } from './constants';

export function activate(context: vscode.ExtensionContext): void {
	const traceOpenResultHandler = new TraceOpenResultHandler();

	// Register all commands
	context.subscriptions.push(
		vscode.commands.registerCommand(
			Commands.OpenTraceActiveEditor,
			(): Thenable<boolean> => openTraceForActiveEditor(context)
				.then(event => traceOpenResultHandler.handle(event))
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			Commands.OpenTraceFile,
			(fileUri: vscode.Uri | undefined): Thenable<boolean> => openTraceForFile(context, fileUri)
				.then(event => traceOpenResultHandler.handle(event))
		)
	);
}

