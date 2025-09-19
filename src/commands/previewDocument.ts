import * as vscode from 'vscode';
import { showErrorMessage } from '../utils/logger';

export function registerPreviewDocumentCommand(
  context: vscode.ExtensionContext
): vscode.Disposable {
  const disposable = vscode.commands.registerCommand(
    'wikiTree.previewDocument',
    async (uri?: vscode.Uri) => {
      if (!uri) {
        showErrorMessage('请选择要预览的文档');
        return;
      }
      await vscode.commands.executeCommand('markdown.showPreview', uri);
    }
  );
  context.subscriptions.push(disposable);
  return disposable;
}
