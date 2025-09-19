import * as vscode from 'vscode';
import Fuse from 'fuse.js';
import { WikiNode } from '../types';
import { getCurrentIndex } from '../utils/state';
import { logError, showErrorMessage } from '../utils/logger';

interface SearchItem extends WikiNode {
  fullPath: string;
}

export function registerSearchCommand(context: vscode.ExtensionContext): vscode.Disposable {
  const disposable = vscode.commands.registerCommand('wikiTree.search', async () => {
    await showQuickSearch();
  });
  context.subscriptions.push(disposable);
  return disposable;
}

async function showQuickSearch(): Promise<void> {
  const index = getCurrentIndex();
  if (!index) {
    showErrorMessage('请先生成索引');
    return;
  }

  const nodes = flattenNodes(index.nodes);
  const fuse = new Fuse(nodes, {
    keys: ['title', 'summary', 'path'],
    threshold: 0.3,
    includeScore: true,
  });

  const quickPick = vscode.window.createQuickPick();
  quickPick.placeholder = '搜索文档...';

  quickPick.onDidChangeValue((value) => {
    if (!value) {
      quickPick.items = [];
      return;
    }
    const matches = fuse.search(value).slice(0, 50);
    quickPick.items = matches.map((match) => ({
      label: match.item.title,
      description: match.item.path,
      detail: match.item.summary,
    }));
  });

  quickPick.onDidAccept(() => {
    const selection = quickPick.selectedItems[0];
    if (selection) {
      const target = nodes.find((node) => node.path === selection.description);
      if (target) {
        openFile(target.path);
      }
    }
    quickPick.hide();
  });

  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

function flattenNodes(nodes: WikiNode[], parentPath?: string): SearchItem[] {
  const list: SearchItem[] = [];
  for (const node of nodes) {
    const fullPath = parentPath ? parentPath + '/' + node.title : node.title;
    const item: SearchItem = { ...node, fullPath };
    list.push(item);
    if (node.children) {
      list.push(...flattenNodes(node.children, fullPath));
    }
  }
  return list;
}

function openFile(filePath: string): void {
  const uri = vscode.Uri.file(filePath);
  vscode.workspace.openTextDocument(uri).then(
    (document) => vscode.window.showTextDocument(document, { preview: false }),
    (error) => {
      logError('打开文件失败', error);
      showErrorMessage('无法打开文件: ' + filePath);
    }
  );
}
