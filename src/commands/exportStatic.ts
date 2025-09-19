import * as vscode from 'vscode';
import StaticExporter from '../core/StaticExporter';
import { getCurrentIndexPath } from '../utils/state';
import { showErrorMessage, showInfoMessage, logError } from '../utils/logger';
import { IndexLoadError } from '../core/errors';

export function registerExportStaticCommand(
  context: vscode.ExtensionContext,
  exporter: StaticExporter
): vscode.Disposable {
  const disposable = vscode.commands.registerCommand('wikiTree.exportStatic', async () => {
    await executeExport(exporter);
  });
  context.subscriptions.push(disposable);
  return disposable;
}

async function executeExport(exporter: StaticExporter): Promise<void> {
  const indexPath = getCurrentIndexPath();
  if (!indexPath) {
    showErrorMessage('请先生成索引');
    return;
  }

  try {
    const target = await pickOutputDirectory();
    if (!target) {
      return;
    }
    const result = await exporter.export(indexPath, target);
    showInfoMessage('静态站点已导出至: ' + result.outputDir);
  } catch (error) {
    handleExportError(error as Error);
  }
}

async function pickOutputDirectory(): Promise<string | undefined> {
  const uri = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: '选择导出目录',
  });
  if (!uri || uri.length === 0) {
    return undefined;
  }
  return uri[0].fsPath;
}

function handleExportError(error: Error): void {
  logError('导出静态站点失败', error);
  if (error instanceof IndexLoadError) {
    showErrorMessage('无法加载索引文件: ' + error.message);
    return;
  }
  showErrorMessage('导出失败: ' + error.message);
}
