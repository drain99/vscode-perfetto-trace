import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext): void {
	console.log("activate() called");

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"perfetto-trace.open-trace",
			() => { launchPerfettoUIWebview(context); }
		)
	);

	console.log("VSCode UI kind:", vscode.env.uiKind);
	console.log("VSCode remote name:", vscode.env.remoteName);
}

export function deactivate(): void {
	console.log("deactivate() called");
}

function launchPerfettoUIWebview(context: vscode.ExtensionContext): void {
	const activeDoc = vscode.window.activeTextEditor;
	if (!activeDoc) {
		vscode.window.showErrorMessage("No active text editor found.");
		return;
	}
	const fileName = path.basename(activeDoc.document.fileName);
	console.log("Active document:", fileName);
	const panel = vscode.window.createWebviewPanel(
		"PerfettoUI",
		`${fileName} - Perfetto UI`,
		{ viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
		{ enableScripts: true, retainContextWhenHidden: true }
	);

	panel.onDidDispose(() => {
		console.log("Perfetto UI webview disposed");
	}, undefined, context.subscriptions);

	panel.webview.onDidReceiveMessage(message => {
		if (message.command === 'ui-ready') {
			console.log("Perfetto UI is ready, sending trace data...");
			panel.webview.postMessage({
				command: 'trace-data',
				payload: {
					buffer: new TextEncoder().encode(activeDoc.document.getText()).buffer,
					title: fileName,
					fileName: fileName,
					uri: undefined,
				}
			});
		}
	}, undefined, context.subscriptions);

	panel.webview.html = getWebviewHTML();
}

function getWebviewHTML(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Perfetto UI</title>
	<style>
		body {
			margin: 0;
			padding: 0;
			overflow: hidden;
			background-color: #ffffff;
			color: #000000;
		}
		iframe {
			border: none;
			width: 100vw;
			height: 100vh;
		}
	</style>
</head>
<body>
	<script type="text/javascript">
		(function() {
			document.addEventListener("DOMContentLoaded", function() {
				const code = acquireVsCodeApi();
				const ui = document.getElementById("perfetto-ui-iframe");

				const sendPing = () => {
					console.log("Sending PING to Perfetto UI");
					ui.contentWindow.postMessage("PING", "*");
				};

				let pingInterval = undefined;

				window.addEventListener("message", event => {
					if (event.data === "PONG" && event.source === ui.contentWindow) {
						console.log("Received PONG from Perfetto UI");
						code.postMessage({command: 'ui-ready'});
						clearInterval(pingInterval);
					}
				});

				pingInterval = setInterval(() => { sendPing(); }, 500);

				window.addEventListener("message", event => {
					if (event.data.command === "trace-data") {
						ui.contentWindow.postMessage({perfetto: event.data.payload}, "*");
					}
				});
			});
		}())
	</script>
	<iframe id="perfetto-ui-iframe" src="https://ui.perfetto.dev" allow="fullscreen"></iframe>
</body>
</html>`;
}
