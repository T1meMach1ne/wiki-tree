import * as path from 'path'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import { BaseCodeAnalyzer } from './CodeAnalyzer'
import {
  CodeStructure,
  ClassInfo,
  FunctionInfo,
  ImportInfo,
  ExportInfo,
  DependencyInfo,
  ParameterInfo,
  MethodInfo,
  PropertyInfo,
} from '../../types'

export class JavaScriptAnalyzer extends BaseCodeAnalyzer {
  protected supportedExtensions = ['js', 'jsx']

  async analyze(filePath: string, content: string): Promise<CodeStructure | null> {
    try {
      const ast = this.parse(content, filePath)
      if (!ast) {
        return null
      }

      const structure: CodeStructure = {
        classes: [],
        functions: [],
        imports: [],
        exports: [],
        comments: [],
      }

      traverse(ast, {
        ClassDeclaration(path) {
          structure.classes?.push(extractClass(path.node, content))
        },
        FunctionDeclaration(path) {
          structure.functions?.push(extractFunction(path.node, content))
        },
        ArrowFunctionExpression(path) {
          if (t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
            structure.functions?.push(extractArrowFunction(path.node, path.parent.id.name, content))
          }
        },
        ImportDeclaration(path) {
          structure.imports?.push(extractImport(path.node))
        },
        ExportDefaultDeclaration(path) {
          structure.exports?.push(extractDefaultExport(path.node))
        },
        ExportNamedDeclaration(path) {
          structure.exports?.push(extractNamedExport(path.node))
        },
      })

      return structure
    } catch (error) {
      console.warn(`Failed to analyze JavaScript file ${filePath}:`, error)
      return null
    }
  }

  async extractDependencies(filePath: string, content: string): Promise<DependencyInfo[]> {
    try {
      const ast = this.parse(content, filePath)
      if (!ast) {
        return []
      }

      const dependencies: DependencyInfo[] = []

      traverse(ast, {
        ImportDeclaration(path) {
          const source = path.node.source.value as string
          if (source.startsWith('.') || source.startsWith('/')) {
            dependencies.push({
              type: 'internal',
              name: source,
              path: this.resolveImportPath(filePath, source),
            })
          } else {
            dependencies.push({
              type: 'npm',
              name: source,
            })
          }
        },
        CallExpression(path) {
          if (
            t.isIdentifier(path.node.callee, { name: 'require' }) &&
            path.node.arguments.length > 0 &&
            t.isStringLiteral(path.node.arguments[0])
          ) {
            const source = path.node.arguments[0].value
            if (source.startsWith('.') || source.startsWith('/')) {
              dependencies.push({
                type: 'internal',
                name: source,
                path: this.resolveImportPath(filePath, source),
              })
            } else {
              dependencies.push({
                type: 'npm',
                name: source,
              })
            }
          }
        },
      })

      return dependencies
    } catch (error) {
      console.warn(`Failed to extract dependencies from ${filePath}:`, error)
      return []
    }
  }

  private parse(content: string, filePath: string): t.File | null {
    try {
      return parse(content, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
      })
    } catch (error) {
      return null
    }
  }

  private resolveImportPath(filePath: string, importPath: string): string {
    if (importPath.startsWith('/')) {
      return importPath
    }
    const dir = path.dirname(filePath)
    return path.resolve(dir, importPath)
  }
}

function extractClass(node: t.ClassDeclaration, content: string): ClassInfo {
  const methods: MethodInfo[] = []
  const properties: PropertyInfo[] = []

  for (const member of node.body.body) {
    if (t.isClassMethod(member)) {
      methods.push(extractMethod(member, content))
    } else if (t.isClassProperty(member)) {
      properties.push(extractProperty(member, content))
    }
  }

  return {
    name: node.id?.name || 'Anonymous',
    line: node.loc?.start.line || 0,
    column: node.loc?.start.column || 0,
    extends: node.superClass && t.isIdentifier(node.superClass) ? node.superClass.name : undefined,
    methods,
    properties,
    docComment: extractJSDocComment(content, node.loc?.start.line || 0),
  }
}

function extractFunction(node: t.FunctionDeclaration, content: string): FunctionInfo {
  const parameters: ParameterInfo[] = []

  for (const param of node.params) {
    if (t.isIdentifier(param)) {
      parameters.push({ name: param.name })
    }
  }

  return {
    name: node.id?.name || 'Anonymous',
    line: node.loc?.start.line || 0,
    column: node.loc?.start.column || 0,
    parameters,
    isAsync: node.async || false,
    isGenerator: node.generator || false,
    docComment: extractJSDocComment(content, node.loc?.start.line || 0),
  }
}

function extractArrowFunction(
  node: t.ArrowFunctionExpression,
  name: string,
  content: string
): FunctionInfo {
  const parameters: ParameterInfo[] = []

  for (const param of node.params) {
    if (t.isIdentifier(param)) {
      parameters.push({ name: param.name })
    }
  }

  return {
    name,
    line: node.loc?.start.line || 0,
    column: node.loc?.start.column || 0,
    parameters,
    isAsync: node.async || false,
    docComment: extractJSDocComment(content, node.loc?.start.line || 0),
  }
}

function extractMethod(node: t.ClassMethod, content: string): MethodInfo {
  const parameters: ParameterInfo[] = []

  for (const param of node.params) {
    if (t.isIdentifier(param)) {
      parameters.push({ name: param.name })
    }
  }

  return {
    name: t.isIdentifier(node.key) ? node.key.name : 'Unknown',
    line: node.loc?.start.line || 0,
    column: node.loc?.start.column || 0,
    parameters,
    modifiers: node.static ? ['static'] : [],
    isAsync: node.async || false,
    isGenerator: node.generator || false,
    docComment: extractJSDocComment(content, node.loc?.start.line || 0),
  }
}

function extractProperty(node: t.ClassProperty, content: string): PropertyInfo {
  return {
    name: t.isIdentifier(node.key) ? node.key.name : 'Unknown',
    line: node.loc?.start.line || 0,
    column: node.loc?.start.column || 0,
    modifiers: node.static ? ['static'] : [],
    docComment: extractJSDocComment(content, node.loc?.start.line || 0),
  }
}

function extractImport(node: t.ImportDeclaration): ImportInfo {
  const source = (node.source.value as string) || ''
  const importInfo: ImportInfo = {
    source,
    line: node.loc?.start.line || 0,
    column: node.loc?.start.column || 0,
  }

  for (const specifier of node.specifiers) {
    if (t.isImportDefaultSpecifier(specifier)) {
      importInfo.defaultImport = specifier.local.name
    } else if (t.isImportSpecifier(specifier)) {
      if (!importInfo.namedImports) {
        importInfo.namedImports = []
      }
      importInfo.namedImports.push(
        t.isIdentifier(specifier.imported) ? specifier.imported.name : specifier.imported.value
      )
    } else if (t.isImportNamespaceSpecifier(specifier)) {
      importInfo.namespaceImport = specifier.local.name
    }
  }

  return importInfo
}

function extractDefaultExport(node: t.ExportDefaultDeclaration): ExportInfo {
  return {
    name: 'default',
    line: node.loc?.start.line || 0,
    column: node.loc?.start.column || 0,
    type: 'default',
  }
}

function extractNamedExport(node: t.ExportNamedDeclaration): ExportInfo {
  if (node.declaration && t.isFunctionDeclaration(node.declaration)) {
    return {
      name: node.declaration.id?.name || 'Unknown',
      line: node.loc?.start.line || 0,
      column: node.loc?.start.column || 0,
      type: 'named',
    }
  }
  return {
    name: 'Unknown',
    line: node.loc?.start.line || 0,
    column: node.loc?.start.column || 0,
    type: 'named',
  }
}

function extractJSDocComment(content: string, line: number): string | undefined {
  const lines = content.split('\n')
  if (line < 1 || line > lines.length) {
    return undefined
  }

  const commentLines: string[] = []
  let currentLine = line - 2

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

