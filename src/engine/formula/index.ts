import { tokenize } from "./tokenizer"
import { parse } from "./parser"
import { evaluate } from "./evaluator"
import type { ASTNode, FieldResolver } from "./types"

export { FormulaError } from "./error"
export type { Token, ASTNode, FieldResolver } from "./types"

export function parseFormula(formula: string): ASTNode {
  const tokens = tokenize(formula)
  return parse(tokens)
}

export function evaluateFormula(formula: string, resolve: FieldResolver): number {
  const ast = parseFormula(formula)
  return evaluate(ast, resolve)
}

export function extractDependencies(formula: string): string[] {
  const ast = parseFormula(formula)
  const deps: string[] = []
  collectFieldRefs(ast, deps)
  return deps
}

function collectFieldRefs(node: ASTNode, deps: string[]): void {
  switch (node.kind) {
    case "fieldRef":
      deps.push(node.path)
      break
    case "binary":
      collectFieldRefs(node.left, deps)
      collectFieldRefs(node.right, deps)
      break
    case "unary":
      collectFieldRefs(node.operand, deps)
      break
    case "function":
      for (const arg of node.args) {
        collectFieldRefs(arg, deps)
      }
      break
  }
}
