// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { Commands, EditorViewTypes } from './constants';
import { PerfettoEditorProvider } from './perfettoEditorProvider';
import { PerfettoDocument } from './perfettoDocument';

export function activate(context: vscode.ExtensionContext): void {
	const provider = new PerfettoEditorProvider(context);

	// Register all commands
	context.subscriptions.push(
		vscode.commands.registerCommand(
			Commands.OpenTraceActiveEditor, async (): Promise<boolean> => {
				try {
					const cancellationSource = new vscode.CancellationTokenSource();
					const document = await PerfettoDocument.createForActiveEditor(cancellationSource.token);
					const webviewPanel = await provider.createWebviewPanelForEditor(document, cancellationSource.token);
					const editor = await provider.initializeCustomEditor(document, webviewPanel, cancellationSource.token);
					cancellationSource.dispose();
					await provider.loadCustomEditor(editor);
					return true;
				} catch (error) {
					provider.errorHandler.handle(error);
					return false;
				}
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			Commands.OpenTraceFile,
			// ``fileUri`` is set if command originated from explorer context menu.
			async (fileUri?: vscode.Uri): Promise<boolean> => {
				try {
					const uri = fileUri || (await provider.fileSelector.selectFile());

					const cancellationSource = new vscode.CancellationTokenSource();
					const document = await PerfettoDocument.createForUri(uri, cancellationSource.token);
					const webviewPanel = await provider.createWebviewPanelForEditor(document, cancellationSource.token);
					const editor = await provider.initializeCustomEditor(document, webviewPanel, cancellationSource.token);
					cancellationSource.dispose();
					await provider.loadCustomEditor(editor);
					return true;
				} catch (error) {
					provider.errorHandler.handle(error);
					return false;
				}
			}
		)
	);
}
