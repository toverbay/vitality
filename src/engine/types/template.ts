import type { FieldDef } from "./fields"

export interface Section {
  key: string
  label: string
  fields: FieldDef[]
}

export interface EntityTemplate {
  id: string
  name: string
  type: string
  sections: Section[]
}
