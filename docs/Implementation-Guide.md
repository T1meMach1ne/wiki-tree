# Wiki Tree 实现指南

## 开发环境搭建

### 前置条件

- **Node.js >= 18.x LTS**
- **VSCode >= 1.74.0**
- **TypeScript >= 5.2.0**
- **esbuild >= 0.19.0**

### 项目初始化

```bash
# 创建 VSCode 扩展项目
npm install -g yo generator-code
yo code

# 选择: New Extension (TypeScript)
# 扩展名: wiki-tree
```

### 依赖安装

```json
{
  "devDependencies": {
    "@types/vscode": "^1.84.0",
    "@types/node": "^18.18.0",
    "typescript": "^5.2.2",
    "esbuild": "^0.19.5",
    "@vscode/test-electron": "^2.3.6",
    "@vscode/vsce": "^2.22.0",
    "eslint": "^8.52.0",
    "@typescript-eslint/eslint-plugin": "^6.9.0",
    "@typescript-eslint/parser": "^6.9.0",
    "@types/jest": "^29.5.5",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1"
  },
  "dependencies": {
    "chokidar": "^3.5.3",
    "markdown-it": "^13.0.2",
    "gray-matter": "^4.0.3",
    "fuse.js": "^7.0.0"
  }
}
```

## 核心实现

### 1. WikiTreeGenerator 实现

```typescript
// src/core/WikiTreeGenerator.ts
import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";
import { WikiIndex, WikiNode, ScanConfig, GenerationResult } from "../types";

export class WikiTreeGenerator {
  async generateIndex(
    rootPath: string,
    config: ScanConfig
  ): Promise<GenerationResult> {
    // 验证前置条件
    await this.validatePreconditions(rootPath, config);

    const startTime = Date.now();
    const result: GenerationResult = {
      scannedFiles: 0,
      skippedFiles: 0,
      generatedNodes: 0,
      durationMs: 0,
      errors: [],
      indexPath: "",
    };

    try {
      // 扫描文件系统
      const files = await this.scanFileSystem(rootPath, config);

      // 处理文件并生成节点
      const nodes: WikiNode[] = [];
      for (const filePath of files) {
        try {
          const node = await this.processFile(filePath, rootPath);
          if (node) {
            nodes.push(node);
            result.generatedNodes++;
          }
          result.scannedFiles++;
        } catch (error) {
          result.skippedFiles++;
          result.errors.push({
            code: "FILE_PROCESS_ERROR",
            message: error.message,
            filePath,
            recoverable: true,
          });
        }
      }

      // 构建索引
      const index: WikiIndex = {
        version: "0.1.0",
        generatedAt: new Date().toISOString(),
        root: rootPath,
        nodes,
      };

      // 写入索引文件
      const indexPath = path.join(rootPath, config.outputDir, "index.json");
      await this.writeIndexAtomic(indexPath, index);
      result.indexPath = indexPath;

      result.durationMs = Date.now() - startTime;

      // 验证后置条件
      await this.validatePostconditions(result, config);

      return result;
    } catch (error) {
      if (error instanceof ConfigValidationError) {
        throw error;
      }
      throw new IndexGenerationError(`索引生成失败: ${error.message}`);
    }
  }

  private async validatePreconditions(
    rootPath: string,
    config: ScanConfig
  ): Promise<void> {
    // rootPath 必须是绝对路径
    if (!path.isAbsolute(rootPath)) {
      throw new ConfigValidationError("rootPath 必须是绝对路径");
    }

    // 检查目录存在性和权限
    try {
      await fs.access(rootPath, fs.constants.R_OK);
    } catch {
      throw new FileAccessError(`无法访问根目录: ${rootPath}`);
    }

    // 验证配置参数
    if (config.maxFileSizeKB <= 0) {
      throw new ConfigValidationError("maxFileSizeKB 必须大于 0");
    }

    // 验证文件类型
    if (!config.fileTypes || config.fileTypes.length === 0) {
      throw new ConfigValidationError("fileTypes 不能为空");
    }

    // 验证排除文件夹
    for (const folder of config.excludeFolders) {
      if (folder.includes("..") || path.isAbsolute(folder)) {
        throw new ConfigValidationError(`无效的排除文件夹: ${folder}`);
      }
    }
  }

  private async writeIndexAtomic(
    indexPath: string,
    index: WikiIndex
  ): Promise<void> {
    const tempPath = indexPath + ".tmp";

    try {
      // 确保输出目录存在
      await fs.mkdir(path.dirname(indexPath), { recursive: true });

      // 写入临时文件
      await fs.writeFile(tempPath, JSON.stringify(index, null, 2), "utf8");

      // 原子性重命名
      await fs.rename(tempPath, indexPath);
    } catch (error) {
      // 清理临时文件
      try {
        await fs.unlink(tempPath);
      } catch {}

      throw new IndexGenerationError(`写入索引文件失败: ${error.message}`);
    }
  }
}
```

### 2. 文件监听器实现

```typescript
// src/core/FileWatcher.ts
import * as chokidar from "chokidar";

export class FileWatcher {
  private watcher?: chokidar.FSWatcher;
  private onChangeCallback?: (filePath: string) => void;

  start(
    rootPath: string,
    config: ScanConfig,
    onChange: (filePath: string) => void
  ): void {
    this.onChangeCallback = onChange;

    const watchPatterns = config.fileTypes.map((ext) =>
      path.join(rootPath, `**/*.${ext}`)
    );

    this.watcher = chokidar.watch(watchPatterns, {
      ignored: config.excludeFolders.map((folder) =>
        path.join(rootPath, folder, "**")
      ),
      ignoreInitial: true,
      persistent: true,
    });

    this.watcher
      .on("add", this.handleFileChange.bind(this))
      .on("change", this.handleFileChange.bind(this))
      .on("unlink", this.handleFileChange.bind(this))
      .on("error", (error) => {
        console.error("文件监听错误:", error);
      });
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = undefined;
    }
  }

  private handleFileChange(filePath: string): void {
    if (this.onChangeCallback) {
      // 防抖处理，避免频繁触发
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.onChangeCallback!(filePath);
      }, 300);
    }
  }

  private debounceTimer?: NodeJS.Timeout;
}
```

### 3. VSCode TreeView Provider 实现

```typescript
// src/providers/WikiTreeProvider.ts
import * as vscode from "vscode";
import * as path from "path";
import { WikiIndex, WikiNode } from "../types/WikiNode";

export class WikiTreeProvider implements vscode.TreeDataProvider<WikiNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    WikiNode | undefined | null | void
  > = new vscode.EventEmitter<WikiNode | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    WikiNode | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private wikiIndex: WikiIndex) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: WikiNode): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(
      element.title,
      element.children.length > 0
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    treeItem.contextValue = element.type;
    treeItem.resourceUri = vscode.Uri.file(element.path);

    // 设置图标
    switch (element.type) {
      case "folder":
        treeItem.iconPath = new vscode.ThemeIcon("folder");
        break;
      case "document":
        treeItem.iconPath = new vscode.ThemeIcon("markdown");
        break;
      case "code":
        treeItem.iconPath = new vscode.ThemeIcon("code");
        break;
      case "config":
        treeItem.iconPath = new vscode.ThemeIcon("settings-gear");
        break;
      default:
        treeItem.iconPath = new vscode.ThemeIcon("file");
    }

    // 设置命令
    if (element.type !== "folder") {
      treeItem.command = {
        command: "wikiTree.previewDocument",
        title: "预览文档",
        arguments: [element],
      };
    }

    return treeItem;
  }

  getChildren(element?: WikiNode): Thenable<WikiNode[]> {
    if (!element) {
      // 返回根节点
      return Promise.resolve(
        this.wikiIndex.nodes.filter((node) => !node.path.includes("/"))
      );
    }

    // 返回子节点
    const children = this.wikiIndex.nodes.filter((node) =>
      element.children.includes(node.id)
    );

    return Promise.resolve(children);
  }

  updateIndex(newIndex: WikiIndex): void {
    this.wikiIndex = newIndex;
    this.refresh();
  }
}
```

## 测试策略

### 单元测试

```typescript
// test/WikiTreeGenerator.test.ts
import { WikiTreeGenerator } from "../src/core/WikiTreeGenerator";

describe("WikiTreeGenerator", () => {
  let generator: WikiTreeGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new WikiTreeGenerator();
    tempDir = await createTempDirectory();
  });

  afterEach(async () => {
    await cleanupTempDirectory(tempDir);
  });

  test("应该生成有效的索引文件", async () => {
    // 准备测试文件
    await createTestFiles(tempDir);

    const config: ScanConfig = {
      rootPath: tempDir,
      fileTypes: ["md"],
      excludeFolders: ["node_modules"],
      maxDepth: 10,
      includeCodeComments: false,
      maxFileSizeKB: 1024,
      outputDir: "wiki-tree",
    };

    const result = await generator.generateIndex(tempDir, config);

    // 验证结果
    expect(result.scannedFiles).toBeGreaterThan(0);
    expect(result.generatedNodes).toBeGreaterThan(0);
    expect(result.indexPath).toBeTruthy();

    // 验证索引文件内容
    const indexContent = await fs.readFile(result.indexPath, "utf8");
    const index = JSON.parse(indexContent);
    expect(index.version).toBe("0.1.0");
    expect(index.nodes).toHaveLength(result.generatedNodes);
  });

  test("应该正确处理文件访问错误", async () => {
    const invalidPath = "/nonexistent/path";
    const config = createDefaultConfig();

    await expect(generator.generateIndex(invalidPath, config)).rejects.toThrow(
      FileAccessError
    );
  });
});
```

### 集成测试

```typescript
// test/integration/extension.test.ts
describe("Extension Integration", () => {
  test("应该正确注册所有命令", async () => {
    const extension = await vscode.extensions.getExtension("your.wiki-tree");
    await extension?.activate();

    const commands = await vscode.commands.getCommands();
    expect(commands).toContain("wikiTree.generateIndex");
    expect(commands).toContain("wikiTree.search");
    expect(commands).toContain("wikiTree.refresh");
    expect(commands).toContain("wikiTree.previewDocument");
    expect(commands).toContain("wikiTree.openFile");
  });
});
```

## 部署清单

### package.json 配置

```json
{
  "contributes": {
    "commands": [
      {
        "command": "wikiTree.generateIndex",
        "title": "Wiki Tree: 生成文档索引",
        "icon": "$(refresh)"
      },
      {
        "command": "wikiTree.search",
        "title": "Wiki Tree: 搜索文档",
        "icon": "$(search)"
      },
      {
        "command": "wikiTree.refresh",
        "title": "Wiki Tree: 刷新树视图"
      },
      {
        "command": "wikiTree.previewDocument",
        "title": "Wiki Tree: 预览文档"
      },
      {
        "command": "wikiTree.openFile",
        "title": "Wiki Tree: 打开文件"
      }
    ],
    "configuration": {
      "title": "Wiki Tree",
      "properties": {
        "wikiTree.fileTypes": {
          "type": "array",
          "default": [
            "md",
            "txt",
            "rst",
            "adoc",
            "java",
            "cs",
            "js",
            "ts",
            "html",
            "vue"
          ],
          "description": "要扫描的文件类型"
        },
        "wikiTree.excludeFolders": {
          "type": "array",
          "default": ["node_modules", ".git", "dist", "build", "target"],
          "description": "要排除的文件夹"
        }
      }
    }
  }
}
```

### CI/CD 配置

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
      - run: npm ci
      - run: npm test
      - run: npm run compile
```

遵循此实现指南，确保所有代码符合 Specification 中定义的接口契约和质量要求。

## 质量保障与协作

### 代码规范与静态检查
- 所有 TypeScript 文件需通过 ESLint + @typescript-eslint 规则，保持 `npm run lint` 零警告。
- 统一使用 Prettier/EditorConfig 保持格式一致，提交前运行 `npm run format`。
- 推荐配置 Git Hooks（如 Husky + lint-staged），阻止未格式化文件或存在 Lint 错误的提交进入仓库。

### 单元与集成测试基线
- 新增逻辑必须提供单元测试，覆盖正常路径与至少一个异常路径。
- 对索引生成、TreeView 渲染、搜索流程提供集成测试用例，保证接口契约不回退。
- 在 CI 阶段执行 `npm test -- --runInBand`，输出覆盖率报告并保持核心模块覆盖率 ≥ 80%。

### 变更记录与回滚准备
- 每次功能改造在 CHANGELOG 中记录概要、风险与回滚方案。
- 若涉及配置或数据迁移，提前提供脚本与回滚命令，并在 PR 描述中注明验证结果。
- 与产品、测试同步风险窗口和灰度策略，确保上线前责任人明确。

### 文档同步清单
- 更新本指南和 Specification 中的接口、参数、性能指标。
- 在团队 Wiki 上传调试截图、复盘结论，便于新成员复用经验。
- 引入第三方库或 CLI 工具时，在 README 及 `package.json` 的 `scripts` 字段 中补充使用说明。




