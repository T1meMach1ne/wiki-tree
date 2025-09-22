export type NodeType = 'folder' | 'file';

export interface WikiNode {
  id: string;
  title: string;
  path: string;
  type: NodeType;
  summary?: string;
  tags?: string[];
  children?: WikiNode[];
}

export interface WikiIndex {
  version: string;
  generatedAt: string;
  root: string;
  nodes: WikiNode[];
}

export interface ScanConfig {
  fileTypes: string[];
  excludeFolders: string[];
  includeCodeComments: boolean;
  maxDepth: number;
  maxFileSizeKB: number;
  outputDir: string;
}

export interface GenerationError {
  code: string;
  message: string;
  filePath?: string;
  recoverable: boolean;
}

export interface GenerationResult {
  scannedFiles: number;
  skippedFiles: number;
  generatedNodes: number;
  durationMs: number;
  indexPath: string;
  markdownPath: string;
  errors: GenerationError[];
}

export interface DevServer {
  port: number;
  url: string;
  close: () => Promise<void>;
}

export interface StaticExportResult {
  outputDir: string;
  exportedFiles: string[];
}

export interface WorkspaceMetrics {
  folderCount: number;
  fileCount: number;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  data?: Record<string, unknown>;
}
