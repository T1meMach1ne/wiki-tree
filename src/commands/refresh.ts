import * as vscode from 'vscode';
import { WikiTreeProvider } from '../providers/WikiTreeProvider';
import { getCurrentIndex } from '../utils/state';
import { showErrorMessage } from '../utils/logger';

export function registerRefreshCommand(
  context: vscode.ExtensionContext,
  provider: WikiTreeProvider
): vscode.Disposable {
  const disposable = vscode.commands.registerCommand('wikiTree.refresh', () => {
    const index = getCurrentIndex();
    if (!index) {
      showErrorMessage('请先生成索引');
      return;
    }
    provider.refresh();
  });
  context.subscriptions.push(disposable);
  return disposable;
}
