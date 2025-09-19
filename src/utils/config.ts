import * as vscode from 'vscode';
import { ScanConfig } from '../types';

const DEFAULT_CONFIG: ScanConfig = {
  fileTypes: ['md', 'txt', 'rst', 'adoc', 'java', 'cs', 'js', 'ts', 'html', 'vue'],
  excludeFolders: ['node_modules', '.git', 'dist', 'build', 'target'],
  includeCodeComments: false,
  maxDepth: 10,
  maxFileSizeKB: 1024,
  outputDir: '.wiki-tree',
};

export function getScanConfig(): ScanConfig {
  const configuration = vscode.workspace.getConfiguration('wikiTree');
  const config: ScanConfig = {
    fileTypes: configuration.get<string[]>('fileTypes', DEFAULT_CONFIG.fileTypes),
    excludeFolders: configuration.get<string[]>('excludeFolders', DEFAULT_CONFIG.excludeFolders),
    includeCodeComments: configuration.get<boolean>(
      'includeCodeComments',
      DEFAULT_CONFIG.includeCodeComments
    ),
    maxDepth: configuration.get<number>('maxDepth', DEFAULT_CONFIG.maxDepth),
    maxFileSizeKB: configuration.get<number>('maxFileSizeKB', DEFAULT_CONFIG.maxFileSizeKB),
    outputDir: configuration.get<string>('outputDir', DEFAULT_CONFIG.outputDir),
  };

  return config;
}

export function getWorkspaceRoot(): string | undefined {
  const firstFolder = vscode.workspace.workspaceFolders?.[0];
  return firstFolder?.uri.fsPath;
}
