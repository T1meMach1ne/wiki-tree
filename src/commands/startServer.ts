import * as vscode from 'vscode';
import WikiSiteServer from '../core/WikiSiteServer';
import { getCurrentIndexPath } from '../utils/state';
import { showErrorMessage, showInfoMessage, logError } from '../utils/logger';
import { PortConflictError, IndexLoadError } from '../core/errors';

let devServer: { close: () => Promise<void>; url: string } | undefined;

export function registerStartServerCommand(
  context: vscode.ExtensionContext,
  server: WikiSiteServer
): vscode.Disposable {
  const disposable = vscode.commands.registerCommand('wikiTree.startServer', async () => {
    await executeStartServer(server);
  });
  context.subscriptions.push(disposable);
  context.subscriptions.push({
    dispose: () => {
      if (devServer) {
        devServer.close().catch((error) => logError('关闭服务器失败', error));
        devServer = undefined;
      }
    },
  });
  return disposable;
}

async function executeStartServer(server: WikiSiteServer): Promise<void> {
  const indexPath = getCurrentIndexPath();
  if (!indexPath) {
    showErrorMessage('请先生成索引');
    return;
  }

  try {
    if (devServer) {
      await devServer.close();
      devServer = undefined;
    }
    const port = await promptForPort();
    const instance = await server.startServer(indexPath, port);
    devServer = instance;
    showInfoMessage('文档站点已启动: ' + instance.url);
  } catch (error) {
    handleServerError(error as Error);
  }
}

async function promptForPort(): Promise<number> {
  const value = await vscode.window.showInputBox({
    prompt: '请输入服务器端口 (1024-65535)',
    value: '3210',
    validateInput: (text) => {
      const port = Number(text);
      if (!Number.isInteger(port) || port < 1024 || port > 65535) {
        return '端口号必须在 1024 到 65535 之间';
      }
      return undefined;
    },
  });
  if (!value) {
    return 3210;
  }
  return Number(value);
}

function handleServerError(error: Error): void {
  logError('启动服务器失败', error);
  if (error instanceof PortConflictError) {
    showErrorMessage('端口被占用，请更换端口');
    return;
  }
  if (error instanceof IndexLoadError) {
    showErrorMessage('无法加载索引文件: ' + error.message);
    return;
  }
  showErrorMessage('启动服务器失败: ' + error.message);
}
