import * as fs from 'fs/promises';
import * as path from 'path';
import { ScanConfig, WikiNode } from '../types';

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

export async function ensureDirectory(directoryPath: string): Promise<void> {
  await fs.mkdir(directoryPath, { recursive: true });
}

export function isExcludedDirectory(segments: string[], config: ScanConfig): boolean {
  return segments.some((segment) => config.excludeFolders.includes(segment));
}

export function createNodeFromPath(filePath: string, rootPath: string): WikiNode {
  const relativePath = path.relative(rootPath, filePath);
  const parsed = path.parse(filePath);
  return {
    id: relativePath.split(path.sep).join('/'),
    title: parsed.name,
    path: filePath,
    type: 'file',
  };
}
