// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';

export function setupWebview(context: vscode.ExtensionContext, fileName: string, fileBuffer: ArrayBuffer): void {
  const panel = vscode.window.createWebviewPanel(
    "PerfettoUI",
    `${fileName} - Perfetto`,
    { viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
    { enableScripts: true, retainContextWhenHidden: true }
  );

  panel.onDidDispose(() => {
    console.log(`${fileName} webview disposed`);
  }, null, context.subscriptions);

  panel.webview.onDidReceiveMessage(message => {
    if (message.command === 'ui-ready') {
      console.log(`${fileName} is ready, sending trace data`);
      panel.webview.postMessage({
        command: 'trace-data',
        payload: {
          buffer: fileBuffer,
          title: fileName,
          fileName: fileName,
          uri: null,
        }
      });
    }
  }, null, context.subscriptions);

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
