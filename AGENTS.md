# Repository Guidelines

## 项目结构与模块组织

docs/ 保存了驱动扩展实现的权威规范（如 Specification.md、Implementation-Guide.md 等）。新增代码须与这些蓝图保持一致：核心扩展源文件放在 src/（extension.ts、providers/、commands/、core/、utils/、 ypes/），Jest 测试保存在 est/ 并配套模拟工作区夹具。将构建产物输出到 out/，不要提交自动生成的归档或 .vsix。若业务行为改变，请同步维护文档以保持规范最新。

## 构建、测试与开发命令

首次开发前运行
npm install 安装依赖。使用
npm run compile 将 TypeScript 转译至 out/，日常迭代时改用
npm run watch。通过
npm run lint 和
npm run format 执行本地质量闸口。使用
npm test 覆盖单元与集成测试（更新覆盖率报告时追加 -- --coverage）。当 lint 与测试全部通过后，再执行
npm run package 打包扩展。

## 代码风格与命名约定

项目定位于 TypeScript 5+，配套 ESLint 与 Prettier。遵循工作区设置：缩进为 2 个空格、统一使用单引号、导入花括号紧凑。按业务功能组织模块，避免过度依赖 barrel 文件。类与组件命名使用 PascalCase，函数与变量使用 camelCase，常量使用 UPPER_SNAKE_CASE，VSCode 命令使用 extensionNamespace.action 的短横线格式。新增公共 API 需在 docs/API-Reference.md 记录，并通过 src/types/ 暴露共享类型。

## 测试指南

依照 docs/Implementation-Guide.md 中的说明使用 Jest 和 VSCode 扩展测试运行器。轻量单元测试与被测模块同目录存放，场景级用例置于 est/extension/。保持语句与分支覆盖率 ≥90%，针对大型仓库或增量扫描需添加示例工作区夹具。提交 PR 时附上
npm run lint 与
npm test 的执行结果，修复缺陷后相应更新故障排查文档。

## 提交与 Pull Request 规范

沿用历史中的 Conventional Commits 风格（如 docs: ...、eat: ...）。主题概述需聚焦改动范围，如涉及行为或规范调整，请在正文详述并引用相关文档章节或 Issue 编号。Pull Request 应包含简明的变更说明，UI 相关改动提供截图或录屏，并勾选编译、lint、测试与打包全部通过的复选项。尽量保持 PR 聚焦，如仅修改文档可与运行时代码变更分开提交。

## 安全与配置提示

勿在测试夹具中嵌入凭据或示例密钥。通过控制依赖和检查
npm run package 产物体积，保持扩展轻量（包体 <2 MB，冷启动 <500 ms）。发布前重新执行
npm run compile，避免陈旧的 out/ 内容；并确保 .vscode/settings.json 与 lint/format 期望保持一致，以便新贡献者快速上手。
