// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { openTraceForActiveEditor, openTraceForFile } from './trace';
import { Commands } from './constants';
import { Context } from './context';

export function activate(extContext: vscode.ExtensionContext): void {
	const context = new Context(extContext);

	// Register all commands
	extContext.subscriptions.push(
		vscode.commands.registerCommand(
			Commands.OpenTraceActiveEditor,
			async (): Promise<boolean> => {
				try {
					const openStatus = await openTraceForActiveEditor(context);
					return context.errorHandler.handleTracked(openStatus);
				} catch (err) {
					return context.errorHandler.handleUnknown(err);
				}
			}
		)
	);

	extContext.subscriptions.push(
		vscode.commands.registerCommand(
			Commands.OpenTraceFile,
			async (fileUri: vscode.Uri | undefined): Promise<boolean> => {
				try {
					const openStatus = await openTraceForFile(context, fileUri);
					if (openStatus.ok) {
						context.fileSelector.markAsMostRecentlyOpened(openStatus.val);
					}
					return context.errorHandler.handleTracked(openStatus);
				} catch (err) {
					return context.errorHandler.handleUnknown(err);
				}
			}
		)
	);
}

