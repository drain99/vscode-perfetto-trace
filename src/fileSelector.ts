// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { Utils } from 'vscode-uri';
import { Err, Expected, Ok, QuickPickItemType, TraceOpenFailure } from './constants';

type QuickPickItem = vscode.QuickPickItem & (
  { itemType: QuickPickItemType.Separator } |
  { itemType: QuickPickItemType.File, fileUri: vscode.Uri } |
  { itemType: QuickPickItemType.Workspace, wsUri: vscode.Uri } |
  { itemType: QuickPickItemType.CurrentDirectory }
);

export class PersistentFileSelector {
  private fileHistory: vscode.Uri[];

  public constructor() {
    this.fileHistory = [];
  }

  private async removeInvalidFiles() {
    const isValidFile = await Promise.all(this.fileHistory.map(fileUri =>
      vscode.workspace.fs.stat(fileUri).then(
        stat => (stat.type & vscode.FileType.File) !== 0,
        () => false)
    ));

    this.fileHistory = this.fileHistory.filter((_, i) => isValidFile[i]);
  }

  private createQuickPickList(): QuickPickItem[] {
    const items: QuickPickItem[] = [];

    if (this.fileHistory.length > 0) {
      items.push({
        label: "Recently Opened Files",
        kind: vscode.QuickPickItemKind.Separator,
        itemType: QuickPickItemType.Separator
      });

      this.fileHistory.forEach(fileUri => {
        const fileName = Utils.basename(fileUri);
        const wsName = vscode.workspace.getWorkspaceFolder(fileUri)?.name;

        items.push({
          label: fileName,
          description: wsName,
          detail: fileUri.path,
          itemType: QuickPickItemType.File,
          fileUri
        });
      });
    }

    items.push({
      label: "",
      kind: vscode.QuickPickItemKind.Separator,
      itemType: QuickPickItemType.Separator
    });
    items.push({
      label: "Current Directory",
      itemType: QuickPickItemType.CurrentDirectory,
    });

    if ((vscode.workspace.workspaceFolders?.length || 0) > 0) {
      items.push({
        label: "Workspace Directories",
        kind: vscode.QuickPickItemKind.Separator,
        itemType: QuickPickItemType.Separator,
      });
      vscode.workspace.workspaceFolders!.forEach(ws => {
        items.push({
          label: ws.name,
          description: "Workspace",
          detail: ws.uri.path,
          itemType: QuickPickItemType.Workspace,
          wsUri: ws.uri
        });
      });
    }

    return items;
  }

  public async selectFile(): Promise<Expected<vscode.Uri>> {
    await this.removeInvalidFiles();
    const quickPickItems = this.createQuickPickList();
    const item = await vscode.window.showQuickPick(quickPickItems, {
      title: 'Locate File To Open',
      matchOnDescription: true, matchOnDetail: true, canPickMany: false
    });
    if (!item) {
      return Err(TraceOpenFailure.NoFileSelected);
    }

    switch (item.itemType) {
      case QuickPickItemType.File: {
        return Ok(item.fileUri);
      }
      case QuickPickItemType.Workspace: {
        const selection = await vscode.window.showOpenDialog({ defaultUri: item.wsUri, canSelectFiles: true, canSelectMany: false });
        if (!selection) {
          return Err(TraceOpenFailure.NoFileSelected);
        }
        if (selection.length !== 1) {
          return Err(TraceOpenFailure.MultipleFileSelected);
        }
        return Ok(selection[0]);
      }
      case QuickPickItemType.CurrentDirectory: {
        const selection = await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectMany: false });
        if (!selection) {
          return Err(TraceOpenFailure.NoFileSelected);
        }
        if (selection.length !== 1) {
          return Err(TraceOpenFailure.MultipleFileSelected);
        }
        return Ok(selection[0]);
      }
      default: {
        return Err(TraceOpenFailure.NoFileSelected);
      }
    }
  }

  public markAsMostRecentlyOpened(fileUri: vscode.Uri) {
    const i = this.fileHistory.indexOf(fileUri);
    if (i > 0) {
      this.fileHistory.splice(i, 1);
      this.fileHistory.unshift(fileUri);
    } else if (i === -1) {
      this.fileHistory.unshift(fileUri);
    }
  }
};