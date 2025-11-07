---
name: /openspec-apply
id: openspec-apply
category: OpenSpec
description: 实现已批准的 OpenSpec 变更并保持任务同步。
---

<!-- OPENSPEC:START -->

**护栏规则**

- 优先采用直接、最小化的实现，仅在请求或明确需要时才添加复杂性。
- 将变更严格限制在请求的结果范围内。
- 如需额外的 OpenSpec 约定或澄清，请参考 `openspec/AGENTS.md`（位于 `openspec/` 目录内—如果看不到，请运行 `ls openspec` 或 `openspec update`）。

**步骤**
将这些步骤作为待办事项跟踪，逐一完成。

1. 阅读 `changes/<id>/proposal.md`、`design.md`（如果存在）和 `tasks.md` 以确认范围和验收标准。
2. 按顺序完成任务，保持编辑最小化并专注于请求的变更。
3. 在更新状态之前确认完成—确保 `tasks.md` 中的每一项都已完成。
4. 在所有工作完成后更新清单，以便每个任务都标记为 `- [x]` 并反映实际情况。
5. 当需要额外上下文时，参考 `openspec list` 或 `openspec show <item>`。

**参考**

- 如果在实现过程中需要提案的额外上下文，请使用 `openspec show <id> --json --deltas-only`。
<!-- OPENSPEC:END -->
