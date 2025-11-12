import { CodeStructure, DependencyInfo } from '../../types'

/**
 * 代码分析器接口
 */
export interface ICodeAnalyzer {
  /**
   * 分析代码文件，提取代码结构
   * @param filePath 文件路径
   * @param content 文件内容
   * @returns 代码结构信息
   */
  analyze(filePath: string, content: string): Promise<CodeStructure | null>

  /**
   * 提取依赖关系
   * @param filePath 文件路径
   * @param content 文件内容
   * @returns 依赖信息列表
   */
  extractDependencies(filePath: string, content: string): Promise<DependencyInfo[]>

  /**
   * 检查是否支持该文件类型
   * @param filePath 文件路径
   * @returns 是否支持
   */
  supports(filePath: string): boolean
}

/**
 * 代码分析器基类
 */
export abstract class BaseCodeAnalyzer implements ICodeAnalyzer {
  protected abstract supportedExtensions: string[]

  abstract analyze(filePath: string, content: string): Promise<CodeStructure | null>
  abstract extractDependencies(filePath: string, content: string): Promise<DependencyInfo[]>

  supports(filePath: string): boolean {
    const ext = this.getFileExtension(filePath)
    return this.supportedExtensions.includes(ext)
  }

  protected getFileExtension(filePath: string): string {
    const parts = filePath.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }

  protected extractJSDocComment(content: string, line: number): string | undefined {
    // 简单的 JSDoc 提取逻辑，可以后续优化
    const lines = content.split('\n')
    if (line < 1 || line > lines.length) {
      return undefined
    }

    const commentLines: string[] = []
    let currentLine = line - 2 // 检查上一行

    // 向上查找注释块
    while (currentLine >= 0) {
      const lineContent = lines[currentLine].trim()
      if (lineContent.startsWith('//') || lineContent.startsWith('*')) {
        commentLines.unshift(lineContent)
        currentLine--
      } else if (lineContent.startsWith('/**')) {
        commentLines.unshift(lineContent)
        break
      } else {
        break
      }
    }

    return commentLines.length > 0 ? commentLines.join('\n') : undefined
  }
}

