import * as path from 'path';
import * as fs from 'fs/promises';
import { StaticExportResult, WikiIndex, WikiNode } from '../types';
import { IndexLoadError } from './errors';
import { ensureDirectory, pathExists } from '../utils/fileSystem';

export class StaticExporter {
  async export(indexPath: string, outputDir: string): Promise<StaticExportResult> {
    const exists = await pathExists(indexPath);
    if (!exists) {
      throw new IndexLoadError('索引文件不存在: ' + indexPath);
    }

    const raw = await fs.readFile(indexPath, 'utf-8');
    const index: WikiIndex = JSON.parse(raw) as WikiIndex;

    await ensureDirectory(outputDir);
    const jsonTarget = path.join(outputDir, 'index.json');
    const htmlTarget = path.join(outputDir, 'index.html');

    await fs.writeFile(jsonTarget, JSON.stringify(index, null, 2), 'utf-8');
    await fs.writeFile(htmlTarget, this.renderHtml(index), 'utf-8');

    return { outputDir, exportedFiles: [jsonTarget, htmlTarget] };
  }

  private renderHtml(index: WikiIndex): string {
    const items = index.nodes.map((node) => '<li>' + this.renderNode(node) + '</li>');
    return [
      '<!DOCTYPE html>',
      '<html lang="zh-CN">',
      '<head>',
      '<meta charset="UTF-8" />',
      '<title>Wiki Tree</title>',
      '<style>body{font-family:Segoe UI,Arial,sans-serif;margin:24px;}li{margin-bottom:4px;}ul ul{margin-left:16px;}</style>',
      '</head>',
      '<body>',
      '<h1>Wiki Tree 文档索引</h1>',
      '<p>生成时间: ' + index.generatedAt + '</p>',
      '<ul>' + items.join('') + '</ul>',
      '</body>',
      '</html>',
    ].join('');
  }

  private renderNode(node: WikiNode): string {
    const summary = node.summary ? ' - ' + node.summary : '';
    const children =
      node.children && node.children.length > 0 ? this.renderChildren(node.children) : '';
    return '<strong>' + node.title + '</strong>' + summary + children;
  }

  private renderChildren(children: WikiNode[]): string {
    if (!children || children.length === 0) {
      return '';
    }
    const items = children.map((child) => '<li>' + this.renderNode(child) + '</li>');
    return '<ul>' + items.join('') + '</ul>';
  }
}

export default StaticExporter;
