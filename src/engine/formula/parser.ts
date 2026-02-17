import type { ASTNode, Token } from "./types"
import { FormulaError } from "./error"

export function parse(tokens: Token[]): ASTNode {
  let pos = 0

  function peek(): Token | undefined {
    return tokens[pos]
  }

  function consume(): Token {
    const token = tokens[pos]
    if (!token) {
      throw new FormulaError("Unexpected end of input", endPosition())
    }
    pos++
    return token
  }

  function endPosition(): number {
    const last = tokens[tokens.length - 1]
    return last ? last.position + 1 : 0
  }

  function expect(type: string): Token {
    const token = peek()
    if (!token || token.type !== type) {
      const position = token?.position ?? endPosition()
      throw new FormulaError(`Expected ${type}, got ${token ? token.type : "end of input"}`, position)
    }
    return consume()
  }

  // expression = additive
  function expression(): ASTNode {
    return additive()
  }

  // additive = multiplicative (('+' | '-') multiplicative)*
  function additive(): ASTNode {
    let left = multiplicative()
    let t = peek()
    while (t && t.type === "operator" && (t.value === "+" || t.value === "-")) {
      const op = consume()
      const right = multiplicative()
      left = { kind: "binary", operator: op.value, left, right }
      t = peek()
    }
    return left
  }

  // multiplicative = unary (('*' | '/') unary)*
  function multiplicative(): ASTNode {
    let left = unary()
    let t = peek()
    while (t && t.type === "operator" && (t.value === "*" || t.value === "/")) {
      const op = consume()
      const right = unary()
      left = { kind: "binary", operator: op.value, left, right }
      t = peek()
    }
    return left
  }

  // unary = ('-' | '+') unary | primary
  function unary(): ASTNode {
    const t = peek()
    if (t && t.type === "operator" && (t.value === "-" || t.value === "+")) {
      const op = consume()
      const operand = unary()
      return { kind: "unary", operator: op.value, operand }
    }
    return primary()
  }

  // primary = number | fieldRef | function '(' args ')' | '(' expression ')'
  function primary(): ASTNode {
    const token = peek()
    if (!token) {
      throw new FormulaError("Unexpected end of input", endPosition())
    }

    if (token.type === "number") {
      consume()
      return { kind: "number", value: parseFloat(token.value) }
    }

    if (token.type === "fieldRef") {
      consume()
      return { kind: "fieldRef", path: token.value }
    }

    if (token.type === "function") {
      const name = consume().value
      expect("lparen")
      const args: ASTNode[] = []
      if (peek()?.type !== "rparen") {
        args.push(expression())
        while (peek()?.type === "comma") {
          consume()
          args.push(expression())
        }
      }
      expect("rparen")
      return { kind: "function", name, args }
    }

    if (token.type === "lparen") {
      consume()
      const node = expression()
      expect("rparen")
      return node
    }

    throw new FormulaError(`Unexpected token "${token.value}"`, token.position)
  }

  const ast = expression()

  if (pos < tokens.length) {
    const remaining = tokens[pos]!
    throw new FormulaError(`Unexpected token "${remaining.value}"`, remaining.position)
  }

  return ast
}
