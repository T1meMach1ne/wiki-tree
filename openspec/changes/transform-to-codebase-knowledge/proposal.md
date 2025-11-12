# Change: 将 Wiki Tree 改造为代码库知识库插件

## Why

当前项目是一个文档索引插件（Wiki Tree），但用户需要的是一个类似 Coder/Qoder 的功能，能够针对当前项目文件夹生成对应的仓库知识库。这需要从简单的文档索引升级为深度的代码库分析和知识库生成能力。

**核心差异**:

- **当前**: 扫描文件 → 生成文档索引 → 提供搜索和预览
- **目标**: 分析代码结构 → 生成知识库 → 提供代码理解、架构图谱、技术文档

## What Changes

### 核心功能增强

1. **代码结构分析**
   - 解析代码文件（TypeScript、Java、Vue、CSS、JavaScript）的 AST
   - 提取类、函数、接口、依赖关系
   - 生成代码组织结构图
   - **优先支持语言**: TypeScript、Java、Vue、CSS、JavaScript

2. **依赖关系分析**
   - 分析模块间的导入/导出关系
   - 识别外部依赖（npm、maven、pip 等）
   - 生成依赖关系图谱

3. **知识库生成**
   - 项目概览文档（技术栈、架构、模块说明）
   - 代码关系图谱（类图、模块依赖图）
   - API 文档（函数签名、参数说明）
   - 技术文档（README、架构设计文档）

4. **知识库查询**
   - 代码搜索和导航
   - **AI 智能问答**（集成 AI 能力，类似 Coder 助手）
   - 快速了解项目结构和代码关系

5. **AI 问答功能**
   - 基于代码库知识库的智能问答
   - 支持代码理解、架构解释、问题解答
   - 集成主流 AI 服务（OpenAI、Claude 等）

### 架构变更

- **BREAKING**: 扩展核心功能从文档索引到代码分析
- **BREAKING**: 新增代码解析器（AST 分析）
- **BREAKING**: 新增知识库生成引擎
- **MODIFIED**: 索引数据结构扩展，包含代码结构信息
- **ADDED**: 依赖分析模块
- **ADDED**: 图谱生成模块（使用 Mermaid 进行可视化）

### 技术栈扩展

- **ADDED**: AST 解析库（`@typescript-eslint/parser`、`@babel/parser`、`vue-template-compiler` 等）
- **ADDED**: 依赖分析工具（如 `dependency-cruiser`）
- **ADDED**: Mermaid 图表库（用于依赖图谱可视化）
- **ADDED**: AI SDK（OpenAI、Anthropic 等，用于智能问答）
- **MODIFIED**: 索引格式扩展，支持代码结构数据

## Impact

### 受影响的规范

- **MODIFIED**: `codebase-knowledge` - 从文档索引扩展为代码库知识库
- **ADDED**: `code-analysis` - 代码结构分析能力
- **ADDED**: `dependency-analysis` - 依赖关系分析能力
- **ADDED**: `knowledge-graph` - 知识图谱生成能力（Mermaid）
- **ADDED**: `ai-assistant` - AI 问答助手功能

### 受影响的代码

- `src/core/WikiTreeGenerator.ts` - 扩展为代码分析器
- `src/types/index.ts` - 扩展数据结构
- `src/core/` - 新增代码分析模块
- `package.json` - 新增依赖包

### 用户体验变化

- **BREAKING**: 插件定位从"文档索引"变为"代码库知识库"
- **ADDED**: 新增代码结构视图
- **ADDED**: 新增依赖关系视图（Mermaid 可视化）
- **ADDED**: 新增知识库查询功能
- **ADDED**: 新增 AI 问答界面（类似 Coder 助手）

### 性能影响

- 代码分析可能增加扫描时间（需要 AST 解析）
- 建议：增量分析 + 缓存机制
- 大型项目可能需要更长的处理时间
