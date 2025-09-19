import * as vscode from 'vscode';
import { WorkspaceMetrics } from '../types';

export class StatusBarManager {
  private readonly item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.item.name = 'Wiki Tree 状态';
    this.item.command = 'wikiTree.generateIndex';
  }

  update(metrics: WorkspaceMetrics): void {
    const icon = '$' + '(book)';
    this.item.text = icon + ' ' + metrics.fileCount + ' 个文档';
    this.item.tooltip =
      'Wiki Tree: ' + metrics.folderCount + ' 个文件夹, ' + metrics.fileCount + ' 个文档';
    this.item.show();
  }

  hide(): void {
    this.item.hide();
  }

  dispose(): void {
    this.item.dispose();
  }
}

export default StatusBarManager;
