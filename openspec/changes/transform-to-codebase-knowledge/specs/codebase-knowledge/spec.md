# Codebase Knowledge Base Specification

## ADDED Requirements

### Requirement: 代码库知识库生成

系统 MUST 能够分析当前项目文件夹，生成结构化的代码库知识库，包含代码结构、依赖关系、技术栈信息等。

#### Scenario: 生成代码库知识库

- **WHEN** 用户在 VSCode 中打开项目文件夹
- **AND** 执行"生成代码库知识库"命令
- **THEN** 系统扫描项目文件
- **AND** 分析代码结构（类、函数、接口等）
- **AND** 分析依赖关系（模块导入、外部依赖）
- **AND** 生成知识库索引文件（包含代码结构信息）
- **AND** 生成项目概览文档
- **AND** 在 TreeView 中显示代码结构

### Requirement: 代码结构分析

系统 MUST 能够解析代码文件，提取代码结构信息（类、函数、接口、类型等）。

#### Scenario: 分析 TypeScript 代码结构

- **WHEN** 扫描到 TypeScript 文件（.ts、.tsx）
- **THEN** 使用 AST 解析器解析代码
- **AND** 提取类定义（class、interface、type）
- **AND** 提取函数定义（function、arrow function、method）
- **AND** 提取导入/导出语句
- **AND** 提取代码注释（JSDoc）
- **AND** 将结构信息存储到知识库索引

#### Scenario: 分析 Java 代码结构

- **WHEN** 扫描到 Java 文件（.java）
- **THEN** 解析类定义（class、interface、enum）
- **AND** 提取方法定义（public、private、protected）
- **AND** 提取字段定义
- **AND** 提取 JavaDoc 注释
- **AND** 提取包声明和导入语句

#### Scenario: 分析 JavaScript 代码结构

- **WHEN** 扫描到 JavaScript 文件（.js、.jsx）
- **THEN** 使用 Babel AST 解析器解析代码
- **AND** 提取函数定义（function、arrow function）
- **AND** 提取类定义（class）
- **AND** 提取导入/导出语句（import/require、export）
- **AND** 提取代码注释（JSDoc）

#### Scenario: 分析 Vue 单文件组件

- **WHEN** 扫描到 Vue 文件（.vue）
- **THEN** 解析 Vue 单文件组件结构（template、script、style）
- **AND** 提取组件定义（export default）
- **AND** 提取组件属性（props、data、methods、computed）
- **AND** 提取模板中的组件引用
- **AND** 提取样式信息（CSS/SCSS/Less）

#### Scenario: 分析 CSS 文件

- **WHEN** 扫描到 CSS 文件（.css、.scss、.less）
- **THEN** 解析 CSS 规则和选择器
- **AND** 提取类名、ID、伪类选择器
- **AND** 提取 CSS 变量（自定义属性）
- **AND** 提取媒体查询

### Requirement: 依赖关系分析

系统 MUST 能够分析项目中的依赖关系，包括模块间依赖和外部依赖。

#### Scenario: 分析 Node.js 项目依赖

- **WHEN** 检测到 package.json 文件
- **THEN** 解析 dependencies 和 devDependencies
- **AND** 分析代码中的 import/require 语句
- **AND** 生成模块依赖关系图
- **AND** 识别外部依赖和内部模块

#### Scenario: 分析 Java 项目依赖

- **WHEN** 检测到 pom.xml 或 build.gradle 文件
- **THEN** 解析 Maven/Gradle 依赖配置
- **AND** 分析 Java 代码中的 import 语句
- **AND** 生成包依赖关系图

### Requirement: 知识库文档生成

系统 MUST 能够生成结构化的知识库文档，包括项目概览、代码结构、依赖关系等。

#### Scenario: 生成项目概览文档

- **WHEN** 代码库分析完成
- **THEN** 生成项目概览文档（Markdown 格式）
- **AND** 包含项目名称、描述、技术栈
- **AND** 包含项目结构说明
- **AND** 包含主要模块说明
- **AND** 包含依赖关系概览
- **AND** 同时生成对应的 Mermaid 图表数据
- **AND** 在文档中提供视图切换按钮（文本视图 ↔ Mermaid 视图）

#### Scenario: 生成代码结构文档

- **WHEN** 代码结构分析完成
- **THEN** 生成代码结构文档（Markdown 格式）
- **AND** 列出所有类、接口、类型定义（文本格式）
- **AND** 列出所有函数和方法（文本格式）
- **AND** 包含代码注释和文档字符串
- **AND** 同时生成代码结构 Mermaid 类图
- **AND** 支持在文本视图和 Mermaid 图表视图之间切换

#### Scenario: 生成依赖关系图谱

- **WHEN** 依赖关系分析完成
- **THEN** 生成依赖关系文档（Markdown 格式）
- **AND** 包含模块依赖关系的文本描述
- **AND** 同时生成依赖关系 Mermaid 图谱
- **AND** 支持在文本视图和 Mermaid 图表视图之间切换
- **AND** 在 Webview 中使用 Mermaid 渲染可视化显示
- **AND** 支持交互式导航（点击节点跳转到对应文件）

#### Scenario: 知识库文档视图切换

- **WHEN** 用户打开知识库文档（项目概览、代码结构、依赖关系）
- **THEN** 默认显示文本视图（Markdown 格式）
- **AND** 提供"切换到 Mermaid 视图"按钮
- **WHEN** 用户点击切换到 Mermaid 视图
- **THEN** 显示对应的 Mermaid 图表
- **AND** 提供"切换回文本视图"按钮
- **WHEN** 用户点击切换回文本视图
- **THEN** 显示 Markdown 文本内容

### Requirement: 知识库查询

系统 MUST 提供知识库查询功能，支持代码搜索、结构导航、依赖查询等。

#### Scenario: 搜索代码结构

- **WHEN** 用户在搜索框中输入类名或函数名
- **THEN** 系统在知识库中搜索匹配的代码结构
- **AND** 显示匹配的类、函数、接口
- **AND** 支持跳转到源代码位置

#### Scenario: 查看依赖关系

- **WHEN** 用户选择某个模块或文件
- **THEN** 系统显示该模块的依赖关系
- **AND** 显示依赖该模块的其他模块
- **AND** 显示该模块依赖的其他模块

### Requirement: AI 智能问答

系统 MUST 提供基于代码库知识库的 AI 智能问答功能，类似 Coder 助手，能够回答关于代码库的问题。

#### Scenario: 使用 AI 问答功能

- **WHEN** 用户打开 AI 问答界面
- **AND** 输入关于代码库的问题（如"这个项目的主要功能是什么？"）
- **THEN** 系统从知识库中提取相关上下文信息
- **AND** 构建包含代码结构、依赖关系、文档摘要的上下文
- **AND** 调用 AI 服务（OpenAI、Claude 等）生成回答
- **AND** 在 Chat UI 中显示回答
- **AND** 支持追问和对话历史

#### Scenario: AI 回答代码相关问题

- **WHEN** 用户询问特定代码的功能（如"UserService 类的作用是什么？"）
- **THEN** 系统从知识库中查找 UserService 的定义和引用
- **AND** 提取相关的代码结构、注释、依赖关系
- **AND** 构建包含代码上下文的提示
- **AND** AI 基于代码上下文生成详细回答
- **AND** 回答中包含代码位置链接，支持跳转

#### Scenario: AI 回答架构问题

- **WHEN** 用户询问项目架构（如"这个项目的模块依赖关系是怎样的？"）
- **THEN** 系统从知识库中提取依赖关系图谱
- **AND** 生成 Mermaid 图表描述
- **AND** AI 基于依赖关系数据解释架构
- **AND** 在回答中嵌入可视化的依赖图谱

#### Scenario: 配置 AI 服务

- **WHEN** 用户首次使用 AI 问答功能
- **THEN** 系统提示用户配置 AI 服务（API Key、模型选择）
- **AND** 支持配置多个 AI 提供商（OpenAI、Anthropic 等）
- **AND** 支持选择不同的模型（GPT-4、Claude 等）
- **AND** 配置信息安全存储（使用 VSCode SecretStorage）

## MODIFIED Requirements

### Requirement: 项目文件扫描

系统 MUST 扫描项目文件夹，识别代码文件和配置文件，并分析代码结构。

**变更说明**: 从简单的文件索引扩展为代码结构分析。

#### Scenario: 扫描并分析代码文件

- **WHEN** 扫描项目文件夹
- **THEN** 识别代码文件（优先支持：.ts、.tsx、.js、.jsx、.java、.vue、.css、.scss、.less）
- **AND** 根据文件类型选择合适的 AST 解析器
- **AND** 使用 AST 解析器分析代码结构
- **AND** 提取代码结构信息（类、函数、接口等）
- **AND** 提取依赖关系信息
- **AND** 将分析结果存储到知识库索引
