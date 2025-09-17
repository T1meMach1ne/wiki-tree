# Wiki Tree VSCode Extension - 文档索引

## 文档结构

### 主要文档

- **[Specification.md](Specification.md)** - 软件规格说明书

  - 系统概述与边界
  - 功能规格说明（接口规范、数据结构）
  - 非功能性需求规范
  - 接口契约与配置规范
  - 错误处理规范
  - 测试规范
  - 部署和维护规范

- **[API-Reference.md](API-Reference.md)** - API 参考文档

  - 核心类型定义
  - VSCode 命令接口
  - 配置项说明
  - 事件系统

- **[Implementation-Guide.md](Implementation-Guide.md)** - 实现指南

  - 开发环境搭建
  - 核心组件实现
  - 测试策略
  - 部署配置

- **[Frontend-Tech-Stack.md](Frontend-Tech-Stack.md)** - 前端技术栈方案

  - VSCode 原生 API 架构
  - 轻量化技术栈选择
  - 性能优化策略
  - 构建工具配置

- **[Quick-Start.md](Quick-Start.md)** - 快速开始指南

  - 安装和配置
  - 基础使用方法
  - 配置示例
  - 使用技巧

- **[Troubleshooting.md](Troubleshooting.md)** - 故障排除指南

  - 常见问题解决
  - 性能优化建议
  - 诊断工具使用
  - 获取帮助方式

## 开发指南

1. **需求理解**: 阅读 [Specification.md](Specification.md) 了解完整的系统规格
2. **接口设计**: 参考第 2 章的核心接口规范实现
3. **测试要求**: 遵循第 6 章的测试规范进行开发
4. **错误处理**: 按照第 5 章的异常层次设计错误处理

## VSCode 插件项目结构

```
wiki-tree/
├── src/                      # 源代码目录
│   ├── extension.ts          # 插件入口点
│   ├── providers/            # VSCode 数据提供者
│   │   ├── WikiTreeProvider.ts
│   │   └── StatusBarProvider.ts
│   ├── commands/             # 命令实现
│   │   ├── generateIndex.ts
│   │   ├── search.ts
│   │   └── preview.ts
│   ├── core/                 # 核心逻辑
│   │   ├── WikiIndex.ts
│   │   ├── FileScanner.ts
│   │   └── MarkdownParser.ts
│   ├── utils/                # 工具函数
│   │   ├── pathUtils.ts
│   │   └── configUtils.ts
│   └── types/                # 类型定义
│       ├── WikiNode.ts
│       └── Config.ts
├── test/                     # 测试文件
├── out/                      # 构建输出
├── .vscode/                  # VSCode 配置
├── package.json              # 插件配置
├── tsconfig.json             # TypeScript 配置
├── build.js                  # esbuild 构建脚本
└── docs/                     # 项目文档
    ├── Specification.md          # 软件规格说明书
    ├── API-Reference.md          # API 参考文档
    ├── Implementation-Guide.md   # 实现指南
    ├── Frontend-Tech-Stack.md    # 前端技术栈方案
    ├── Quick-Start.md           # 快速开始指南
    ├── Troubleshooting.md       # 故障排除指南
    └── README.md                # 文档索引
```

---

基于 Specification 文档进行开发，确保所有实现符合前置条件、后置条件和异常处理要求。
