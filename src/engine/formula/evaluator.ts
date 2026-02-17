import type { ASTNode, FieldResolver } from "./types"
import { FormulaError } from "./error"

const BUILTINS: Record<string, (...args: number[]) => number> = {
  floor: (n) => Math.floor(n),
  ceil: (n) => Math.ceil(n),
  round: (n) => Math.round(n),
  min: (...args) => Math.min(...args),
  max: (...args) => Math.max(...args),
  abs: (n) => Math.abs(n),
}

export function evaluate(node: ASTNode, resolve: FieldResolver): number {
  switch (node.kind) {
    case "number":
      return node.value

    case "fieldRef":
      return resolve(node.path)

    case "binary": {
      const left = evaluate(node.left, resolve)
      const right = evaluate(node.right, resolve)
      switch (node.operator) {
        case "+": return left + right
        case "-": return left - right
        case "*": return left * right
        case "/": return right === 0 ? 0 : left / right
        default: throw new FormulaError(`Unknown operator "${node.operator}"`, 0)
      }
    }

    case "unary": {
      const operand = evaluate(node.operand, resolve)
      switch (node.operator) {
        case "-": return -operand
        case "+": return operand
        default: throw new FormulaError(`Unknown unary operator "${node.operator}"`, 0)
      }
    }

    case "function": {
      const fn = BUILTINS[node.name]
      if (!fn) throw new FormulaError(`Unknown function "${node.name}"`, 0)
      const args = node.args.map(arg => evaluate(arg, resolve))
      return fn(...args)
    }
  }
}
