import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import { ConfigValidationError, FileAccessError, IndexGenerationError } from './errors';
import { GenerationResult, ScanConfig, WikiIndex, WikiNode } from '../types';
import { ensureDirectory, pathExists } from '../utils/fileSystem';

interface ScanStats {
  scanned: number;
  skipped: number;
  generated: number;
}

export class WikiTreeGenerator {
  private readonly markdown = new MarkdownIt();

  async generateIndex(rootPath: string, config: ScanConfig): Promise<GenerationResult> {
    await this.validatePreconditions(rootPath, config);
    const startTime = Date.now();
    const result: GenerationResult = {
      scannedFiles: 0,
      skippedFiles: 0,
      generatedNodes: 0,
      durationMs: 0,
      indexPath: '',
      markdownPath: '',
      errors: [],
    };

    try {
      const traversal = await this.scanDirectory(rootPath, rootPath, config, 0);
      result.scannedFiles = traversal.stats.scanned;
      result.skippedFiles = traversal.stats.skipped;
      result.generatedNodes = traversal.stats.generated;

      const index: WikiIndex = {
        version: '0.1.0',
        generatedAt: new Date().toISOString(),
        root: rootPath,
        nodes: traversal.nodes,
      };

      const indexPath = path.join(rootPath, config.outputDir, 'index.json');
      await this.writeIndexAtomic(indexPath, index);
      result.indexPath = indexPath;
      const markdownPath = path.join(rootPath, config.outputDir, 'index.md');
      await this.writeMarkdownIndex(markdownPath, index, rootPath);
      result.markdownPath = markdownPath;
      result.durationMs = Date.now() - startTime;

      await this.validatePostconditions(result, config);
      return result;
    } catch (error) {
      if (error instanceof ConfigValidationError || error instanceof FileAccessError) {
        throw error;
      }
      throw new IndexGenerationError(
        '索引生成失败: ' + (error instanceof Error ? error.message : String(error))
      );
    }
  }

  private async validatePreconditions(rootPath: string, config: ScanConfig): Promise<void> {
    if (!rootPath) {
      throw new ConfigValidationError('rootPath 不能为空');
    }
    const exists = await pathExists(rootPath);
    if (!exists) {
      throw new FileAccessError('找不到工作区根目录', rootPath);
    }
    if (!Array.isArray(config.fileTypes) || config.fileTypes.length === 0) {
      throw new ConfigValidationError('fileTypes 配置必须是非空数组');
    }
    if (config.maxDepth <= 0) {
      throw new ConfigValidationError('maxDepth 必须大于 0');
    }
    if (config.maxFileSizeKB <= 0) {
      throw new ConfigValidationError('maxFileSizeKB 必须大于 0');
    }
    if (!config.outputDir) {
      throw new ConfigValidationError('outputDir 必须是有效路径');
    }
  }

  private async validatePostconditions(
    result: GenerationResult,
    config: ScanConfig
  ): Promise<void> {
    const exists = await pathExists(result.indexPath);
    if (!exists) {
      throw new IndexGenerationError('未生成索引文件: ' + result.indexPath);
    }
    if (result.generatedNodes === 0) {
      throw new IndexGenerationError('索引中没有节点，请检查扫描配置');
    }
    if (!result.indexPath.endsWith(path.join(config.outputDir, 'index.json'))) {
      throw new IndexGenerationError('索引输出路径不符合配置要求');
    }
    if (!result.markdownPath) {
      throw new IndexGenerationError('未提供 Markdown 索引路径');
    }
    const markdownExists = await pathExists(result.markdownPath);
    if (!markdownExists) {
      throw new IndexGenerationError('未生成 Markdown 索引文件: ' + result.markdownPath);
    }
    if (!result.markdownPath.endsWith(path.join(config.outputDir, 'index.md'))) {
      throw new IndexGenerationError('Markdown 索引输出路径不符合配置要求');
    }
  }

  private async scanDirectory(
    rootPath: string,
    currentPath: string,
    config: ScanConfig,
    depth: number
  ): Promise<{ nodes: WikiNode[]; stats: ScanStats }> {
    if (depth > config.maxDepth) {
      return { nodes: [], stats: { scanned: 0, skipped: 0, generated: 0 } };
    }

    const dirEntries = await fs.readdir(currentPath, { withFileTypes: true });
    const nodes: WikiNode[] = [];
    const stats: ScanStats = { scanned: 0, skipped: 0, generated: 0 };

    for (const entry of dirEntries) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        if (config.excludeFolders.includes(entry.name)) {
          continue;
        }
        const child = await this.scanDirectory(rootPath, entryPath, config, depth + 1);
        if (child.nodes.length > 0) {
          nodes.push({
            id: path.relative(rootPath, entryPath).split(path.sep).join('/'),
            title: entry.name,
            path: entryPath,
            type: 'folder',
            children: child.nodes,
          });
        }
        stats.scanned += child.stats.scanned;
        stats.skipped += child.stats.skipped;
        stats.generated += child.stats.generated;
        continue;
      }

      if (!this.isFileSupported(entry.name, config.fileTypes)) {
        stats.skipped += 1;
        continue;
      }

      try {
        const node = await this.processFile(entryPath, rootPath, config.maxFileSizeKB);
        if (node) {
          nodes.push(node);
          stats.generated += 1;
        } else {
          stats.skipped += 1;
        }
      } catch (error) {
        stats.skipped += 1;
      } finally {
        stats.scanned += 1;
      }
    }

    return { nodes, stats };
  }

  private isFileSupported(fileName: string, fileTypes: string[]): boolean {
    const ext = path.extname(fileName).replace('.', '').toLowerCase();
    return fileTypes.includes(ext);
  }

  private async processFile(
    filePath: string,
    rootPath: string,
    maxFileSizeKB: number
  ): Promise<WikiNode | undefined> {
    const stat = await fs.stat(filePath);
    const sizeKB = stat.size / 1024;
    if (sizeKB > maxFileSizeKB) {
      return undefined;
    }
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(content);
    const summary = this.extractSummary(parsed.content);
    return {
      id: path.relative(rootPath, filePath).split(path.sep).join('/'),
      title: path.basename(filePath),
      path: filePath,
      type: 'file',
      summary,
    };
  }

  private extractSummary(content: string): string | undefined {
    const tokens = this.markdown.parse(content, {});
    for (const token of tokens) {
      if (token.type === 'inline') {
        const text = token.content.trim();
        if (text.length > 0) {
          return text.slice(0, 160);
        }
      }
    }
    return undefined;
  }

  private async writeIndexAtomic(indexPath: string, index: WikiIndex): Promise<void> {
    const directory = path.dirname(indexPath);
    await ensureDirectory(directory);
    const tempPath = indexPath + '.tmp';
    await fs.writeFile(tempPath, JSON.stringify(index, null, 2), 'utf-8');
    await fs.rename(tempPath, indexPath);
  }

  private async writeMarkdownIndex(
    markdownPath: string,
    index: WikiIndex,
    rootPath: string
  ): Promise<void> {
    const directory = path.dirname(markdownPath);
    await ensureDirectory(directory);
    const document = await this.buildMarkdownDocument(index, rootPath);
    await fs.writeFile(markdownPath, document, 'utf-8');
  }

  private async buildMarkdownDocument(index: WikiIndex, rootPath: string): Promise<string> {
    const introduction = await this.buildRepositoryIntroduction(rootPath);
    const metrics = this.collectMetrics(index.nodes);
    const outline = this.buildDirectoryOutline(index.nodes);
    const outlineSection = outline.length > 0 ? outline : '_目录暂无内容_';
    return [
      '# 仓库索引',
      '',
      '## 仓库介绍',
      '',
      introduction,
      '',
      '## 仓库统计',
      '',
      `- 根目录: ${index.root}`,
      `- 目录数: ${metrics.folderCount}`,
      `- 文件数: ${metrics.fileCount}`,
      `- 生成时间: ${index.generatedAt}`,
      '',
      '## 目录大纲',
      '',
      outlineSection,
      '',
    ].join('\n');
  }

  private async buildRepositoryIntroduction(rootPath: string): Promise<string> {
    const candidates = ['README.md', 'readme.md', 'README.MD'];
    for (const candidate of candidates) {
      const candidatePath = path.join(rootPath, candidate);
      const exists = await pathExists(candidatePath);
      if (!exists) {
        continue;
      }
      try {
        const raw = await fs.readFile(candidatePath, 'utf-8');
        const parsed = matter(raw);
        const summary = this.extractMarkdownText(parsed.content, 400);
        if (summary) {
          return summary;
        }
      } catch (error) {
        continue;
      }
    }
    return '未找到仓库介绍，请添加 README.md。';
  }

  private extractMarkdownText(content: string, maxLength: number): string | undefined {
    const tokens = this.markdown.parse(content, {});
    const parts: string[] = [];
    for (const token of tokens) {
      if (token.type !== 'inline') {
        continue;
      }
      const text = token.content.trim();
      if (!text) {
        continue;
      }
      parts.push(text);
      const combined = parts.join('\n').trim();
      if (combined.length >= maxLength) {
        return combined.slice(0, maxLength).trim();
      }
    }
    const combined = parts.join('\n').trim();
    return combined.length > 0 ? combined.slice(0, maxLength).trim() : undefined;
  }

  private buildDirectoryOutline(nodes: WikiNode[], depth = 0): string {
    if (!nodes || nodes.length === 0) {
      return '';
    }
    const lines: string[] = [];
    const indent = '  '.repeat(depth);
    for (const node of nodes) {
      const summary = node.summary ? ` — ${node.summary}` : '';
      lines.push(`${indent}- ${node.title}${summary}`);
      if (node.type === 'folder' && node.children && node.children.length > 0) {
        const childLines = this.buildDirectoryOutline(node.children, depth + 1);
        if (childLines.length > 0) {
          lines.push(childLines);
        }
      }
    }
    return lines.join('\n');
  }

  private collectMetrics(nodes: WikiNode[]): { folderCount: number; fileCount: number } {
    let folderCount = 0;
    let fileCount = 0;
    const walk = (items: WikiNode[]): void => {
      for (const item of items) {
        if (item.type === 'folder') {
          folderCount += 1;
          if (item.children) {
            walk(item.children);
          }
        } else {
          fileCount += 1;
        }
      }
    };
    walk(nodes);
    return { folderCount, fileCount };
  }
}

export default WikiTreeGenerator;
