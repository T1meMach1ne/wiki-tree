# Wiki Tree - VSCode 项目文件夹维基知识库插件

<div align="center">

![Wiki Tree Logo](https://img.shields.io/badge/Wiki-Tree-brightgreen?style=for-the-badge&logo=visual-studio-code)

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-username/wiki-tree)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![VSCode](https://img.shields.io/badge/VSCode-%3E%3D1.74.0-blue.svg)](https://code.visualstudio.com/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.x-green.svg)](https://nodejs.org/)

**在 VSCode 中为您的项目文件夹生成结构化的维基知识库**

[快速开始](#-快速开始) • [功能特性](#-功能特性) • [安装方法](#-安装方法) • [配置说明](#️-配置说明) • [开发指南](#-开发指南)

</div>

## 🌟 项目简介

Wiki Tree 是一个轻量化的 VSCode 扩展，专为项目文档管理而设计。它能够自动扫描您的项目文件夹，生成结构化的知识库索引，并提供强大的文档导航、搜索和预览功能。

### 核心特性

- 🚀 **智能扫描**: 支持 10 种文件类型，自动识别文档结构
- 🔍 **强大搜索**: 内容搜索 + 模糊匹配，快速定位所需文档
- 📁 **树形导航**: VSCode 原生 TreeView，直观的文档层次结构
- ⚡ **高性能**: 插件体积 < 2MB，启动时间 < 500ms
- 🎨 **原生体验**: 纯 VSCode API 实现，完美适配主题
- 💻 **代码注释**: 支持扫描 JavaDoc、JSDoc 等代码注释

## 🚀 快速开始

### 安装

1. 打开 VSCode，按 `Ctrl+Shift+X` 打开扩展商店
2. 搜索 "Wiki Tree"，点击安装
3. 重启 VSCode 以完成安装

### 基本使用

1. **生成文档索引**

   ```
   Ctrl+Shift+P → "Wiki Tree: 生成文档索引"
   ```

2. **浏览文档树**
   - 在左侧资源管理器中查看 "Wiki Tree" 面板
   - 点击文档名称进行预览

3. **搜索文档**
   ```
   Ctrl+Shift+P → "Wiki Tree: 搜索文档"
   ```

## ✨ 功能特性

### 📂 支持的文件类型

| 类型 | 扩展名                     | 说明                                       |
| ---- | -------------------------- | ------------------------------------------ |
| 文档 | `md`, `txt`, `rst`, `adoc` | Markdown、文本、reStructuredText、AsciiDoc |
| 代码 | `java`, `cs`, `js`, `ts`   | Java、C#、JavaScript、TypeScript           |
| Web  | `html`, `vue`              | HTML、Vue 单文件组件                       |

### 🔍 搜索功能

- **内容搜索**: 搜索文档内容和代码注释
- **模糊匹配**: 智能匹配文件名和路径
- **快速导航**: 搜索结果直接跳转到文档
- **响应迅速**: 搜索响应时间 < 200ms

### ⚡ 性能指标

| 指标     | 目标值           | 说明         |
| -------- | ---------------- | ------------ |
| 插件体积 | < 2MB            | 轻量化设计   |
| 启动时间 | < 500ms          | 快速响应     |
| 扫描性能 | 10,000 文件 < 5s | 高效索引生成 |
| 搜索响应 | < 200ms          | 即时搜索体验 |

## 📦 安装方法

### 从 VSCode Marketplace 安装

```bash
# 使用 VSCode 命令行
code --install-extension your-publisher.wiki-tree

# 或者在 VSCode 中手动安装
1. 按 Ctrl+Shift+X 打开扩展面板
2. 搜索 "Wiki Tree"
3. 点击"安装"按钮
```

### 手动安装 VSIX

1. 下载最新的 `.vsix` 文件
2. 在 VSCode 中按 `Ctrl+Shift+P`
3. 输入 `Extensions: Install from VSIX...`
4. 选择下载的 `.vsix` 文件

## ⚙️ 配置说明

### 基础配置

在 VSCode 设置中配置 Wiki Tree：

```json
{
  // 要扫描的文件类型
  "wikiTree.fileTypes": [
    "md",
    "txt",
    "rst",
    "adoc", // 文档类型
    "java",
    "cs",
    "js",
    "ts", // 代码类型
    "html",
    "vue" // Web类型
  ],

  // 排除的文件夹
  "wikiTree.excludeFolders": ["node_modules", ".git", "dist", "build", "target"],

  // 扫描深度限制
  "wikiTree.maxDepth": 10,

  // 文件大小限制 (KB)
  "wikiTree.maxFileSizeKB": 1024,

  // 是否扫描代码注释
  "wikiTree.includeCodeComments": true,

  // 输出目录
  "wikiTree.outputDir": "wiki-tree"
}
```

### 高级配置

详细的配置选项请参考 [API 参考文档](docs/API-Reference.md)。

## 🛠️ 开发指南

### 技术栈

- **语言**: TypeScript 5.2+
- **运行时**: Node.js 18.x LTS+
- **构建工具**: esbuild
- **架构**: VSCode 原生 API

### 开发环境搭建

1. **克隆项目**

   ```bash
   git clone https://github.com/your-username/wiki-tree.git
   cd wiki-tree
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **编译开发**

   ```bash
   npm run compile
   ```

4. **运行测试**

   ```bash
   npm test
   ```

5. **打包发布**
   ```bash
   npm run package
   ```

### 项目结构

```
wiki-tree/
├── src/                      # 源代码
│   ├── extension.ts          # 插件入口
│   ├── providers/            # VSCode 数据提供者
│   ├── commands/             # 命令实现
│   ├── core/                 # 核心逻辑
│   ├── utils/                # 工具函数
│   └── types/                # 类型定义
├── test/                     # 测试文件
├── docs/                     # 项目文档
├── out/                      # 构建输出
├── package.json              # 插件配置
└── README.md                 # 项目说明
```

### 核心 API

详细的 API 文档请参考：

- [API 参考文档](docs/API-Reference.md) - 类型定义和接口说明
- [实现指南](docs/Implementation-Guide.md) - 详细开发指南
- [技术规范](docs/Specification.md) - 完整的技术规范

## 📚 文档

### 用户文档

- [📖 快速开始指南](docs/Quick-Start.md) - 5 分钟上手使用
- [🔧 故障排除指南](docs/Troubleshooting.md) - 常见问题解决

### 开发文档

- [📋 软件规格说明](docs/Specification.md) - 完整的系统规格
- [🏗️ 实现指南](docs/Implementation-Guide.md) - 开发环境和实现细节
- [🔌 API 参考](docs/API-Reference.md) - 接口和类型定义
- [⚙️ 技术栈方案](docs/Frontend-Tech-Stack.md) - 技术选型说明

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 如何贡献

1. Fork 这个项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 开发规范

- 遵循 [软件规格说明](docs/Specification.md) 中的接口契约
- 确保测试覆盖率 ≥ 90%
- 所有用户可见文本使用中文
- 遵循 TypeScript 和 ESLint 规范

## 📄 许可证

本项目基于 [Apache License 2.0](LICENSE) 许可证开源。

## 🔗 相关链接

- [VSCode Extension API](https://code.visualstudio.com/api)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [esbuild 构建工具](https://esbuild.github.io/)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者们！

---

<div align="center">
  
**如果这个项目对您有帮助，请给我们一个 ⭐ Star！**

[报告 Bug](https://github.com/your-username/wiki-tree/issues) • [请求功能](https://github.com/your-username/wiki-tree/issues) • [参与讨论](https://github.com/your-username/wiki-tree/discussions)

</div>
