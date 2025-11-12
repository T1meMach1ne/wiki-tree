import * as path from 'path'
import { BaseCodeAnalyzer } from './CodeAnalyzer'
import {
  CodeStructure,
  ClassInfo,
  InterfaceInfo,
  FunctionInfo,
  TypeInfo,
  ImportInfo,
  ExportInfo,
  CodeComment,
  DependencyInfo,
  ParameterInfo,
  MethodInfo,
  PropertyInfo,
} from '../../types'

const { ESLint } = require('eslint')

export class TypeScriptAnalyzer extends BaseCodeAnalyzer {
  protected supportedExtensions = ['ts', 'tsx']
  private parser: any

  constructor() {
    super()
    // 使用 ESLint 的解析器
    this.parser = require('@typescript-eslint/parser')
  }

  async analyze(filePath: string, content: string): Promise<CodeStructure | null> {
    try {
      const ast = this.parse(content, filePath)
      if (!ast) {
        return null
      }

      const structure: CodeStructure = {
        classes: [],
        interfaces: [],
        functions: [],
        types: [],
        imports: [],
        exports: [],
        comments: [],
      }

      this.traverseAST(ast, structure, content)

      return structure
    } catch (error) {
      console.warn(`Failed to analyze TypeScript file ${filePath}:`, error)
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
      const imports: ImportInfo[] = []

      this.traverseASTForImports(ast, imports)

      for (const imp of imports) {
        if (imp.source.startsWith('.') || imp.source.startsWith('/')) {
          // 内部依赖
          dependencies.push({
            type: 'internal',
            name: imp.source,
            path: this.resolveImportPath(filePath, imp.source),
          })
        } else {
          // 外部依赖（npm 包）
          dependencies.push({
            type: 'npm',
            name: imp.source,
          })
        }
      }

      return dependencies
    } catch (error) {
      console.warn(`Failed to extract dependencies from ${filePath}:`, error)
      return []
    }
  }

  private parse(content: string, filePath: string): any {
    try {
      return this.parser.parse(content, {
        ecmaVersion: 2022,
        sourceType: 'module',
        loc: true,
        range: true,
      })
    } catch (error) {
      return null
    }
  }

  private traverseAST(
    node: any,
    structure: CodeStructure,
    content: string
  ): void {
    if (!node || typeof node !== 'object') {
      return
    }

    switch (node.type) {
      case 'ClassDeclaration':
        structure.classes?.push(this.extractClass(node, content))
        break
      case 'TSInterfaceDeclaration':
        structure.interfaces?.push(this.extractInterface(node, content))
        break
      case 'FunctionDeclaration':
        structure.functions?.push(this.extractFunction(node, content))
        break
      case 'TSTypeAliasDeclaration':
        structure.types?.push(this.extractType(node, content))
        break
      case 'ImportDeclaration':
        structure.imports?.push(this.extractImport(node))
        break
      case 'ExportNamedDeclaration':
      case 'ExportDefaultDeclaration':
        structure.exports?.push(this.extractExport(node))
        break
    }

    // 递归遍历子节点
    for (const key in node) {
      const child = (node as any)[key]
      if (Array.isArray(child)) {
        for (const item of child) {
          this.traverseAST(item, structure, content)
        }
      } else if (child && typeof child === 'object' && child.type) {
        this.traverseAST(child, structure, content)
      }
    }
  }

  private traverseASTForImports(node: any, imports: ImportInfo[]): void {
    if (!node || typeof node !== 'object') {
      return
    }

    if (node.type === 'ImportDeclaration') {
      imports.push(this.extractImport(node))
    }

    // 递归遍历子节点
    for (const key in node) {
      const child = (node as any)[key]
      if (Array.isArray(child)) {
        for (const item of child) {
          this.traverseASTForImports(item, imports)
        }
      } else if (child && typeof child === 'object' && child.type) {
        this.traverseASTForImports(child, imports)
      }
    }
  }

  private extractClass(node: any, content: string): ClassInfo {
    const loc = node.loc
    const methods: MethodInfo[] = []
    const properties: PropertyInfo[] = []

    for (const member of node.body.body) {
      if (member.type === 'MethodDefinition') {
        methods.push(this.extractMethod(member, content))
      } else if (member.type === 'PropertyDefinition' || member.type === 'ClassProperty') {
        properties.push(this.extractProperty(member, content))
      }
    }

    return {
      name: node.id?.name || 'Anonymous',
      line: loc?.start.line || 0,
      column: loc?.start.column || 0,
      extends: node.superClass
        ? this.extractName(node.superClass as TSESTree.Node)
        : undefined,
      implements: node.implements
        ? (node.implements as any[]).map((i) => this.extractName(i))
        : undefined,
      methods,
      properties,
      docComment: this.extractJSDocComment(content, loc?.start.line || 0),
    }
  }

  private extractInterface(node: any, content: string): InterfaceInfo {
    const loc = node.loc
    const properties: PropertyInfo[] = []
    const methods: MethodInfo[] = []

    for (const member of node.body.body) {
      if (member.type === 'TSPropertySignature') {
        properties.push(this.extractPropertySignature(member, content))
      } else if (member.type === 'TSMethodSignature') {
        methods.push(this.extractMethodSignature(member, content))
      }
    }

    return {
      name: node.id.name,
      line: loc?.start.line || 0,
      column: loc?.start.column || 0,
      extends: node.extends ? node.extends.map((e: any) => this.extractName(e)) : undefined,
      properties,
      methods,
      docComment: this.extractJSDocComment(content, loc?.start.line || 0),
    }
  }

  private extractFunction(node: any, content: string): FunctionInfo {
    const loc = node.loc
    const parameters: ParameterInfo[] = []

    for (const param of node.params) {
      if (param.type === 'Identifier') {
        parameters.push({
          name: (param as TSESTree.Identifier).name,
        })
      }
    }

    return {
      name: node.id?.name || 'Anonymous',
      line: loc?.start.line || 0,
      column: loc?.start.column || 0,
      parameters,
      returnType: node.returnType
        ? this.extractTypeAnnotation(node.returnType as TSESTree.TSTypeAnnotation)
        : undefined,
      isAsync: node.async || false,
      isGenerator: node.generator || false,
      docComment: this.extractJSDocComment(content, loc?.start.line || 0),
    }
  }

  private extractMethod(node: any, content: string): MethodInfo {
    const loc = node.loc
    const func = node.value
    const parameters: ParameterInfo[] = []

    for (const param of func.params) {
      if (param.type === 'Identifier') {
        parameters.push({
          name: (param as TSESTree.Identifier).name,
        })
      }
    }

    return {
      name: this.extractName(node.key),
      line: loc?.start.line || 0,
      column: loc?.start.column || 0,
      parameters,
      returnType: func.returnType ? this.extractTypeAnnotation(func.returnType) : undefined,
      isAsync: func.async || false,
      isGenerator: func.generator || false,
      modifiers: node.static ? ['static'] : [],
      docComment: this.extractJSDocComment(content, loc?.start.line || 0),
    }
  }

  private extractMethodSignature(node: any, content: string): MethodInfo {
    const loc = node.loc
    const parameters: ParameterInfo[] = []

    for (const param of node.params) {
      if (param.type === 'Identifier') {
        parameters.push({
          name: (param as TSESTree.Identifier).name,
        })
      }
    }

    return {
      name: this.extractName(node.key),
      line: loc?.start.line || 0,
      column: loc?.start.column || 0,
      parameters,
      returnType: node.returnType
        ? this.extractTypeAnnotation(node.returnType as TSESTree.TSTypeAnnotation)
        : undefined,
      docComment: this.extractJSDocComment(content, loc?.start.line || 0),
    }
  }

  private extractProperty(node: any, content: string): PropertyInfo {
    const loc = node.loc
    return {
      name: this.extractName(node.key),
      line: loc?.start.line || 0,
      column: loc?.start.column || 0,
      type: node.typeAnnotation
        ? this.extractTypeAnnotation(node.typeAnnotation)
        : undefined,
      modifiers: node.static ? ['static'] : [],
      defaultValue: node.value ? this.extractValue(node.value) : undefined,
      docComment: this.extractJSDocComment(content, loc?.start.line || 0),
    }
  }

  private extractPropertySignature(
    node: TSESTree.TSPropertySignature,
    content: string
  ): PropertyInfo {
    const loc = node.loc
    return {
      name: this.extractName(node.key),
      line: loc?.start.line || 0,
      column: loc?.start.column || 0,
      type: node.typeAnnotation
        ? this.extractTypeAnnotation(node.typeAnnotation)
        : undefined,
      optional: node.optional || false,
      docComment: this.extractJSDocComment(content, loc?.start.line || 0),
    }
  }

  private extractType(node: any, content: string): TypeInfo {
    const loc = node.loc
    return {
      name: node.id.name,
      line: loc?.start.line || 0,
      column: loc?.start.column || 0,
      type: 'type',
      definition: this.extractTypeAnnotation(node.typeAnnotation),
      docComment: this.extractJSDocComment(content, loc?.start.line || 0),
    }
  }

  private extractImport(node: any): ImportInfo {
    const source = (node.source.value as string) || ''
    const loc = node.loc
    const importInfo: ImportInfo = {
      source,
      line: loc?.start.line || 0,
      column: loc?.start.column || 0,
    }

    for (const specifier of node.specifiers) {
      if (specifier.type === 'ImportDefaultSpecifier') {
        importInfo.defaultImport = specifier.local.name
      } else if (specifier.type === 'ImportSpecifier') {
        if (!importInfo.namedImports) {
          importInfo.namedImports = []
        }
        importInfo.namedImports.push(specifier.imported.name)
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
        importInfo.namespaceImport = specifier.local.name
      }
    }

    return importInfo
  }

  private extractExport(node: any): ExportInfo {
    const loc = node.loc

    if (node.type === 'ExportDefaultDeclaration') {
      const decl = node.declaration
      return {
        name: this.extractName(decl),
        line: loc?.start.line || 0,
        column: loc?.start.column || 0,
        type: 'default',
      }
    } else if (node.type === 'ExportNamedDeclaration') {
      const namedExport = node
      if (namedExport.declaration) {
        return {
          name: this.extractName(namedExport.declaration),
          line: loc?.start.line || 0,
          column: loc?.start.column || 0,
          type: 'named',
        }
      }
    }

    return {
      name: 'Unknown',
      line: loc?.start.line || 0,
      column: loc?.start.column || 0,
      type: 'named',
    }
  }

  private extractName(node: any): string {
    if (node.type === 'Identifier') {
      return node.name
    }
    return 'Unknown'
  }

  private extractTypeAnnotation(node: any): string {
    // 简化实现，返回类型字符串
    return node.typeAnnotation ? 'any' : 'any'
  }

  private extractValue(node: any): string {
    // 简化实现，返回值的字符串表示
    return '...'
  }

  private resolveImportPath(filePath: string, importPath: string): string {
    if (importPath.startsWith('/')) {
      return importPath
    }
    const dir = path.dirname(filePath)
    return path.resolve(dir, importPath)
  }
}

