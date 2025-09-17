# Wiki Tree 快速开始指南

## 📦 安装

### 从 VSCode Marketplace 安装

1. 打开 VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 "Wiki Tree"
4. 点击"安装"

### 手动安装

1. 下载 `.vsix` 文件
2. 在 VSCode 中按 `Ctrl+Shift+P`
3. 输入 `Extensions: Install from VSIX...`
4. 选择下载的文件

## 🚀 快速使用

### 1. 生成文档索引

1. 打开包含文档的项目文件夹
2. 按 `Ctrl+Shift+P` 打开命令面板
3. 输入 `Wiki Tree: 生成文档索引`
4. 等待扫描完成

### 2. 浏览文档树

1. 在左侧活动栏查看 "Wiki Tree" 面板
2. 展开文件夹查看文档结构
3. 点击文档名称打开预览

### 3. 搜索文档

1. 在 Wiki Tree 面板中点击搜索图标
2. 或按 `Ctrl+Shift+P` / `Cmd+Shift+P` 打开命令面板，输入 "Wiki Tree: 搜索文档"
3. 输入关键词进行模糊搜索
4. 选择搜索结果快速跳转

## ⚙️ 基础配置

### 文件类型设置

```json
{
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
  ]
}
```

### 排除文件夹

```json
{
  "wikiTree.excludeFolders": ["node_modules", ".git", "dist", "build"]
}
```

### 扫描深度限制

```json
{
  "wikiTree.maxDepth": 10,
  "wikiTree.maxFileSizeKB": 1024
}
```

## 💡 使用技巧

### 1. 代码注释搜索

启用代码注释扫描可以搜索 JavaDoc、JSDoc 等注释内容：

```json
{
  "wikiTree.includeCodeComments": true
}
```

### 2. 快捷键

- `Ctrl+Alt+W` (Windows/Linux) / `Cmd+Alt+W` (Mac) - 快速搜索
- `F1` → "Wiki Tree" - 查看所有命令
- `Ctrl+Shift+P` / `Cmd+Shift+P` - 打开命令面板

### 3. 文档组织建议

```
项目根目录/
├── docs/           # 主要文档
│   ├── README.md
│   ├── api/        # API文档
│   └── guides/     # 指南文档
├── src/            # 源代码（包含注释）
└── examples/       # 示例代码
```

## 🛠️ 故障排除

### 扫描没有结果

1. 检查文件类型配置是否正确
2. 确认文件夹没有被排除
3. 检查文件权限

### 搜索速度慢

1. 减少扫描深度：`"maxDepth": 5`
2. 排除大文件夹：添加到 `excludeFolders`
3. 限制文件大小：`"maxFileSizeKB": 512`

### 文档树不显示

1. 确认工作区已打开项目文件夹
2. 检查是否有支持的文件类型
3. 尝试手动刷新：点击刷新按钮

## 📚 更多资源

- [完整配置参考](API-Reference.md)
- [实现指南](Implementation-Guide.md)
- [技术规范](Specification.md)

---

**需要帮助？** 请查看 [故障排除指南](Troubleshooting.md) 或提交 Issue。
