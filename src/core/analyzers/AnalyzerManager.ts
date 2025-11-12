import * as path from 'path'
import { ICodeAnalyzer, BaseCodeAnalyzer } from './CodeAnalyzer'
import { TypeScriptAnalyzer } from './TypeScriptAnalyzer'
import { JavaScriptAnalyzer } from './JavaScriptAnalyzer'
import { CodeStructure, DependencyInfo } from '../../types'

/**
 * 代码分析器管理器
 * 负责选择合适的分析器来分析代码文件
 */
export class AnalyzerManager {
  private analyzers: ICodeAnalyzer[] = []

  constructor() {
    // 注册所有分析器
    this.analyzers.push(new TypeScriptAnalyzer())
    this.analyzers.push(new JavaScriptAnalyzer())
    // TODO: 添加 Java、Vue、CSS 分析器
  }

  /**
   * 分析代码文件
   */
  async analyze(filePath: string, content: string): Promise<CodeStructure | null> {
    const analyzer = this.findAnalyzer(filePath)
    if (!analyzer) {
      return null
    }

    return analyzer.analyze(filePath, content)
  }

  /**
   * 提取依赖关系
   */
  async extractDependencies(filePath: string, content: string): Promise<DependencyInfo[]> {
    const analyzer = this.findAnalyzer(filePath)
    if (!analyzer) {
      return []
    }

    return analyzer.extractDependencies(filePath, content)
  }

  /**
   * 检查是否支持该文件类型
   */
  supports(filePath: string): boolean {
    return this.findAnalyzer(filePath) !== null
  }

  /**
   * 查找合适的分析器
   */
  private findAnalyzer(filePath: string): ICodeAnalyzer | null {
    for (const analyzer of this.analyzers) {
      if (analyzer.supports(filePath)) {
        return analyzer
      }
    }
    return null
  }

  /**
   * 获取文件的语言类型
   */
  getLanguage(filePath: string): string | undefined {
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      java: 'java',
      vue: 'vue',
      css: 'css',
      scss: 'scss',
      less: 'less',
    }
    return languageMap[ext]
  }
}

