## 1. 规范定义

- [ ] 1.1 创建代码库知识库规范（`specs/codebase-knowledge/spec.md`）
- [ ] 1.2 定义代码分析需求
- [ ] 1.3 定义依赖分析需求
- [ ] 1.4 定义知识图谱生成需求

## 2. 数据结构扩展

- [ ] 2.1 扩展 `WikiIndex` 接口，添加代码结构信息
- [ ] 2.2 新增 `CodeStructure` 类型（类、函数、接口等）
- [ ] 2.3 新增 `DependencyGraph` 类型（模块依赖关系）
- [ ] 2.4 新增 `KnowledgeBase` 类型（知识库元数据）

## 3. 代码分析实现

- [ ] 3.1 集成 TypeScript AST 解析器（@typescript-eslint/parser）
- [ ] 3.2 集成 JavaScript AST 解析器（@babel/parser）
- [ ] 3.3 集成 Java 代码解析器
- [ ] 3.4 集成 Vue 单文件组件解析器（vue-template-compiler）
- [ ] 3.5 集成 CSS 解析器（postcss）
- [ ] 3.6 提取代码结构（类、函数、接口）
- [ ] 3.7 提取代码注释和文档

## 4. 依赖分析实现

- [ ] 4.1 解析 package.json（Node.js 项目）
- [ ] 4.2 解析 pom.xml（Java 项目）
- [ ] 4.3 解析 requirements.txt（Python 项目）
- [ ] 4.4 分析代码中的导入/导出关系
- [ ] 4.5 生成依赖关系图谱

## 5. 知识库生成

- [ ] 5.1 生成项目概览文档（Markdown + Mermaid）
- [ ] 5.2 生成代码结构文档（Markdown + Mermaid 类图）
- [ ] 5.3 生成依赖关系文档（Markdown + Mermaid 依赖图）
- [ ] 5.4 实现视图切换功能（文本视图 ↔ Mermaid 视图）
- [ ] 5.5 实现 Mermaid 图谱可视化（Webview 渲染）
- [ ] 5.6 生成 API 文档
- [ ] 5.7 生成技术文档模板

## 6. UI 增强

- [ ] 6.1 扩展 TreeView，显示代码结构
- [ ] 6.2 添加依赖关系视图
- [ ] 6.3 添加知识库查询界面
- [ ] 6.4 添加 Mermaid 图谱可视化（Webview）
- [ ] 6.5 实现知识库文档视图切换 UI（文本/Mermaid 切换按钮）
- [ ] 6.6 实现 AI 问答界面（Chat UI）
- [ ] 6.7 集成 AI 服务（OpenAI/Anthropic API）

## 7. 性能优化

- [ ] 7.1 实现增量代码分析
- [ ] 7.2 添加分析结果缓存
- [ ] 7.3 优化大型项目的处理性能

## 8. 文档更新

- [ ] 8.1 更新 README.md，反映新功能
- [ ] 8.2 更新 Specification.md
- [ ] 8.3 更新 API-Reference.md
- [ ] 8.4 创建使用指南

## 9. AI 问答功能实现

- [ ] 9.1 设计 AI 问答架构（知识库上下文注入）
- [ ] 9.2 实现 AI 服务集成层（支持多提供商）
- [ ] 9.3 实现上下文构建（从知识库提取相关信息）
- [ ] 9.4 实现对话管理（历史记录、上下文窗口）
- [ ] 9.5 实现 AI 问答 UI（Chat 界面）
- [ ] 9.6 添加配置管理（API Key、模型选择等）

## 10. 测试

- [ ] 10.1 编写代码分析单元测试
- [ ] 10.2 编写依赖分析单元测试
- [ ] 10.3 编写知识库生成集成测试
- [ ] 10.4 编写 AI 问答功能测试
- [ ] 10.5 测试大型项目的性能

