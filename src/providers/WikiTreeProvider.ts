import * as vscode from 'vscode';
import { WikiIndex, WikiNode } from '../types';

export class WikiTreeProvider implements vscode.TreeDataProvider<WikiNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<WikiNode | undefined>();
  readonly onDidChangeTreeData: vscode.Event<WikiNode | undefined> =
    this.onDidChangeTreeDataEmitter.event;

  constructor(private index: WikiIndex | undefined) {}

  setIndex(index: WikiIndex): void {
    this.index = index;
    this.refresh();
  }

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire(undefined);
  }

  getTreeItem(element: WikiNode): vscode.TreeItem {
    const collapsibleState =
      element.children && element.children.length > 0
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None;
    const item = new vscode.TreeItem(element.title, collapsibleState);
    item.contextValue = element.type;
    item.tooltip = element.summary;
    item.resourceUri = vscode.Uri.file(element.path);
    item.iconPath =
      element.type === 'folder' ? new vscode.ThemeIcon('folder') : new vscode.ThemeIcon('book');
    if (element.type === 'file') {
      item.command = {
        command: 'wikiTree.openFile',
        title: 'Open File',
        arguments: [vscode.Uri.file(element.path)],
      };
    }
    return item;
  }

  getChildren(element?: WikiNode): vscode.ProviderResult<WikiNode[]> {
    if (!this.index) {
      return [];
    }
    if (!element) {
      return this.index.nodes;
    }
    return element.children ?? [];
  }
}

export default WikiTreeProvider;
