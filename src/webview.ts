// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { WebviewConsts } from './constants';

export function getWebviewHTML(cspSourceSelf: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy"
		content="default-src 'none';
			script-src ${cspSourceSelf} ${WebviewConsts.PerfettoOrigin} 'unsafe-inline';
			style-src ${cspSourceSelf} ${WebviewConsts.PerfettoOrigin} 'unsafe-inline';
			frame-src ${WebviewConsts.PerfettoOrigin}">
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
				const vscode = acquireVsCodeApi();
				const ui = document.getElementById("${WebviewConsts.PerfettoFrameId}");

				let pingInterval = null;
				let uiReady = false;
				let traceLoaded = false;

				const sendPing = () => {
					ui.contentWindow.postMessage("PING", "${WebviewConsts.PerfettoOrigin}");
				};

				const messageHandler = event => {
					if (event.data === "PONG" && event.origin === "${WebviewConsts.PerfettoOrigin}") {
					  if (!uiReady) {
							uiReady = true;
							vscode.postMessage({ command: "${WebviewConsts.VsCodeUiReadyCommand}" });
							console.log("PONG: ui became ready");
						} else if (traceLoaded) {
							console.log("PONG: trace is loaded"); 
							clearInterval(pingInterval);
							pingInterval = null;
							vscode.postMessage({ command: "${WebviewConsts.VsCodeTraceLoadedCommand}" });
						}
					} else if (event.data.command === "${WebviewConsts.VsCodeLoadTraceCommand}") {
					  if (!traceLoaded) {
							traceLoaded = true;
							ui.contentWindow.postMessage({ perfetto: event.data.payload }, "${WebviewConsts.PerfettoOrigin}");
						}
					}
				};

				window.addEventListener('message', messageHandler);
				pingInterval = setInterval(() => sendPing(), 500);
			});
		}())
	</script>
	<iframe id="${WebviewConsts.PerfettoFrameId}" src="${WebviewConsts.PerfettoOrigin}"></iframe>
</body>
</html>`;
}
