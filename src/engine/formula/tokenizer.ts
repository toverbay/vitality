import type { Token } from "./types"
import { FormulaError } from "./error"

const FUNCTIONS = new Set(["floor", "ceil", "round", "min", "max", "abs"])
const OPERATORS = new Set(["+", "-", "*", "/"])

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  function ch(): string {
    return input.charAt(i)
  }

  function chAt(offset: number): string {
    return input.charAt(offset)
  }

  while (i < input.length) {
    const c = ch()

    // Skip whitespace
    if (c === " " || c === "\t") {
      i++
      continue
    }

    // Number literal (integer or decimal)
    if (isDigit(c) || (c === "." && i + 1 < input.length && isDigit(chAt(i + 1)))) {
      const start = i
      while (i < input.length && isDigit(ch())) i++
      if (i < input.length && ch() === ".") {
        i++
        while (i < input.length && isDigit(ch())) i++
      }
      tokens.push({ type: "number", value: input.slice(start, i), position: start })
      continue
    }

    // Field reference: {path.to.field}
    if (c === "{") {
      const start = i
      i++ // skip opening brace
      const refStart = i
      while (i < input.length && ch() !== "}") i++
      if (i >= input.length) {
        throw new FormulaError("Unterminated field reference", start)
      }
      const path = input.slice(refStart, i).trim()
      if (path.length === 0) {
        throw new FormulaError("Empty field reference", start)
      }
      i++ // skip closing brace
      tokens.push({ type: "fieldRef", value: path, position: start })
      continue
    }

    // Operator
    if (OPERATORS.has(c)) {
      tokens.push({ type: "operator", value: c, position: i })
      i++
      continue
    }

    // Parentheses
    if (c === "(") {
      tokens.push({ type: "lparen", value: "(", position: i })
      i++
      continue
    }
    if (c === ")") {
      tokens.push({ type: "rparen", value: ")", position: i })
      i++
      continue
    }

    // Comma
    if (c === ",") {
      tokens.push({ type: "comma", value: ",", position: i })
      i++
      continue
    }

    // Identifier (function name)
    if (isAlpha(c)) {
      const start = i
      while (i < input.length && isAlphaNumeric(ch())) i++
      const name = input.slice(start, i)
      if (FUNCTIONS.has(name)) {
        tokens.push({ type: "function", value: name, position: start })
      } else {
        throw new FormulaError(`Unknown identifier "${name}"`, start)
      }
      continue
    }

    throw new FormulaError(`Unexpected character "${c}"`, i)
  }

  return tokens
}

function isDigit(c: string): boolean {
  return c >= "0" && c <= "9"
}

function isAlpha(c: string): boolean {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_"
}

function isAlphaNumeric(c: string): boolean {
  return isAlpha(c) || isDigit(c)
}
