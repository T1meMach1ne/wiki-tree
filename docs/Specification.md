# Wiki Tree VSCode Extension - Specification

## 1. 系统概述

**目标系统**: Wiki Tree - VSCode 项目文件夹维基知识库插件  
**版本**: v1.0.0 (最终确认版)  
**文档类型**: 软件规格说明书 (Software Specification)  
**规范状态**: 已确认 ✅

### 1.1 系统目的

在 VSCode 环境中为项目文件夹生成结构化的维基知识库，提供文档导航、内容搜索和文档预览功能。采用纯 VSCode 原生 API 架构，确保轻量化和原生体验。

### 1.2 系统边界

- **输入**: VSCode 工作区文件系统（支持 10 种文件类型）
- **输出**: JSON 索引文件、VSCode TreeView、文档预览
- **环境**: VSCode Extension Host、Node.js 18.x LTS+
- **架构**: 纯 VSCode 原生 API + 最小化 Webview

### 1.3 术语说明

| 术语/缩写              | 说明                                                     | 关联章节 |
| ---------------------- | -------------------------------------------------------- | -------- |
| 知识节点（WikiNode）   | 代表一个文件、目录或知识片段，是 TreeView 的最小显示单元 | 4.1、4.2 |
| 索引文件（index.json） | 扫描生成的结构化数据文件，驱动 TreeView、搜索和预览      | 2.2、4.3 |
| 扫描配置（ScanConfig） | 控制扫描范围、过滤规则、输出路径的参数集合               | 2.1、6.1 |
| 增量扫描               | 仅处理变更文件以缩短耗时的扫描策略                       | 2.3、6.3 |
| Webview                | 为复杂交互提供的轻量页面容器，本项目仅在必要场景启用     | 4.4      |

### 1.4 相关文档与依赖

- 《API-Reference.md》：详细的接口签名与事件契约。
- 《Implementation-Guide.md》：实现步骤、测试策略与 CI/CD 要求。
- 《Frontend-Tech-Stack.md》：VSCode 插件技术栈决策与优化指南。
- 《Quick-Start.md》：团队成员快速参与本项目的操作手册。
- 《Troubleshooting.md》：常见问题与排障流程。

---

## 2. 功能规格说明

### 2.1 核心接口规范

#### 2.1.1 WikiTreeGenerator

```typescript
interface WikiTreeGenerator {
  /**
   * 扫描并生成知识库索引
   * @param rootPath 项目根路径
   * @param config 扫描配置
   * @returns 生成结果统计
   * @precondition rootPath 存在且可读
   * @precondition config 符合 ScanConfig 接口规范
   * @postcondition 生成有效的 index.json 文件
   * @postcondition 返回的统计信息准确反映扫描结果
   * @throws FileAccessError 当文件系统访问失败
   * @throws ConfigValidationError 当配置验证失败
   */
  generateIndex(rootPath: string, config: ScanConfig): Promise<GenerationResult>;
}
```

**前置条件 (Preconditions)**:

- `rootPath` 必须是有效的绝对路径
- `rootPath` 指向的目录必须存在且具有读取权限
- `config.fileTypes` 必须是有效的文件扩展名数组
- `config.excludeFolders` 必须是有效的文件夹名称数组
- `config.maxFileSizeKB` 必须大于 0
- `config.outputDir` 必须是有效的相对路径

**后置条件 (Postconditions)**:

- 在 `${rootPath}/${config.outputDir}/index.json` 生成有效的索引文件
- 索引文件符合 `WikiIndex` 接口规范
- 返回的 `GenerationResult` 包含准确的统计信息
- 扫描过程中不会修改源文件

**异常处理 (Exception Conditions)**:

- `FileAccessError`: 无法访问文件系统时抛出
- `ConfigValidationError`: 配置参数验证失败时抛出
- `IndexGenerationError`: 索引生成过程中发生错误时抛出

#### 2.1.2 WikiSiteServer

```typescript
interface WikiSiteServer {
  /**
   * 启动本地开发服务器
   * @param indexPath 索引文件路径
   * @param port 服务器端口
   * @returns 服务器实例
   * @precondition indexPath 指向有效的索引文件
   * @precondition port 在有效范围内且未被占用
   * @postcondition 服务器在指定端口启动
   * @postcondition 可通过 HTTP 访问站点
   * @throws PortConflictError 当端口被占用
   * @throws IndexLoadError 当索引文件无效
   */
  startServer(indexPath: string, port?: number): Promise<DevServer>;
}
```

**前置条件**:

- `indexPath` 指向的文件必须存在且为有效的 JSON 格式
- `port` 必须在 1024-65535 范围内（如果提供）
- VSCode 环境具有启动本地服务器的权限

**后置条件**:

- HTTP 服务器在指定端口成功启动
- 站点可通过浏览器正常访问
- 服务器状态可通过返回的 `DevServer` 实例控制

#### 2.1.3 StaticExporter

```typescript
interface StaticExporter {
  /**
   * 导出静态站点文件
   * @param indexPath 索引文件路径
   * @param outputDir 导出目录
   * @returns 导出结果
   * @precondition indexPath 指向有效的索引文件
   * @precondition outputDir 具有写入权限
   * @postcondition 生成完整的静态站点文件
   * @postcondition 站点可独立部署运行
   * @throws ExportError 当导出过程失败
   */
  exportStatic(indexPath: string, outputDir: string): Promise<ExportResult>;
}
```

**导出物规范**:

- 输出目录必须位于工作区内且可写，导出前需清理旧版本或创建全新目录
- 输出内容包含 `index.json` 副本、`documents/`（HTML 文档）、`assets/`（静态资源）、`manifest.json`（导出元数据）
- `documents/` 中每个节点文件命名为 `{wikiNodeId}.html`，内容使用 UTF-8 编码并携带 `<meta charset="utf-8">`
- 所有资源引用使用相对路径，禁止绝对磁盘路径或 `file://` 协议

**验收准则**:

- 导出后 `manifest.json` 记录导出时间、版本号、文档计数、警告信息
- 失败时需回滚对 `outputDir` 的改动并返回部分失败详情
- 通过校验所有 `links` 在导出目录中均能找到对应文件或外部 URL 可访问（HEAD 200/3xx）

### 2.2 数据结构规范

#### 2.2.1 WikiIndex

```typescript
interface WikiIndex {
  version: string; // 符合 semver 规范
  generatedAt: string; // ISO 8601 格式时间戳
  root: string; // 绝对路径
  nodes: WikiNode[]; // 非空数组
}
```

**不变式 (Invariants)**:

- `version` 必须符合语义化版本规范
- `generatedAt` 必须是有效的 ISO 8601 时间戳
- `root` 必须是绝对路径
- `nodes` 数组不能为空
- 所有 `WikiNode.id` 在同一索引中必须唯一

#### 2.2.2 WikiNode

```typescript
type NodeType = 'folder' | 'document' | 'config' | 'readme' | 'code' | 'asset' | 'other';

interface WikiNode {
  id: string; // 唯一标识符
  type: NodeType; // 节点类型
  path: string; // 相对于根目录的路径
  title: string; // 显示标题
  summary?: string; // 文档摘要（前500字符）
  content?: string; // 文档内容摘要（用于搜索）
  comments?: string[]; // 代码注释内容（用于搜索）
  tags: string[]; // 标签数组
  language?: string; // 文件语言
  meta: Record<string, any>; // 元数据
  children: string[]; // 子节点ID数组
  links: string[]; // 链接数组
  updatedAt: string; // 更新时间
}
```

**约束条件**:

- `id` 必须在同一索引中唯一
- `type` 必须是 NodeType 枚举值之一
- `path` 必须是相对路径，不能包含 `..`
- `title` 不能为空字符串
- `content` 仅对文档类型文件包含，限制 500 字符且移除 Markdown 标记后存储
- `comments` 仅对代码类型文件包含，单条长度 ≤ 200 字符
- `tags` 数组中不能有重复值，值需符合 `^[a-z0-9-]{2,32}$` 正则
- `links` 仅允许 http/https URL 或以 `./`、`../`、`/` 开头的工作区相对路径，列表中不得重复
- `meta` 必须是 JSON 可序列化值，仅允许顶级键 `frontMatter`、`wordCount`、`readingTime`、`contributors`、`checksum`、`custom`
- `children` 中的每个 ID 必须存在于同一索引中
- `updatedAt` 必须是有效的 ISO 8601 时间戳

#### 2.2.3 ScanConfig

```typescript
interface ScanConfig {
  fileTypes: string[];
  excludeFolders: string[];
  maxDepth: number;
  includeCodeComments: boolean;
  maxFileSizeKB: number;
  outputDir: string;
  followSymlinks?: boolean;
  incrementalCacheFile?: string;
  throttleIntervalMs?: number;
}
```

**约束条件**:

- `followSymlinks` 默认关闭，仅在显式开启时解析符号链接
- `incrementalCacheFile` 为相对路径，默认 `wiki-tree/.wiki-tree-cache.json`，写入时必须原子化
- `throttleIntervalMs` 范围 0-5000，控制批量文件事件合并
- 需与 4.2.2 中的扩展配置保持一致性，不允许出现额外未知字段

#### 2.2.4 GenerationResult

```typescript
interface GenerationResult {
  rootPath: string;
  indexPath: string;
  totalFilesScanned: number;
  indexedDocuments: number;
  skippedFiles: SkippedFile[];
  durationMs: number;
  warnings: string[];
  incremental: {
    enabled: boolean;
    reusedEntries: number;
    cachePath?: string;
  };
}

interface SkippedFile {
  path: string;
  reason: 'EXCLUDED' | 'SIZE_LIMIT' | 'UNSUPPORTED_TYPE' | 'READ_ERROR';
  message?: string;
}
```

**约束条件**:

- `totalFilesScanned` ≥ `indexedDocuments` ≥ 0
- `skippedFiles` 仅包含被忽略文件，`reason` 必须匹配预定义枚举
- `durationMs` 为毫秒整数，必须 ≥ 0
- 当 `incremental.enabled` 为 true 时，`reusedEntries` > 0，且 `cachePath` 存在

#### 2.2.5 DevServer

```typescript
interface DevServer {
  port: number;
  baseUrl: string;
  stop(): Promise<void>;
  reload(changedPath?: string): Promise<void>;
  on(event: 'request' | 'error' | 'close', listener: (payload: DevServerEvent) => void): void;
  isRunning(): boolean;
}

interface DevServerEvent {
  timestamp: string;
  details?: Record<string, string>;
}
```

**行为约束**:

- `port` 与 `baseUrl` 在 `startServer` 成功后立即可用
- `reload` 必须在 200ms 内完成热更新回调，否则返回超时错误
- `stop` 需确保释放文件监听和端口资源，否则视为失败
- `on` 注册的监听器支持一次性移除（`Disposable` 模式）

#### 2.2.6 ExportResult

```typescript
interface ExportResult {
  outputDir: string;
  pageCount: number;
  assetCount: number;
  warnings: string[];
  durationMs: number;
  checksum: string;
}
```

**约束条件**:

- `outputDir` 必须与传入参数一致并存在
- `pageCount` ≥ 0 且等于导出的 HTML 文档数量
- `checksum` 使用 SHA-256，对导出的 `manifest.json` 内容进行签名
- `warnings` 捕获非致命问题，最多 50 条，需在 UI 中可视化

### 2.3 增量扫描策略

**触发条件**:

- 启动插件后首次生成索引或用户执行 `wikiTree.generateIndex` 命令
- 监听 VSCode 文件系统事件（创建、修改、删除）并在防抖窗口后批量处理
- 手动触发 `wikiTree.refresh` 时强制进行一次完整扫描

**缓存与对比逻辑**:

- 将文件 `mtime`、`size`、`checksum` 缓存于 `incrementalCacheFile` 中，作为下次扫描的对比基线
- 仅当元数据发生变化或文件类型从不支持转为支持时才重新解析内容
- 删除文件时立即从索引和缓存中移除对应节点，并记录在 `GenerationResult.skippedFiles` 中

**失败回退策略**:

- 任何阶段出现异常立即回退至全量扫描路径，确保索引与实际文件一致
- 回退时需记录触发异常的文件路径和错误类型，供 Telemetry 与错误提示复用
- 当连续三次增量失败时自动禁用增量模式并提示用户手动排查

**性能验收指标**:

- 增量扫描在 500ms 内完成 50 个以内文件的更新
- 缓存文件写入需为原子操作（临时文件 + rename），避免部分写入导致损坏
- 缓存文件大小不得超过 2MB，超过时自动压缩或强制重建

---

## 3. 非功能性需求规范

### 3.1 性能要求

**响应时间约束**:

- 插件启动: < 500ms
- 索引生成: 10,000 文件 < 5 秒 (SSD)
- 增量更新: 单文件 < 500ms (防抖 2 秒)
- 搜索响应: < 200ms (内容搜索 + 模糊匹配)
- TreeView 交互: < 100ms (懒加载)

**资源使用约束**:

- 插件体积: < 2MB (打包后)
- 内存使用: < 200MB (10k 文件 + 内容索引)
- 磁盘空间: 索引文件 < 源文件总大小的 8% (包含内容摘要)
- CPU 使用: 扫描期间峰值 < 80%
- 文件监听: 防抖 2 秒，批量处理

### 3.2 可靠性要求

**错误处理**:

- 扫描失败不能影响 VSCode 稳定性
- 单个文件处理失败不能中断整体扫描
- 网络不可用时本地功能正常工作

**数据完整性**:

- 索引文件必须原子性写入
- 源文件在任何情况下不被修改
- 并发访问时数据一致性保证

### 3.3 安全性要求

**访问控制**:

- 仅访问当前 VSCode 工作区
- 不能访问工作区外的文件系统
- 不能执行任意系统命令

**数据保护**:

- 不上传任何源代码或文档内容
- 日志中不记录敏感信息
- 索引文件不包含文件完整内容

---

## 4. 接口契约

### 4.1 VSCode Extension API

```typescript
// VSCode插件命令接口规范
namespace Commands {
  /**
   * 生成/刷新知识库索引
   * @precondition 存在活跃的VSCode工作区
   * @postcondition 生成或更新JSON索引文件，刷新TreeView
   */
  const GENERATE_INDEX = 'wikiTree.generateIndex';

  /**
   * 打开搜索界面
   * @precondition 存在有效的索引文件
   * @postcondition 显示VSCode QuickPick搜索界面
   */
  const SEARCH = 'wikiTree.search';

  /**
   * 刷新文件树
   * @precondition TreeView已初始化
   * @postcondition 重新扫描并更新TreeView显示
   */
  const REFRESH = 'wikiTree.refresh';

  /**
   * 预览文档
   * @precondition 选中有效的文档节点
   * @postcondition 在VSCode编辑器中打开或显示Markdown预览
   */
  const PREVIEW_DOCUMENT = 'wikiTree.previewDocument';
}
```

### 4.2 VSCode 插件配置规范

#### 4.2.1 核心技术栈

```typescript
// 插件技术栈配置
const TECH_STACK = {
  // 构建工具
  bundler: 'esbuild', // 替代Vite，更适合VSCode插件

  // 语言和运行时
  language: 'TypeScript 5.2+',
  runtime: 'Node.js 18.x LTS+',

  // VSCode API
  vscodeApi: {
    treeView: 'vscode.TreeDataProvider', // 文件树导航
    quickPick: 'vscode.QuickPick', // 搜索界面
    commands: 'vscode.commands', // 命令系统
    statusBar: 'vscode.StatusBarItem', // 状态栏显示
    preview: 'markdown.showPreview', // 文档预览
  },

  // 核心依赖
  dependencies: {
    fileWatcher: 'chokidar ^3.5.3', // 文件监听
    markdownParser: 'markdown-it ^13.0.2', // Markdown解析
    frontMatter: 'gray-matter ^4.0.3', // Front Matter解析
    fuzzySearch: 'fuse.js ^7.0.0', // 模糊搜索
  },
};
```

#### 4.2.2 用户配置

```typescript
interface ExtensionConfig {
  // 支持的文件类型 (默认: [“md”, “txt”, “rst”, “adoc”, “java”, “cs”, “js”, “ts”, “html”, “vue”])
  fileTypes: string[];

  // 排除文件夹 (默认: [“node_modules”, “.git”, “dist”, “build”, “target”])
  excludeFolders: string[];

  // 最大扫描深度 (默认: 10)
  maxDepth: number;

  // 是否扫描代码注释 (默认: true)
  includeCodeComments: boolean;

  // 文件大小限制 KB (默认: 1024)
  maxFileSizeKB: number;

  // 输出目录 (默认: "wiki-tree")
  outputDir: string;
}
```

**配置验证规则**:

- `fileTypes` 数组中的每个值必须是支持的文件扩展名
- `excludeFolders` 不能包含绝对路径或上级目录引用
- `maxDepth` 必须是正整数，范围 1-20
- `maxFileSizeKB` 必须是正整数，范围 1-10240
- `outputDir` 不能包含路径分隔符以外的特殊字符

### 4.3 索引生成流程

**处理阶段**:

- 发现阶段: 使用 `ScanConfig` 遍历工作区，过滤不支持的文件与目录
- 富化阶段: 根据文件类型提取标题、摘要、标签、语言、链接，并构建 `WikiNode` 实例
- 组装阶段: 构建父子层级、计算统计信息，生成 `WikiIndex` 对象
- 持久化阶段: 将 `WikiIndex` 序列化为 JSON，写入 `index.json` 并同步更新缓存

**一致性保障**:

- 在持久化前对数据结构进行 schema 验证，避免产生不合法索引
- 写入使用临时文件 + rename 确保原子性，同时更新 `GenerationResult.indexPath`
- 每轮生成完成后广播事件供 UI（TreeView、状态栏）刷新

### 4.4 Webview 使用规范

**启用场景**:

- 仅当用户打开树节点的扩展说明或运行静态导出报告时才加载 Webview
- Webview 内容为本地打包 HTML，禁止外部网络请求，使用 `vscode-resource` URI 引入资源

**安全要求**:

- 通过 `Content-Security-Policy` 禁止内联脚本和远程脚本
- 所有消息通信通过 `postMessage`，必须验证消息来源和负载类型
- Webview 关闭时释放资源，避免内存泄露

**无障碍与本地化**:

- 文本需支持中英文切换（依据 VSCode 语言包）
- 键盘导航覆盖所有交互元素，遵循 VSCode 主题色变量

---

## 5. 错误处理规范

### 5.1 异常层次

```typescript
// 基础异常类
abstract class WikiTreeError extends Error {
  abstract readonly code: string;
  abstract readonly recoverable: boolean;
}

// 配置相关异常
class ConfigValidationError extends WikiTreeError {
  readonly code = 'CONFIG_VALIDATION';
  readonly recoverable = true;
}

// 文件系统异常
class FileAccessError extends WikiTreeError {
  readonly code = 'FILE_ACCESS';
  readonly recoverable = false;
}

// 索引生成异常
class IndexGenerationError extends WikiTreeError {
  readonly code = 'INDEX_GENERATION';
  readonly recoverable = true;
}

// 端口冲突异常
class PortConflictError extends WikiTreeError {
  readonly code = 'PORT_CONFLICT';
  readonly recoverable = true;
}

// 索引加载异常
class IndexLoadError extends WikiTreeError {
  readonly code = 'INDEX_LOAD';
  readonly recoverable = true;
}

// 导出异常
class ExportError extends WikiTreeError {
  readonly code = 'EXPORT_ERROR';
  readonly recoverable = true;
}
```

### 5.2 错误恢复策略

**自动重试**:

- 文件访问错误: 最多 3 次重试，固定间隔 500ms
- 文件锁定错误: 最多 5 次重试，固定间隔 200ms
- 索引生成失败: 最多 2 次重试，间隔 1 秒
- TreeView 刷新失败: 最多 3 次重试，防抖 2 秒

**降级处理**:

- 部分文件处理失败: 跳过并记录，继续处理其他文件
- 代码注释提取失败: 跳过注释，保留文件基本信息
- 元数据提取失败: 使用默认值，不中断扫描
- VSCode API 调用失败: 显示用户友好错误信息，提供重试选项

---

## 6. 测试规范

### 6.1 单元测试覆盖

**必须测试的方法**:

- 所有公共接口方法
- 所有异常处理路径
- 边界条件和极端情况

**测试覆盖率要求**:

- 语句覆盖率 ≥ 90%
- 分支覆盖率 ≥ 85%
- 函数覆盖率 = 100%

### 6.2 集成测试场景

**必须验证的场景**:

- 不同操作系统路径处理
- 大型项目 (10k+ 文件) 性能
- 并发访问时的数据一致性
- VSCode API 集成正确性

### 6.3 增量扫描测试场景

**必须覆盖的用例**:

- 单文件更新: 修改 Markdown、代码、二进制文件，验证仅更新受影响节点
- 批量重命名: 同一目录内 20 个文件改名，确认缓存与索引同步更新
- 符号链接: 在启用 `followSymlinks` 后扫描，确保不会产生循环引用
- 缓存损坏: 人为破坏 `incrementalCacheFile`，验证自动回退到全量扫描
- 大规模删除: 删除 1000 个节点并触发刷新，确认索引中不存在孤儿节点

**验证指标**:

- 每个场景记录 `GenerationResult` 度量并与性能目标对比
- 对比导出索引与上一版本差异，确保变更最小化且准确
- 测试日志需包含缓存命中率、回退次数、警告信息，支持 CI 中自动分析

---

## 7. 部署和维护规范

### 7.1 版本兼容性

**VSCode 版本支持**:

- 最低版本: 1.74.0
- API 向后兼容性保证
- 渐进式功能增强

**Node.js 版本支持**:

- 最低版本: 18.x LTS
- 遵循 VSCode Extension Host 要求

### 7.2 VSCode 插件监控和日志

**日志级别**:

- ERROR: 用户可见的错误（显示中文错误信息）
- WARN: 可恢复的问题（跳过文件、降级处理）
- INFO: 关键操作结果（扫描完成、索引更新）
- DEBUG: 详细执行信息（仅开发模式）

**VSCode 插件性能监控**:

- 插件启动时间监控
- 文件扫描耗时记录
- TreeView 刷新性能监控
- 搜索响应时间统计
- 内存使用量监控
- 文件处理成功率统计

### 7.3 用户体验规范

**VSCode UI 集成**:

```typescript
// TreeView 配置
const TREE_VIEW_CONFIG = {
  id: 'wikiTreeExplorer',
  name: 'Wiki Tree',
  location: 'explorer', // 在资源管理器中显示
  showCollapseAll: true, // 显示“折叠全部”按钮
  canSelectMany: false, // 单选模式
  defaultCollapsed: true, // 默认折叠所有节点
};

// 状态栏配置
const STATUS_BAR_CONFIG = {
  alignment: 'Right',
  priority: 100,
  text: '$(book) {fileCount} 个文档',
  tooltip: 'Wiki Tree: {folderCount} 个文件夹, {fileCount} 个文档',
};

// 搜索配置
const SEARCH_CONFIG = {
  placeholder: '搜索文档...',
  maxResults: 50,
  showDescription: true, // 显示文件路径
  showDetail: true, // 显示文档摘要
};
```

**用户交互规范**:

- ✅ **无右键菜单**: 保持简洁，使用 VSCode 原生交互
- ✅ **默认折叠**: TreeView 节点默认折叠，按需展开
- ✅ **自动主题**: 使用 VSCode CSS 变量，自动适配主题
- ✅ **键盘导航**: 支持完整的键盘导航和快捷键
- ✅ **中文提示**: 所有用户可见文本使用中文

**错误处理用户体验**:

```typescript
// 用户友好的错误提示
const ERROR_MESSAGES = {
  FILE_NOT_FOUND: '找不到指定文件，请检查文件路径',
  PERMISSION_DENIED: '没有访问权限，请检查文件夹权限设置',
  SCAN_TIMEOUT: '文件扫描超时，请尝试缩小扫描范围',
  INDEX_GENERATION: '索引生成失败，请检查文件权限和磁盘空间',
};

// 错误对话框配置
const ERROR_DIALOG_CONFIG = {
  showRetryButton: true, // 显示重试按钮
  showDetailsButton: true, // 显示详情按钮（开发者模式）
  autoHide: false, // 不自动隐藏，等待用户操作
};
```

---

## 8. 版本更新和确认状态

### 8.1 规范确认历史

**v1.0.0 - 最终确认版** (当前版本)

✅ **所有关键问题已确认**:

1. **文件类型支持**: 10 种文件类型 + 代码注释扫描
2. **技术架构**: 纯 VSCode 原生 API + esbuild + TypeScript 5.2+
3. **搜索功能**: 内容搜索 + 模糊匹配（无正则）
4. **性能目标**: 插件<2MB，启动<500ms，扫描 10k 文件<5s
5. **用户体验**: 默认折叠，无右键菜单，中文提示
6. **配置方式**: VSCode 设置界面 + 智能默认值
7. **预览方式**: VSCode 原生 Markdown 预览
8. **错误处理**: 用户友好中文提示 + 重试机制

### 8.2 实现就绪度

✅ **可直接开发实现**:

- 技术栈明确：esbuild + TypeScript + VSCode API
- 接口规范完整：前置/后置条件 + 异常处理
- 数据结构明确：WikiIndex + WikiNode + NodeType
- 性能指标具体：可量化验收
- 用户体验明确：VSCode 原生交互模式

### 8.3 技术首选方案总结

```typescript
// 最终技术栈配置
const FINAL_TECH_STACK = {
  // 架构
  architecture: 'VSCode Native Plugin',

  // 核心技术
  language: 'TypeScript 5.2+',
  bundler: 'esbuild',
  runtime: 'Node.js 18.x LTS+',

  // 文件类型支持
  fileTypes: ['md', 'txt', 'rst', 'adoc', 'java', 'cs', 'js', 'ts', 'html', 'vue'],

  // 功能组件
  fileTree: 'vscode.TreeDataProvider',
  search: 'vscode.QuickPick + fuse.js',
  preview: 'markdown.showPreview',
  fileWatcher: 'chokidar',

  // 性能目标
  performance: {
    pluginSize: '<2MB',
    startupTime: '<500ms',
    scanTime: '<5s (10k files)',
    searchResponse: '<200ms',
    treeInteraction: '<100ms',
  },
};
```

---

**规范状态**: ✅ **已确认完成** - 所有关键问题已解决，可开始开发实现

本规范文档遵循软件工程 Specification 原则，为 Wiki Tree 插件的开发提供完整的行为定义、约束条件和质量要求。所有技术决策已经过充分评估和确认，可以直接指导开发实现。
