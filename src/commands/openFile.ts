import * as vscode from 'vscode';
import { showErrorMessage } from '../utils/logger';

export function registerOpenFileCommand(context: vscode.ExtensionContext): vscode.Disposable {
  const disposable = vscode.commands.registerCommand(
    'wikiTree.openFile',
    async (uri?: vscode.Uri) => {
      if (!uri) {
        showErrorMessage('请选择要打开的文件');
        return;
      }
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document, { preview: false });
    }
  );
  context.subscriptions.push(disposable);
  return disposable;
}
