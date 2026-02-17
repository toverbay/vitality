// Field definition types — discriminated union on `type`

export interface NumberFieldDef {
  type: "number"
  key: string
  label: string
  min?: number
  max?: number
  default?: number
}

export interface TextFieldDef {
  type: "text"
  key: string
  label: string
  multiline?: boolean
  default?: string
}

export interface BooleanFieldDef {
  type: "boolean"
  key: string
  label: string
  default?: boolean
}

export interface SelectFieldDef {
  type: "select"
  key: string
  label: string
  options?: Array<{ label: string; value: string }>
  optionsRef?: string
  default?: string
}

export interface ResourceFieldDef {
  type: "resource"
  key: string
  label: string
  min?: number
  max?: number | string // can be a formula reference e.g. "{abilities.constitution.score}"
  default?: number
}

export interface ListFieldDef {
  type: "list"
  key: string
  label: string
  itemFields: FieldDef[]
}

export interface GroupFieldDef {
  type: "group"
  key: string
  label: string
  fields: FieldDef[]
}

export interface ComputedFieldDef {
  type: "computed"
  key: string
  label: string
  formula: string
}

export type FieldDef =
  | NumberFieldDef
  | TextFieldDef
  | BooleanFieldDef
  | SelectFieldDef
  | ResourceFieldDef
  | ListFieldDef
  | GroupFieldDef
  | ComputedFieldDef
