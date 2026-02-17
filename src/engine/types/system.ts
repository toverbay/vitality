import type { EntityTemplate } from "./template"

export interface DiceMechanics {
  defaultDie: string
  modifier?: string
}

export interface SharedOption {
  label: string
  value: string
}

export interface SystemDefinition {
  id: string
  name: string
  version: string
  dice?: DiceMechanics
  sharedOptions?: Record<string, SharedOption[]>
  templates: EntityTemplate[]
}
