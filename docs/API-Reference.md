# Wiki Tree API Reference

## 核心类型定义

### ScanConfig

```typescript
interface ScanConfig {
  /** 根路径 */
  rootPath: string;

  /** 支持的文件类型 */
  fileTypes: string[];

  /** 排除文件夹 */
  excludeFolders: string[];

  /** 最大扫描深度 */
  maxDepth: number;

  /** 是否扫描代码注释 */
  includeCodeComments: boolean;

  /** 最大文件大小限制 (KB) */
  maxFileSizeKB: number;

  /** 输出目录 */
  outputDir: string;

  /** 是否启用增量扫描 */
  incremental?: boolean;
}
```

### GenerationResult

```typescript
interface GenerationResult {
  /** 扫描的文件总数 */
  scannedFiles: number;

  /** 跳过的文件数 */
  skippedFiles: number;

  /** 生成的节点数 */
  generatedNodes: number;

  /** 扫描耗时 (毫秒) */
  durationMs: number;

  /** 错误列表 */
  errors: ScanError[];

  /** 索引文件路径 */
  indexPath: string;
}
```

### NodeType

```typescript
type NodeType =
  | "folder"
  | "document"
  | "config"
  | "readme"
  | "code"
  | "asset"
  | "other";
```

### DevServer

```typescript
interface DevServer {
  /** 服务器端口 */
  readonly port: number;

  /** 服务器URL */
  readonly url: string;

  /** 是否正在运行 */
  readonly isRunning: boolean;

  /** 停止服务器 */
  stop(): Promise<void>;

  /** 重新加载索引 */
  reload(): Promise<void>;
}
```

### ExportResult

```typescript
interface ExportResult {
  /** 导出的文件数 */
  exportedFiles: number;

  /** 输出目录 */
  outputDir: string;

  /** 总文件大小 (字节) */
  totalSize: number;

  /** 导出耗时 (毫秒) */
  durationMs: number;
}
```

## 错误类型

### ScanError

```typescript
interface ScanError {
  /** 错误代码 */
  code: string;

  /** 错误消息 */
  message: string;

  /** 相关文件路径 */
  filePath?: string;

  /** 是否可恢复 */
  recoverable: boolean;
}
```

## VSCode 命令

### wikiTree.generateIndex

**描述**: 生成或刷新知识库索引

**参数**: 无

**返回**: `Promise<GenerationResult>`

**示例**:

```typescript
const result = await vscode.commands.executeCommand("wikiTree.generateIndex");
console.log(`扫描了 ${result.scannedFiles} 个文件`);
```

### wikiTree.search

**描述**: 打开搜索界面

**参数**:

- `target?: 'webview' | 'browser'` - 打开目标，默认 'webview'

**返回**: `Promise<void>`

### wikiTree.exportStatic

**描述**: 导出静态站点

**参数**:

- `outputDir?: string` - 输出目录，默认使用配置

**返回**: `Promise<ExportResult>`

## 配置项

### wikiTree.fileTypes

- **类型**: `string[]`
- **默认值**: `["md", "txt", "rst", "adoc", "java", "cs", "js", "ts", "html", "vue"]`
- **描述**: 要扫描的文件类型列表

### wikiTree.excludeFolders

- **类型**: `string[]`
- **默认值**: `["node_modules", ".git", "dist", "build", "target"]`
- **描述**: 要排除的文件夹列表

### wikiTree.maxDepth

- **类型**: `number`
- **默认值**: `10`
- **范围**: `1-20`
- **描述**: 最大扫描深度

### wikiTree.includeCodeComments

- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 是否扫描代码文件中的注释

### wikiTree.maxFileSizeKB

- **类型**: `number`
- **默认值**: `1024`
- **范围**: `1-10240`
- **描述**: 单个文件大小限制 (KB)

### wikiTree.outputDir

- **类型**: `string`
- **默认值**: `"wiki-tree"`
- **描述**: 相对于根目录的输出目录

## 事件

### onIndexUpdated

**描述**: 索引更新时触发

**回调参数**: `IndexUpdateEvent`

```typescript
interface IndexUpdateEvent {
  /** 索引文件路径 */
  indexPath: string;

  /** 更新类型 */
  type: "full" | "incremental";

  /** 更新时间 */
  timestamp: string;
}
```

**示例**:

```typescript
extension.onIndexUpdated((event) => {
  console.log(`索引已更新: ${event.type}`);
});
```
