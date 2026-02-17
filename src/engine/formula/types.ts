export type TokenType =
  | "number"
  | "fieldRef"
  | "operator"
  | "lparen"
  | "rparen"
  | "comma"
  | "function"

export interface Token {
  type: TokenType
  value: string
  position: number
}

export type ASTNode =
  | NumberLiteral
  | FieldRef
  | BinaryOp
  | UnaryOp
  | FunctionCall

export interface NumberLiteral {
  kind: "number"
  value: number
}

export interface FieldRef {
  kind: "fieldRef"
  path: string
}

export interface BinaryOp {
  kind: "binary"
  operator: string
  left: ASTNode
  right: ASTNode
}

export interface UnaryOp {
  kind: "unary"
  operator: string
  operand: ASTNode
}

export interface FunctionCall {
  kind: "function"
  name: string
  args: ASTNode[]
}

export type FieldResolver = (path: string) => number
