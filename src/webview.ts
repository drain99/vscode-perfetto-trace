// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { WebviewConsts } from './constants';

export class PerfettoSession {
	private webviewPanel: vscode.WebviewPanel | undefined;
	private disposables: vscode.Disposable[] = [];

	public constructor() { }

	public activate(fileName: string, fileBuffer: ArrayBuffer, onTraceLoaded: () => void, onDeactivate: () => void) {
		this.webviewPanel = vscode.window.createWebviewPanel(
			"perfetto-ui", `${fileName} - Perfetto`,
			{ viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
			{ enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [] }
		);

		this.webviewPanel.onDidDispose(() => {
			this.disposables.forEach(x => x.dispose());
			return onDeactivate();
		}, this, this.disposables);

		// See [Note: State machine to synchronize between extension, webview & perfetto ui iframe]
		// Use ping-pong handshaking to check perfetto iframe is fully loaded and accepting messages.
		// Ref: https://perfetto.dev/docs/visualization/deep-linking-to-perfetto-ui#using-window-open-and-postmessage
		// State transitions:
		// Receive first pong from perfetto ui => UiReady state
		// Update extension that ui is ready & receive the load trace payload => WaitingForTrace state
		// Receive trace payload from extension and forward to perfetto ui => TraceLoading state
		// Receive another pong from perfetto ui => TraceLoaded state [this is heuristic, actual load takes longer]
		this.webviewPanel.webview.onDidReceiveMessage((message: { command: string }) => {
			switch (message.command) {
				case WebviewConsts.VsCodeUiReadyCommand:
					this.webviewPanel!.webview.postMessage({
						command: WebviewConsts.VsCodeLoadTraceCommand,
						payload: {
							buffer: fileBuffer,
							title: fileName,
							fileName: fileName,
							keepApiOpen: true
						}
					});
					return;
				case WebviewConsts.VsCodeTraceLoadedCommand:
					return onTraceLoaded();
				default:
					return console.error("PerfettoSession webview received unexpected message:", message);
			}
		}, this, this.disposables);

		this.webviewPanel.webview.html = this.getWebviewHTML();
	}

	public deactivate() {
		this.webviewPanel?.dispose();
	}

	private getWebviewHTML(): string {
		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta http-equiv="Content-Security-Policy"
				content="default-src 'none';
					script-src ${this.webviewPanel!.webview.cspSource} ${WebviewConsts.PerfettoOrigin} 'unsafe-inline';
					style-src ${this.webviewPanel!.webview.cspSource} ${WebviewConsts.PerfettoOrigin} 'unsafe-inline';
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
		
						// See [Note: State machine to synchronize between extension, webview & perfetto ui iframe]
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
};
