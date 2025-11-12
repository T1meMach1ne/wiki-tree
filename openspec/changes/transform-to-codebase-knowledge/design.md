# Design: AI 问答功能技术方案

## Context

用户需要集成 AI 问答功能，类似 Coder 助手，能够基于代码库知识库回答关于代码的问题。这需要：
1. 从知识库中提取相关上下文
2. 集成主流 AI 服务（OpenAI、Claude 等）
3. 构建对话界面
4. 管理对话历史和上下文窗口

## Goals / Non-Goals

### Goals

- 支持基于代码库知识库的智能问答
- 支持多个 AI 提供商（OpenAI、Anthropic）
- 支持对话历史和上下文管理
- 安全的 API Key 存储
- 良好的用户体验（类似 Coder 的 Chat UI）

### Non-Goals

- 不支持代码生成（仅问答）
- 不支持多项目知识库（仅当前工作区）
- 不实现自定义 AI 模型训练

## Decisions

### Decision: AI 服务集成架构

**选择**: 使用抽象层 + 多提供商实现

**理由**:
- 支持切换不同的 AI 提供商
- 统一的接口便于测试和维护
- 用户可以根据需求选择不同的服务

**实现**:
```typescript
interface AIService {
  chat(messages: ChatMessage[], context: KnowledgeContext): Promise<ChatResponse>
}

class OpenAIService implements AIService { ... }
class AnthropicService implements AIService { ... }
```

### Decision: 上下文构建策略

**选择**: 基于问题的语义搜索 + 知识库索引

**理由**:
- 知识库可能很大，不能全部发送给 AI
- 需要根据问题提取最相关的上下文
- 使用向量搜索或关键词匹配找到相关代码结构

**实现**:
1. 解析用户问题，提取关键词
2. 在知识库中搜索匹配的代码结构、文档
3. 构建包含相关上下文的提示
4. 限制上下文大小（如 4000 tokens）

### Decision: 对话管理

**选择**: 使用 VSCode Webview 实现 Chat UI，对话历史存储在内存中

**理由**:
- Webview 提供更好的 UI 体验
- 对话历史可以保存在工作区配置中（可选）
- 支持多轮对话和上下文保持

**实现**:
- 使用 VSCode Webview API 创建 Chat 界面
- 对话历史存储在 `Map<sessionId, ChatMessage[]>`
- 支持清除对话历史

### Decision: API Key 存储

**选择**: 使用 VSCode SecretStorage API

**理由**:
- VSCode 提供的安全存储机制
- 支持不同工作区的不同配置
- 符合 VSCode 扩展最佳实践

**实现**:
```typescript
const secretStorage = context.secrets
await secretStorage.store('ai.apiKey', apiKey)
```

### Decision: 提示工程

**选择**: 使用结构化提示模板

**理由**:
- 确保 AI 理解代码库上下文
- 提供清晰的指令和格式要求
- 支持不同类型的问答（代码理解、架构解释等）

**提示模板示例**:
```
你是一个代码库助手，基于以下代码库信息回答问题：

## 项目概览
{projectOverview}

## 相关代码结构
{codeStructures}

## 依赖关系
{dependencies}

## 用户问题
{userQuestion}

请基于以上信息回答问题，如果涉及代码，请提供文件路径和行号。
```

## Risks / Trade-offs

### 风险 1: API 调用成本

**风险**: AI API 调用可能产生费用

**缓解措施**:
- 提供配置选项限制每次对话的上下文大小
- 支持本地模型（未来扩展）
- 提示用户注意 API 使用成本

### 风险 2: 上下文窗口限制

**风险**: AI 模型的上下文窗口有限，大型项目可能无法完整包含

**缓解措施**:
- 智能提取最相关的上下文
- 支持分块处理（chunking）
- 提供手动选择上下文的选项

### 风险 3: 隐私和安全

**风险**: 代码可能包含敏感信息

**缓解措施**:
- 明确告知用户代码会被发送到 AI 服务
- 提供配置选项排除敏感文件
- 支持本地部署的 AI 服务（未来扩展）

## Migration Plan

### 阶段 1: 基础架构
1. 创建 AI 服务抽象层
2. 实现 OpenAI 集成
3. 实现上下文构建逻辑

### 阶段 2: UI 实现
1. 创建 Webview Chat UI
2. 实现对话管理
3. 集成知识库上下文

### 阶段 3: 增强功能
1. 支持 Anthropic Claude
2. 优化上下文提取算法
3. 添加配置选项

## Open Questions

1. **是否需要支持代码引用和跳转？**
   - 回答中的代码位置如何高亮和跳转？
   - 是否需要支持代码片段预览？

2. **如何处理大型项目的上下文？**
   - 是否需要实现更智能的上下文选择算法？
   - 是否需要支持用户手动选择上下文？

3. **是否需要支持流式响应？**
   - 实时显示 AI 回答可以提高用户体验
   - 但需要更复杂的实现

4. **是否需要支持多语言问答？**
   - 当前设计支持中文和英文
   - 是否需要扩展到其他语言？

