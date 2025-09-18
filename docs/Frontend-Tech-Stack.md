# Wiki Tree VSCode 插件最终技术栈方案

## 1. 整体架构决策

### 1.1 核心原则

- ✅ **轻量优先**：插件体积控制在 2MB 以内
- ✅ **原生体验**：完全融入 VSCode 生态
- ✅ **快速启动**：插件激活时间 < 500ms
- ✅ **简洁功能**：专注文件树、搜索、预览核心功能

### 1.2 架构选择：纯 VSCode 原生 API + 最小化 Webview

```
VSCode 插件架构
├── 主要功能：VSCode 原生 API (90%)
│   ├── TreeView - 文件树导航
│   ├── Commands - 命令面板集成
│   ├── StatusBar - 状态信息
│   └── QuickPick - 快速搜索
└── 辅助功能：轻量 Webview (10%)
    └── 复杂文档预览（仅在必要时）
```

## 2. 核心技术栈

### 2.1 VSCode 插件基础

```json
{
  "dependencies": {
    "chokidar": "^3.5.3",
    "markdown-it": "^13.0.2",
    "gray-matter": "^4.0.3",
    "fuse.js": "^7.0.0"
  },
  "devDependencies": {
    "@types/vscode": "^1.84.0",
    "@types/node": "^18.18.0",
    "typescript": "^5.2.2",
    "@vscode/test-electron": "^2.3.6",
    "esbuild": "^0.19.5"
  }
}
```

### 2.2 构建工具：esbuild

- **替换 Vite**：esbuild 更适合 VSCode 插件
- **超快构建**：比 Webpack 快 10-100 倍
- **体积优化**：内置 tree-shaking 和压缩

```javascript
// build.js
const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "out/extension.js",
  external: ["vscode"],
  format: "cjs",
  platform: "node",
  minify: true,
  sourcemap: true,
});
```

## 3. 功能实现方案

### 3.1 文件树导航 - VSCode TreeView

```typescript
// providers/WikiTreeProvider.ts
export class WikiTreeProvider implements vscode.TreeDataProvider<WikiNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    WikiNode | undefined
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private wikiIndex: WikiIndex) {}

  getTreeItem(element: WikiNode): vscode.TreeItem {
    const item = new vscode.TreeItem(
      element.title,
      element.children
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    item.contextValue = element.type;
    item.resourceUri = vscode.Uri.file(element.path);
    item.iconPath =
      element.type === "folder"
        ? new vscode.ThemeIcon("folder")
        : new vscode.ThemeIcon("file");

    return item;
  }

  getChildren(element?: WikiNode): WikiNode[] {
    return element ? element.children || [] : this.wikiIndex.roots;
  }
}
```

### 3.2 搜索功能 - QuickPick

```typescript
// commands/search.ts
export async function showQuickSearch(wikiIndex: WikiIndex) {
  const fuse = new Fuse(wikiIndex.allNodes, {
    keys: ["title", "summary", "tags"],
    threshold: 0.3,
  });

  const quickPick = vscode.window.createQuickPick();
  quickPick.placeholder = "搜索文档...";

  quickPick.onDidChangeValue((value) => {
    if (value) {
      const results = fuse.search(value);
      quickPick.items = results.map((result) => ({
        label: result.item.title,
        description: result.item.path,
        detail: result.item.summary,
      }));
    }
  });

  quickPick.show();
}
```

### 3.3 文档预览 - 编辑器内预览

```typescript
// commands/preview.ts
export async function previewDocument(node: WikiNode) {
  // 优先在编辑器中打开
  if (node.path.endsWith(".md")) {
    await vscode.commands.executeCommand(
      "markdown.showPreview",
      vscode.Uri.file(node.path)
    );
  } else {
    await vscode.window.showTextDocument(vscode.Uri.file(node.path));
  }
}
```

### 3.4 状态栏信息

```typescript
// providers/StatusBarProvider.ts
export class StatusBarProvider {
  private statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );

  updateStatus(wikiIndex: WikiIndex) {
    this.statusBar.text = `$(book) ${wikiIndex.totalFiles} 个文档`;
    this.statusBar.tooltip = `Wiki Tree: ${wikiIndex.totalFolders} 个文件夹, ${wikiIndex.totalFiles} 个文件`;
    this.statusBar.show();
  }
}
```

## 4. 项目结构

```
src/
├── extension.ts              # 插件入口
├── providers/               # VSCode 数据提供者
│   ├── WikiTreeProvider.ts # 文件树
│   ├── StatusBarProvider.ts # 状态栏
│   └── CompletionProvider.ts # 自动补全
├── commands/               # 命令实现
│   ├── generateIndex.ts   # 生成索引
│   ├── search.ts          # 搜索功能
│   ├── preview.ts         # 预览文档
│   └── refresh.ts         # 刷新树
├── core/                  # 核心逻辑
│   ├── WikiIndex.ts       # 索引数据结构
│   ├── FileScanner.ts     # 文件扫描
│   └── MarkdownParser.ts  # Markdown 解析
├── utils/                 # 工具函数
│   ├── pathUtils.ts       # 路径处理
│   ├── iconUtils.ts       # 图标映射
│   └── configUtils.ts     # 配置管理
└── types/                 # 类型定义
    ├── WikiNode.ts        # 节点类型
    └── Config.ts          # 配置类型
```

## 5. VSCode 集成配置

### 5.1 package.json 贡献点

```json
{
  "contributes": {
    "views": {
      "explorer": [
        {
          "id": "wikiTreeExplorer",
          "name": "Wiki Tree",
          "when": "wikiTreeEnabled"
        }
      ]
    },
    "commands": [
      {
        "command": "wikiTree.generateIndex",
        "title": "生成文档索引",
        "category": "Wiki Tree"
      },
      {
        "command": "wikiTree.search",
        "title": "搜索文档",
        "category": "Wiki Tree"
      },
      {
        "command": "wikiTree.refresh",
        "title": "刷新",
        "icon": "$(refresh)"
      }
    ],
    "menus": {
      "view/title": [
        {
          "command": "wikiTree.refresh",
          "when": "view == wikiTreeExplorer",
          "group": "navigation"
        }
      ],
      "view/item/context": [
        {
          "command": "wikiTree.openFile",
          "when": "view == wikiTreeExplorer && viewItem == file"
        }
      ]
    },
    "keybindings": [
      {
        "command": "wikiTree.search",
        "key": "ctrl+alt+w",
        "mac": "cmd+alt+w"
      }
    ]
  }
}
```

### 5.2 激活事件

```json
{
  "activationEvents": [
    "onView:wikiTreeExplorer",
    "onCommand:wikiTree.generateIndex",
    "workspaceContains:**/*.md"
  ]
}
```

## 6. 性能优化策略

### 6.1 懒加载

- 树节点按需加载子项
- 大文件夹异步扫描
- 索引增量更新

### 6.2 缓存机制

```typescript
// core/CacheManager.ts
export class CacheManager {
  private cache = new Map<string, WikiNode>();

  getCachedNode(path: string): WikiNode | undefined {
    return this.cache.get(path);
  }

  setCachedNode(path: string, node: WikiNode) {
    this.cache.set(path, node);
  }

  invalidateCache(path: string) {
    this.cache.delete(path);
  }
}
```

### 6.3 文件监听优化

```typescript
// core/FileWatcher.ts
export class FileWatcher {
  private watcher = chokidar.watch("**/*.md", {
    ignored: /node_modules|\.git/,
    persistent: true,
    ignoreInitial: true,
  });

  start(onFileChange: (path: string) => void) {
    this.watcher
      .on("add", onFileChange)
      .on("change", onFileChange)
      .on("unlink", onFileChange);
  }
}
```

## 7. 用户体验设计

### 7.1 主题适配

```typescript
// utils/themeUtils.ts
export function getThemedIcon(type: string): vscode.ThemeIcon {
  const iconMap = {
    folder: "folder",
    markdown: "markdown",
    image: "file-media",
    document: "file-text",
  };

  return new vscode.ThemeIcon(iconMap[type] || "file");
}
```

### 7.2 错误处理

```typescript
// utils/errorHandler.ts
export function handleError(error: Error, context: string) {
  console.error(`[Wiki Tree] ${context}:`, error);
  vscode.window.showErrorMessage(`Wiki Tree: ${error.message}`);
}
```

## 8. 最小化 Webview 使用

仅在以下场景使用轻量 Webview：

### 8.1 复杂配置面板

```typescript
// webview/ConfigPanel.ts
export class ConfigPanel {
  private panel: vscode.WebviewPanel;

  constructor() {
    this.panel = vscode.window.createWebviewPanel(
      "wikiTreeConfig",
      "配置 Wiki Tree",
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    // 使用原生 HTML + CSS，无需 React
    this.panel.webview.html = this.getHtmlContent();
  }

  private getHtmlContent(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
          }
          .form-group {
            margin-bottom: 16px;
          }
          input {
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            padding: 8px;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <h2>Wiki Tree 配置</h2>
        <div class="form-group">
          <label>扫描文件类型:</label>
          <input type="text" id="fileTypes" value="md,txt,doc">
        </div>
        <button onclick="saveConfig()">保存配置</button>
        <script>
          function saveConfig() {
            const vscode = acquireVsCodeApi();
            vscode.postMessage({
              command: 'saveConfig',
              fileTypes: document.getElementById('fileTypes').value
            });
          }
        </script>
      </body>
      </html>
    `;
  }
}
```

## 9. 构建和打包

### 9.1 构建脚本

```json
{
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "node build.js",
    "watch": "node build.js --watch",
    "test": "node ./out/test/runTest.js",
    "package": "vsce package",
    "publish": "vsce publish"
  }
}
```

### 9.2 体积控制

- 使用 esbuild 的 tree-shaking
- 排除不必要的依赖
- 压缩图标和资源文件

## 10. 最终技术对比

| 功能       | 推荐方案         | 原 Ant Design 方案 |
| ---------- | ---------------- | ------------------ |
| 文件树     | VSCode TreeView  | Ant Design Tree    |
| 搜索       | VSCode QuickPick | Ant Design Input   |
| 布局       | VSCode 原生视图  | Ant Design Layout  |
| 主题       | 自动适配         | 手动配置           |
| 插件大小   | < 2MB            | 10-15MB            |
| 启动时间   | < 500ms          | 2-3s               |
| 开发复杂度 | 中等             | 简单               |
| 用户体验   | 完全原生         | Web 应用风格       |

## 11. 总结

这套方案完美契合您的需求：

- ✅ **纯 VSCode 插件**：100% 融入 VSCode 生态
- ✅ **轻量快速**：插件大小 < 2MB，启动时间 < 500ms
- ✅ **核心功能完整**：文件树、搜索、预览一应俱全
- ✅ **原生体验**：完全符合 VSCode 设计规范
- ✅ **维护简单**：技术栈简洁，依赖最少

放弃了复杂的 Web UI 框架，换来了更好的性能和用户体验，这是正确的技术选择！

## 12. 迁移与扩展建议

1. **从 Web UI 迁移到原生插件**：先梳理现有功能拆分成 VSCode 视图/命令，再按 TreeView、QuickPick、Webview 的组合替换原有页面能力。
2. **多语言支持**：将提示语、菜单、文案抽到 i18n 配置，结合 VSCode localize API 动态加载。
3. **可插拔能力**：为扫描策略、索引持久化、搜索引擎预留接口，便于后续接入 ElasticSearch 或自研服务。
4. **性能量化**：在 CI 中执行基准脚本记录索引时间、内存占用，若指标回退立即阻断合并。
5. **生态沉淀**：将公共组件（Tree Provider、状态栏、日志封装）抽成 npm 内部包，供其他 VSCode 插件复用。

