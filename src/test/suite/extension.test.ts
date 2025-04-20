// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as assert from 'assert';

import * as vscode from 'vscode';
import { Commands } from '../../constants';

suite("Extension Test Suite", () => {
	function getTraceFileUri(file: string): vscode.Uri {
		const workspaces = vscode.workspace.workspaceFolders;
		assert.notEqual(workspaces, undefined);
		assert.equal(workspaces!.length, 1);
		return vscode.Uri.joinPath(workspaces![0].uri, file);
	}

	test("Open Trace For Active Editor Test 1", async function() {
		this.timeout(30000);
		
		const traceUri = getTraceFileUri("trace1.json");
		const traceContent = await vscode.workspace.fs.readFile(traceUri);

		const doc = await vscode.workspace.openTextDocument();
		const editor = await vscode.window.showTextDocument(doc);
		const editSuccess = await editor.edit(builder => {
			builder.insert(new vscode.Position(0, 0), traceContent.toString());
		});

		assert.equal(editSuccess, true);

		const execSuccess = await vscode.commands.executeCommand(Commands.OpenTraceActiveDoc);
		assert.equal(execSuccess, true);
	});

	test("Open Trace For File Test 1", async function() {
		this.timeout(30000);

		const traceUri = getTraceFileUri("trace1.json");
		const execSuccess = await vscode.commands.executeCommand(Commands.OpenTraceFile, traceUri);
		assert.equal(execSuccess, true);
	});
});