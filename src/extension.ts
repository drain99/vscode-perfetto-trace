import * as vscode from 'vscode';
import { openTraceForActiveEditor, openTraceForFile } from './trace';

export function activate(context: vscode.ExtensionContext): void {
	console.log("activate() called");

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"perfetto-trace.open-trace-active-editor",
			() => {
				openTraceForActiveEditor(context).then(
					() => {
						vscode.window.showInformationMessage("Successfully Opened Trace For Active Editor");
					},
					(reason: string) => {
						vscode.window.showErrorMessage(reason);
					}
				);
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"perfetto-trace.open-trace-file",
			() => {
				openTraceForFile(context).then(
					() => {
						vscode.window.showInformationMessage("Successfully Opened Trace For Active Editor");
					},
					(reason: string) => {
						vscode.window.showErrorMessage(reason);
					}
				);
			}
		)
	);
}

export function deactivate(): void {
	console.log("deactivate() called");
}
