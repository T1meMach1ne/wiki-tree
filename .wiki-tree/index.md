# 仓库索引

## 仓库介绍

Wiki Tree - VSCode 项目文件夹维基知识库插件
<div align="center">
![Wiki Tree Logo](https://img.shields.io/badge/Wiki-Tree-brightgreen?style=for-the-badge&logo=visual-studio-code)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-username/wiki-tree)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![VSCode](https://img.shields.io/badge/

## 仓库统计

- 根目录: d:\JavaProject\wiki-tree
- 目录数: 13
- 文件数: 33
- 生成时间: 2025-09-22T14:25:40.521Z

## 目录大纲

- AGENTS.md — Repository Guidelines
- docs
  - API-Reference.md — Wiki Tree API Reference
  - Frontend-Tech-Stack.md — Wiki Tree VSCode 插件最终技术栈方案
  - Implementation-Guide.md — Wiki Tree 实现指南
  - Quick-Start.md — Wiki Tree 快速开始指南
  - README.md — Wiki Tree VSCode Extension - 文档索引
  - Specification.md — Wiki Tree VSCode Extension - Specification
  - Troubleshooting.md — Wiki Tree 故障排除指南
- out
  - extension.js — "use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames
- README.md — Wiki Tree - VSCode 项目文件夹维基知识库插件
- scripts
  - build.js — /* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
const path = require('path');
- src
  - commands
    - exportStatic.ts — import * as vscode from 'vscode';
import StaticExporter from '../core/StaticExporter';
import { getCurrentIndexPath } from '../utils/state';
import { showErrorM
    - generateIndex.ts — import * as vscode from 'vscode';
import WikiTreeGenerator from '../core/WikiTreeGenerator';
import { WikiTreeProvider } from '../providers/WikiTreeProvider';
i
    - openFile.ts — import * as vscode from 'vscode';
import { showErrorMessage } from '../utils/logger';
    - previewDocument.ts — import * as vscode from 'vscode';
import { showErrorMessage } from '../utils/logger';
    - refresh.ts — import * as vscode from 'vscode';
import { WikiTreeProvider } from '../providers/WikiTreeProvider';
import { getCurrentIndex } from '../utils/state';
import { s
    - search.ts — import * as vscode from 'vscode';
import Fuse from 'fuse.js';
import { WikiNode } from '../types';
import { getCurrentIndex } from '../utils/state';
import { lo
    - startServer.ts — import * as vscode from 'vscode';
import WikiSiteServer from '../core/WikiSiteServer';
import { getCurrentIndexPath } from '../utils/state';
import { showErrorM
  - core
    - errors.ts — export class FileAccessError extends Error {
  constructor(
    message: string,
    public readonly filePath?: string
  ) {
    super(message);
    this.name =
    - StaticExporter.ts — import * as path from 'path';
import * as fs from 'fs/promises';
import { StaticExportResult, WikiIndex, WikiNode } from '../types';
import { IndexLoadError } f
    - WikiSiteServer.ts — import * as http from 'http';
import * as fs from 'fs/promises';
import { DevServer } from '../types';
import { IndexLoadError, PortConflictError } from './erro
    - WikiTreeGenerator.ts — import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import { ConfigValidati
  - extension.ts — import * as vscode from 'vscode';
import WikiTreeGenerator from './core/WikiTreeGenerator';
import WikiSiteServer from './core/WikiSiteServer';
import StaticExp
  - providers
    - StatusBarManager.ts — import * as vscode from 'vscode';
import { WorkspaceMetrics } from '../types';
    - WikiTreeProvider.ts — import * as vscode from 'vscode';
import { WikiIndex, WikiNode } from '../types';
  - types
    - index.ts — export type NodeType = 'folder' | 'file';
  - utils
    - config.ts — import * as vscode from 'vscode';
import { ScanConfig } from '../types';
    - fileSystem.ts — import * as fs from 'fs/promises';
import * as path from 'path';
import { ScanConfig, WikiNode } from '../types';
    - logger.ts — import * as vscode from 'vscode';
    - state.ts — import { WikiIndex } from '../types';
- test
  - core
    - WikiTreeGenerator.test.ts — import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import WikiTreeGenerator from '../../src/core/WikiTreeGenerator';
imp
  - providers
    - WikiTreeProvider.test.ts — jest.mock('vscode', () => require('../../__mocks__/vscode'), { virtual: true });
- __mocks__
  - vscode.ts — class EventEmitter<T> {
  private listeners: Array<(value: T) => void> = [];
