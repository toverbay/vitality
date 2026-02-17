import { describe, it, expect } from "vitest"
import { tokenize } from "../formula/tokenizer"
import { parse } from "../formula/parser"
import { evaluate } from "../formula/evaluator"
import { evaluateFormula, extractDependencies, parseFormula, FormulaError } from "../formula"

describe("tokenizer", () => {
  it("tokenizes numbers", () => {
    const tokens = tokenize("42")
    expect(tokens).toEqual([{ type: "number", value: "42", position: 0 }])
  })

  it("tokenizes decimal numbers", () => {
    const tokens = tokenize("3.14")
    expect(tokens).toEqual([{ type: "number", value: "3.14", position: 0 }])
  })

  it("tokenizes field references", () => {
    const tokens = tokenize("{abilities.strength.score}")
    expect(tokens).toEqual([{ type: "fieldRef", value: "abilities.strength.score", position: 0 }])
  })

  it("tokenizes operators", () => {
    const tokens = tokenize("1 + 2 * 3")
    expect(tokens).toHaveLength(5)
    expect(tokens[1]).toEqual({ type: "operator", value: "+", position: 2 })
    expect(tokens[3]).toEqual({ type: "operator", value: "*", position: 6 })
  })

  it("tokenizes function calls", () => {
    const tokens = tokenize("floor(3.7)")
    expect(tokens[0]).toEqual({ type: "function", value: "floor", position: 0 })
    expect(tokens[1]).toEqual({ type: "lparen", value: "(", position: 5 })
  })

  it("tokenizes commas", () => {
    const tokens = tokenize("min(1, 2)")
    expect(tokens[3]).toEqual({ type: "comma", value: ",", position: 5 })
  })

  it("throws on unterminated field reference", () => {
    expect(() => tokenize("{foo.bar")).toThrow(FormulaError)
  })

  it("throws on empty field reference", () => {
    expect(() => tokenize("{}")).toThrow(FormulaError)
  })

  it("throws on unknown identifier", () => {
    expect(() => tokenize("unknown")).toThrow(FormulaError)
  })

  it("throws on unexpected character", () => {
    expect(() => tokenize("@")).toThrow(FormulaError)
  })
})

describe("parser", () => {
  it("parses a number literal", () => {
    const ast = parse(tokenize("42"))
    expect(ast).toEqual({ kind: "number", value: 42 })
  })

  it("parses a field reference", () => {
    const ast = parse(tokenize("{str.score}"))
    expect(ast).toEqual({ kind: "fieldRef", path: "str.score" })
  })

  it("parses addition", () => {
    const ast = parse(tokenize("1 + 2"))
    expect(ast).toEqual({
      kind: "binary",
      operator: "+",
      left: { kind: "number", value: 1 },
      right: { kind: "number", value: 2 },
    })
  })

  it("respects operator precedence: * before +", () => {
    const ast = parse(tokenize("1 + 2 * 3"))
    expect(ast).toEqual({
      kind: "binary",
      operator: "+",
      left: { kind: "number", value: 1 },
      right: {
        kind: "binary",
        operator: "*",
        left: { kind: "number", value: 2 },
        right: { kind: "number", value: 3 },
      },
    })
  })

  it("parses parenthesized expressions", () => {
    const ast = parse(tokenize("(1 + 2) * 3"))
    expect(ast.kind).toBe("binary")
  })

  it("parses unary minus", () => {
    const ast = parse(tokenize("-5"))
    expect(ast).toEqual({
      kind: "unary",
      operator: "-",
      operand: { kind: "number", value: 5 },
    })
  })

  it("parses function call with args", () => {
    const ast = parse(tokenize("max(1, 2)"))
    expect(ast).toEqual({
      kind: "function",
      name: "max",
      args: [
        { kind: "number", value: 1 },
        { kind: "number", value: 2 },
      ],
    })
  })

  it("throws on unexpected end of input", () => {
    expect(() => parse(tokenize("1 +"))).toThrow(FormulaError)
  })

  it("throws on extra tokens", () => {
    expect(() => parse(tokenize("1 2"))).toThrow(FormulaError)
  })
})

describe("evaluator", () => {
  const noFields = () => 0

  it("evaluates number literals", () => {
    const ast = parseFormula("42")
    expect(evaluate(ast, noFields)).toBe(42)
  })

  it("evaluates arithmetic", () => {
    expect(evaluateFormula("2 + 3 * 4", noFields)).toBe(14)
    expect(evaluateFormula("(2 + 3) * 4", noFields)).toBe(20)
    expect(evaluateFormula("10 - 3", noFields)).toBe(7)
    expect(evaluateFormula("10 / 4", noFields)).toBe(2.5)
  })

  it("handles division by zero", () => {
    expect(evaluateFormula("10 / 0", noFields)).toBe(0)
  })

  it("evaluates unary minus", () => {
    expect(evaluateFormula("-5", noFields)).toBe(-5)
    expect(evaluateFormula("--5", noFields)).toBe(5)
  })

  it("resolves field references", () => {
    const resolve = (path: string) => {
      if (path === "abilities.strength.score") return 18
      return 0
    }
    expect(evaluateFormula("{abilities.strength.score} - 10", resolve)).toBe(8)
  })

  it("evaluates built-in functions", () => {
    expect(evaluateFormula("floor(3.7)", noFields)).toBe(3)
    expect(evaluateFormula("ceil(3.2)", noFields)).toBe(4)
    expect(evaluateFormula("round(3.5)", noFields)).toBe(4)
    expect(evaluateFormula("min(3, 1, 2)", noFields)).toBe(1)
    expect(evaluateFormula("max(3, 1, 2)", noFields)).toBe(3)
    expect(evaluateFormula("abs(-7)", noFields)).toBe(7)
  })

  it("evaluates nested functions", () => {
    expect(evaluateFormula("floor(({abilities.strength.score} - 10) / 2)", (path) => {
      if (path === "abilities.strength.score") return 15
      return 0
    })).toBe(2)
  })
})

describe("extractDependencies", () => {
  it("extracts field references from a formula", () => {
    const deps = extractDependencies("{abilities.str.score} + {abilities.dex.score}")
    expect(deps).toEqual(["abilities.str.score", "abilities.dex.score"])
  })

  it("extracts deps from nested expressions", () => {
    const deps = extractDependencies("floor(({abilities.str.score} - 10) / 2)")
    expect(deps).toEqual(["abilities.str.score"])
  })

  it("returns empty for constant formulas", () => {
    expect(extractDependencies("42 + 8")).toEqual([])
  })
})
