import * as vscode from 'vscode';
import WikiTreeGenerator from './core/WikiTreeGenerator';
import WikiSiteServer from './core/WikiSiteServer';
import StaticExporter from './core/StaticExporter';
import { WikiTreeProvider } from './providers/WikiTreeProvider';
import StatusBarManager from './providers/StatusBarManager';
import { registerGenerateIndexCommand } from './commands/generateIndex';
import { registerSearchCommand } from './commands/search';
import { registerRefreshCommand } from './commands/refresh';
import { registerPreviewDocumentCommand } from './commands/previewDocument';
import { registerOpenFileCommand } from './commands/openFile';
import { registerStartServerCommand } from './commands/startServer';
import { registerExportStaticCommand } from './commands/exportStatic';
import { logInfo } from './utils/logger';

let statusBar: StatusBarManager | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  logInfo('激活 Wiki Tree 扩展');

  const generator = new WikiTreeGenerator();
  const siteServer = new WikiSiteServer();
  const exporter = new StaticExporter();
  const treeProvider = new WikiTreeProvider(undefined);
  statusBar = new StatusBarManager();

  const treeView = vscode.window.createTreeView('wikiTreeView', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });
  context.subscriptions.push(treeView);
  context.subscriptions.push({ dispose: () => statusBar?.dispose() });

  registerGenerateIndexCommand(context, {
    generator,
    treeProvider,
    statusBar,
  });

  registerSearchCommand(context);
  registerRefreshCommand(context, treeProvider);
  registerPreviewDocumentCommand(context);
  registerOpenFileCommand(context);
  registerStartServerCommand(context, siteServer);
  registerExportStaticCommand(context, exporter);
}

export function deactivate(): void {
  if (statusBar) {
    statusBar.dispose();
    statusBar = undefined;
  }
}
