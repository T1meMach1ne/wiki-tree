# Wiki Tree 故障排除指南

## 🔍 常见问题

### 1. 插件无法启动

#### 问题症状
- 侧边栏没有显示 Wiki Tree 面板
- 命令面板中找不到 Wiki Tree 命令

#### 解决方案

**检查 VSCode 版本**：
```bash
# 确保 VSCode 版本 >= 1.74.0
```

**手动激活插件**：
1. 按 `Ctrl+Shift+P`
2. 输入 `Developer: Reload Window`
3. 重新加载 VSCode 窗口

**检查插件状态**：
1. 按 `Ctrl+Shift+X` 打开扩展面板
2. 确认 Wiki Tree 插件已启用
3. 如果禁用，点击"启用"

### 2. 文档扫描问题

#### 2.1 扫描没有找到文件

**问题症状**：
- 扫描完成但文档树为空
- 状态栏显示 "0 个文档"

**解决步骤**：

1. **检查文件类型配置**：
```json
{
  "wikiTree.fileTypes": ["md", "txt", "rst", "adoc", "java", "cs", "js", "ts", "html", "vue"]
}
```

2. **检查排除文件夹**：
```json
{
  "wikiTree.excludeFolders": ["node_modules", ".git", "dist", "build", "target"]
}
```

3. **验证文件路径**：
   - 确认项目根目录包含目标文件
   - 检查文件扩展名是否在支持列表中

#### 2.2 扫描速度过慢

**问题症状**：
- 扫描时间超过 30 秒
- VSCode 界面卡顿

**优化配置**：

1. **限制扫描深度**：
```json
{
  "wikiTree.maxDepth": 5  // 从默认 10 减少到 5
}
```

2. **排除大文件夹**：
```json
{
  "wikiTree.excludeFolders": [
    "node_modules", ".git", "dist", "build", "target",
    ".vscode-test", "coverage", "logs"
  ]
}
```

3. **限制文件大小**：
```json
{
  "wikiTree.maxFileSizeKB": 512  // 从默认 1024 减少到 512
}
```

#### 2.3 部分文件被跳过

**问题症状**：
- 某些文档文件没有出现在树中
- 控制台有警告信息

**检查项目**：

1. **文件权限**：
   - 确保 VSCode 有读取文件的权限
   - 检查文件是否被其他程序锁定

2. **文件大小**：
   - 检查文件是否超过大小限制
   - 调整 `maxFileSizeKB` 配置

3. **文件编码**：
   - 确保文件使用 UTF-8 编码
   - 避免二进制文件混入文档目录

### 3. 搜索功能问题

#### 3.1 搜索无结果

**问题症状**：
- 搜索已知存在的内容没有结果
- 搜索界面显示为空

**解决方案**：

1. **重新生成索引**：
   - 按 `Ctrl+Shift+P`
   - 运行 `Wiki Tree: 生成文档索引`

2. **检查搜索内容**：
   - 确认搜索的文件类型已启用内容扫描
   - 验证代码注释搜索设置：
   ```json
   {
     "wikiTree.includeCodeComments": true
   }
   ```

3. **调整搜索阈值**（开发者）：
   - 模糊搜索可能过于严格
   - 尝试使用更简单的关键词

#### 3.2 搜索结果不准确

**问题症状**：
- 搜索结果包含不相关内容
- 相关结果排序靠后

**优化建议**：

1. **使用精确关键词**：
   - 避免过于通用的词汇
   - 使用文档中的专有名词

2. **检查文档质量**：
   - 确保文档有清晰的标题
   - 添加适当的标签和摘要

### 4. 预览功能问题

#### 4.1 Markdown 预览异常

**问题症状**：
- 点击文档无法打开预览
- 预览内容格式错误

**解决方案**：

1. **检查 VSCode Markdown 扩展**：
   - 确保内置 Markdown 扩展已启用
   - 重启 VSCode

2. **手动打开预览**：
   - 右键文件选择 "Open Preview"
   - 或按 `Ctrl+Shift+V`

#### 4.2 代码文件预览问题

**问题症状**：
- 代码文件无法正确高亮
- 注释内容显示异常

**解决方案**：

1. **安装相应语言扩展**：
   - Java: Extension Pack for Java
   - TypeScript: 内置支持
   - Vue: Vetur 或 Vue Language Features

2. **检查文件关联**：
   - 确认文件扩展名正确
   - 验证语言模式设置

### 5. 性能问题

#### 5.1 内存使用过高

**问题症状**：
- VSCode 内存占用异常增长
- 系统变慢或卡顿

**解决方案**：

1. **减少扫描范围**：
```json
{
  "wikiTree.maxDepth": 3,
  "wikiTree.maxFileSizeKB": 256,
  "wikiTree.excludeFolders": ["large-folder1", "large-folder2"]
}
```

2. **禁用代码注释扫描**（临时）：
```json
{
  "wikiTree.includeCodeComments": false
}
```

#### 5.2 启动时间过长

**问题症状**：
- VSCode 启动时插件加载缓慢
- 影响整体启动速度

**优化方案**：

1. **延迟激活**：
   - 插件会在首次使用时才激活
   - 避免在 `settings.json` 中预配置过多选项

2. **清理缓存**：
   - 删除 `.vscode/settings.json` 中的过期配置
   - 重新生成索引文件

## 🔧 诊断工具

### 启用详细日志

1. 打开 VSCode 设置
2. 搜索 "log level"
3. 设置为 "Trace" 级别
4. 查看开发者控制台：`Help > Toggle Developer Tools`

### 手动清理

1. **删除索引文件**：
```bash
# 删除项目根目录下的 wiki-tree 文件夹
rm -rf ./wiki-tree/
```

2. **重置配置**：
```json
{
  // 删除所有 wikiTree.* 配置项
  // 让插件使用默认值
}
```

### 收集诊断信息

如果问题依然存在，请收集以下信息：

1. **环境信息**：
   - VSCode 版本
   - 操作系统版本
   - Wiki Tree 插件版本

2. **项目信息**：
   - 项目文件数量
   - 主要文件类型
   - 项目大小

3. **错误日志**：
   - 开发者控制台的错误信息
   - VSCode 输出面板的日志

## 📞 获取帮助

如果以上方案都无法解决问题：

1. **查看文档**：[完整文档](README.md)
2. **提交 Issue**：包含详细的环境信息和错误日志
3. **社区支持**：在项目讨论区寻求帮助

---

**还有其他问题？** 欢迎查看 [API 参考文档](API-Reference.md) 或 [实现指南](Implementation-Guide.md)。
