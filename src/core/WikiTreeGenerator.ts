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
}

export default WikiTreeGenerator;
