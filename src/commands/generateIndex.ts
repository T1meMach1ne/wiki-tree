import * as vscode from 'vscode';
import WikiTreeGenerator from '../core/WikiTreeGenerator';
import { WikiTreeProvider } from '../providers/WikiTreeProvider';
import StatusBarManager from '../providers/StatusBarManager';
import { WikiIndex, WorkspaceMetrics } from '../types';
import { getScanConfig, getWorkspaceRoot } from '../utils/config';
import { logError, logInfo, showErrorMessage, showInfoMessage } from '../utils/logger';
import { ConfigValidationError, FileAccessError, IndexGenerationError } from '../core/errors';
import { setCurrentIndex } from '../utils/state';

export interface GenerateIndexDependencies {
  generator: WikiTreeGenerator;
  treeProvider: WikiTreeProvider;
  statusBar: StatusBarManager;
}

export function registerGenerateIndexCommand(
  context: vscode.ExtensionContext,
  deps: GenerateIndexDependencies
): vscode.Disposable {
  const disposable = vscode.commands.registerCommand('wikiTree.generateIndex', async () => {
    await executeGenerateIndex(deps);
  });
  context.subscriptions.push(disposable);
  return disposable;
}

async function executeGenerateIndex(deps: GenerateIndexDependencies): Promise<void> {
  const rootPath = getWorkspaceRoot();
  if (!rootPath) {
    showErrorMessage('未找到工作区，请先打开项目文件夹');
    return;
  }

  try {
    const config = getScanConfig();
    logInfo('开始生成 Wiki Tree 索引');
    const result = await deps.generator.generateIndex(rootPath, config);
    const index = await readIndex(result.indexPath);
    setCurrentIndex(index, result.indexPath);
    deps.treeProvider.setIndex(index);
    deps.statusBar.update(calculateMetrics(index));
    showInfoMessage('Wiki Tree 索引生成完成，耗时 ' + result.durationMs + ' ms');
  } catch (error) {
    handleGenerationError(error as Error);
  }
}

async function readIndex(indexPath: string): Promise<WikiIndex> {
  const uri = vscode.Uri.file(indexPath);
  const data = await vscode.workspace.fs.readFile(uri);
  const text = Buffer.from(data).toString('utf-8');
  return JSON.parse(text) as WikiIndex;
}

function calculateMetrics(index: WikiIndex): WorkspaceMetrics {
  let folderCount = 0;
  let fileCount = 0;

  const walk = (nodes: WikiIndex['nodes']): void => {
    for (const node of nodes) {
      if (node.type === 'folder' && node.children) {
        folderCount += 1;
        walk(node.children);
      } else {
        fileCount += 1;
      }
    }
  };

  walk(index.nodes);
  return { folderCount, fileCount };
}

function handleGenerationError(error: Error): void {
  logError('索引生成失败', error);
  if (error instanceof ConfigValidationError) {
    showErrorMessage('配置错误: ' + error.message);
    return;
  }
  if (error instanceof FileAccessError) {
    showErrorMessage('文件访问错误: ' + error.message);
    return;
  }
  if (error instanceof IndexGenerationError) {
    showErrorMessage('索引生成失败: ' + error.message);
    return;
  }
  showErrorMessage('未知错误: ' + error.message);
}
