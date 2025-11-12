export type NodeType =
  | 'folder'
  | 'file'
  | 'document'
  | 'config'
  | 'readme'
  | 'code'
  | 'asset'
  | 'other';

export interface WikiNode {
  id: string;
  title: string;
  path: string;
  type: NodeType;
  summary?: string;
  tags?: string[];
  children?: WikiNode[];
  // 代码结构信息
  codeStructure?: CodeStructure;
  // 依赖关系信息
  dependencies?: DependencyInfo[];
  // 语言信息
  language?: string;
  // 元数据
  meta?: Record<string, unknown>;
}

export interface WikiIndex {
  version: string;
  generatedAt: string;
  root: string;
  nodes: WikiNode[];
  // 扩展：代码库知识库信息
  knowledgeBase?: KnowledgeBase;
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
  // 扩展：代码分析统计
  codeAnalysis?: {
    filesAnalyzed: number;
    classesFound: number;
    functionsFound: number;
    dependenciesFound: number;
  };
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

// 代码结构相关类型
export interface CodeStructure {
  classes?: ClassInfo[];
  interfaces?: InterfaceInfo[];
  functions?: FunctionInfo[];
  types?: TypeInfo[];
  imports?: ImportInfo[];
  exports?: ExportInfo[];
  comments?: CodeComment[];
}

export interface ClassInfo {
  name: string;
  line: number;
  column: number;
  modifiers?: string[]; // public, private, abstract, etc.
  extends?: string;
  implements?: string[];
  methods?: MethodInfo[];
  properties?: PropertyInfo[];
  docComment?: string;
}

export interface InterfaceInfo {
  name: string;
  line: number;
  column: number;
  extends?: string[];
  properties?: PropertyInfo[];
  methods?: MethodInfo[];
  docComment?: string;
}

export interface FunctionInfo {
  name: string;
  line: number;
  column: number;
  parameters?: ParameterInfo[];
  returnType?: string;
  isAsync?: boolean;
  isGenerator?: boolean;
  docComment?: string;
}

export interface MethodInfo extends FunctionInfo {
  modifiers?: string[]; // public, private, protected, static, etc.
}

export interface TypeInfo {
  name: string;
  line: number;
  column: number;
  type: 'type' | 'enum' | 'union' | 'intersection';
  definition?: string;
  docComment?: string;
}

export interface PropertyInfo {
  name: string;
  line: number;
  column: number;
  type?: string;
  modifiers?: string[];
  defaultValue?: string;
  docComment?: string;
}

export interface ParameterInfo {
  name: string;
  type?: string;
  defaultValue?: string;
  optional?: boolean;
}

export interface ImportInfo {
  source: string;
  line: number;
  column: number;
  defaultImport?: string;
  namedImports?: string[];
  namespaceImport?: string;
  isTypeOnly?: boolean;
}

export interface ExportInfo {
  name: string;
  line: number;
  column: number;
  type: 'default' | 'named' | 'namespace' | 'all';
  source?: string;
}

export interface CodeComment {
  type: 'line' | 'block' | 'jsdoc' | 'javadoc';
  content: string;
  line: number;
  column: number;
}

// 依赖关系相关类型
export interface DependencyInfo {
  type: 'internal' | 'external' | 'npm' | 'maven' | 'gradle' | 'pip';
  name: string;
  version?: string;
  path?: string; // 对于内部依赖
  source?: string; // 对于外部依赖
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface DependencyNode {
  id: string;
  name: string;
  type: 'module' | 'package' | 'file' | 'class';
  path?: string;
  version?: string;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'import' | 'require' | 'extends' | 'implements' | 'dependency';
  line?: number;
}

// 知识库相关类型
export interface KnowledgeBase {
  projectInfo: ProjectInfo;
  codeStructures: Record<string, CodeStructure>; // filePath -> CodeStructure
  dependencyGraph: DependencyGraph;
  mermaidDiagrams: MermaidDiagrams;
}

export interface ProjectInfo {
  name: string;
  description?: string;
  techStack: string[];
  rootPath: string;
  structure: ProjectStructure;
}

export interface ProjectStructure {
  directories: DirectoryInfo[];
  files: FileInfo[];
}

export interface DirectoryInfo {
  name: string;
  path: string;
  depth: number;
  fileCount: number;
  subdirectoryCount: number;
}

export interface FileInfo {
  name: string;
  path: string;
  type: string;
  language?: string;
  size: number;
  lineCount?: number;
}

export interface MermaidDiagrams {
  projectOverview?: string;
  classDiagram?: string;
  dependencyGraph?: string;
  moduleStructure?: string;
}

// 知识库视图类型
export interface KnowledgeBaseView {
  markdown: string;
  mermaid: string;
  viewMode: 'text' | 'mermaid';
}
