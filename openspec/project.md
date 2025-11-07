# Project Context

## Purpose

Wiki Tree 是一个轻量化的 VSCode 扩展，专为项目文档管理而设计。它能够自动扫描项目文件夹，生成结构化的知识库索引，并提供强大的文档导航、搜索和预览功能。

**核心目标**:
- 在 VSCode 环境中为项目文件夹生成结构化的维基知识库
- 提供文档导航、内容搜索和文档预览功能
- 采用纯 VSCode 原生 API 架构，确保轻量化和原生体验
- 支持 10 种文件类型（md, txt, rst, adoc, java, cs, js, ts, html, vue）
- 支持代码注释扫描（JavaDoc、JSDoc 等）

## Tech Stack

### 核心技术
- **语言**: TypeScript 5.2+
- **运行时**: Node.js 18.x LTS+
- **构建工具**: esbuild（替代 Vite，更适合 VSCode 插件）
- **架构**: VSCode 原生 API（TreeDataProvider、QuickPick、Commands）

### 核心依赖
- **文件监听**: chokidar ^3.5.3
- **Markdown 解析**: markdown-it ^13.0.2
- **Front Matter 解析**: gray-matter ^4.0.3
- **模糊搜索**: fuse.js ^7.0.0

### 开发工具
- **测试框架**: Jest ^29.7.0 + ts-jest
- **代码检查**: ESLint ^8.52.0 + @typescript-eslint
- **代码格式化**: Prettier ^3.0.3
- **打包工具**: @vscode/vsce ^3.6.0

## Project Conventions

### Code Style

**缩进和格式**:
- 使用 2 个空格缩进（不使用 Tab）
- 使用单引号（`'`）而非双引号
- 花括号紧凑格式：`{key: value}` 而非 `{ key: value }`
- 行尾不使用分号（由 ESLint/Prettier 自动处理）

**命名约定**:
- **类与组件**: PascalCase（如 `WikiTreeGenerator`、`WikiTreeProvider`）
- **函数与变量**: camelCase（如 `generateIndex`、`rootPath`）
- **常量**: UPPER_SNAKE_CASE（如 `MAX_FILE_SIZE`）
- **VSCode 命令**: `extensionNamespace.action` 格式（如 `wikiTree.generateIndex`）

**导入组织**:
- 按业务功能组织模块，避免过度依赖 barrel 文件
- 导入语句使用紧凑格式：`import {a, b} from './module'`

**代码质量**:
- 所有公共 API 需在 `docs/API-Reference.md` 记录
- 通过 `src/types/` 暴露共享类型
- 遵循 VSCode Extension API 最佳实践

### Architecture Patterns

**模块组织**:
- `src/extension.ts`: 插件入口，注册命令和提供者
- `src/providers/`: VSCode 数据提供者（TreeView、StatusBar）
- `src/commands/`: 命令实现（生成索引、搜索、预览等）
- `src/core/`: 核心业务逻辑（WikiTreeGenerator、WikiSiteServer、StaticExporter）
- `src/utils/`: 工具函数（配置、文件系统、日志、状态管理）
- `src/types/`: TypeScript 类型定义

**设计原则**:
- **单一职责**: 每个模块专注于单一功能
- **依赖注入**: 通过构造函数注入依赖，便于测试
- **错误处理**: 使用自定义错误类（WikiTreeError 及其子类）
- **异步处理**: 所有 I/O 操作使用 Promise/async-await
- **性能优先**: 增量扫描、防抖处理、懒加载 TreeView

**VSCode 集成**:
- 使用原生 TreeDataProvider 而非自定义 Webview
- 使用 QuickPick 实现搜索界面
- 使用原生 Markdown 预览而非自定义渲染
- 最小化 Webview 使用（仅在必要时）

### Testing Strategy

**测试框架**: Jest + ts-jest + @vscode/test-electron

**测试组织**:
- 单元测试：与被测模块同目录或 `test/` 目录
- 集成测试：`test/extension/` 目录
- 测试夹具：`test/fixtures/` 目录（示例工作区）

**覆盖率要求**:
- 语句覆盖率 ≥ 90%
- 分支覆盖率 ≥ 85%
- 函数覆盖率 = 100%

**测试重点**:
- 所有公共接口方法
- 所有异常处理路径
- 边界条件和极端情况
- VSCode API 集成正确性
- 增量扫描场景（单文件更新、批量重命名、缓存损坏等）

**测试命令**:
- `npm test`: 运行所有测试
- `npm run test:coverage`: 生成覆盖率报告

### Git Workflow

**分支策略**:
- `main`: 主分支，保持稳定
- `feature/*`: 功能分支
- `fix/*`: 修复分支
- `docs/*`: 文档更新分支

**提交规范**: Conventional Commits
- `feat:`: 新功能
- `fix:`: 修复缺陷
- `docs:`: 文档更新
- `style:`: 代码格式（不影响功能）
- `refactor:`: 重构
- `test:`: 测试相关
- `chore:`: 构建/工具相关

**Pull Request 规范**:
- 主题概述需聚焦改动范围
- 涉及行为或规范调整时，在正文详述并引用相关文档章节或 Issue 编号
- UI 相关改动需提供截图或录屏
- 确保编译、lint、测试与打包全部通过
- 尽量保持 PR 聚焦，文档与代码变更可分开提交

## Domain Context

**核心概念**:
- **知识节点（WikiNode）**: 代表一个文件、目录或知识片段，是 TreeView 的最小显示单元
- **索引文件（index.json/index.md）**: 扫描生成的结构化数据文件与 Markdown 摘要，驱动 TreeView、搜索和预览
- **扫描配置（ScanConfig）**: 控制扫描范围、过滤规则、输出路径的参数集合
- **增量扫描**: 仅处理变更文件以缩短耗时的扫描策略

**文件类型支持**:
- **文档类型**: md, txt, rst, adoc
- **代码类型**: java, cs, js, ts（支持注释扫描）
- **Web 类型**: html, vue

**性能指标**:
- 插件体积: < 2MB（打包后）
- 启动时间: < 500ms
- 索引生成: 10,000 文件 < 5 秒（SSD）
- 增量更新: 单文件 < 500ms（防抖 2 秒）
- 搜索响应: < 200ms
- TreeView 交互: < 100ms（懒加载）

**用户交互**:
- 默认折叠 TreeView 节点
- 无右键菜单，使用 VSCode 原生交互
- 所有用户可见文本使用中文
- 自动适配 VSCode 主题

## Important Constraints

**技术约束**:
- 仅访问当前 VSCode 工作区，不能访问工作区外的文件系统
- 不能执行任意系统命令
- 不上传任何源代码或文档内容
- 索引文件不包含文件完整内容（仅摘要）
- 必须使用 VSCode 原生 API，最小化 Webview 使用

**性能约束**:
- 内存使用: < 200MB（10k 文件 + 内容索引）
- 磁盘空间: 索引文件 < 源文件总大小的 8%
- CPU 使用: 扫描期间峰值 < 80%
- 文件监听: 防抖 2 秒，批量处理

**兼容性约束**:
- VSCode 最低版本: 1.74.0
- Node.js 最低版本: 18.x LTS
- 遵循 VSCode Extension Host 要求
- API 向后兼容性保证

**数据完整性约束**:
- 索引文件必须原子性写入（临时文件 + rename）
- 源文件在任何情况下不被修改
- 并发访问时数据一致性保证
- 扫描失败不能影响 VSCode 稳定性

## External Dependencies

**VSCode API**:
- `vscode.TreeDataProvider`: 文件树导航
- `vscode.QuickPick`: 搜索界面
- `vscode.commands`: 命令系统
- `vscode.StatusBarItem`: 状态栏显示
- `markdown.showPreview`: 文档预览

**NPM 包**:
- `chokidar`: 文件系统监听
- `markdown-it`: Markdown 解析
- `gray-matter`: Front Matter 解析
- `fuse.js`: 模糊搜索算法

**开发依赖**:
- `@types/vscode`: VSCode API 类型定义
- `@vscode/test-electron`: VSCode 扩展测试框架
- `@vscode/vsce`: VSCode 扩展打包工具

**文档依赖**:
- `docs/Specification.md`: 完整的技术规范（权威规范）
- `docs/Implementation-Guide.md`: 实现指南和测试策略
- `docs/API-Reference.md`: API 接口和类型定义
- `docs/Frontend-Tech-Stack.md`: 技术选型说明
