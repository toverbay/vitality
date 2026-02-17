import type { EntityTemplate } from "./template"

export interface SharedOption {
  label: string
  value: string
}

export interface SystemDefinition {
  id: string
  name: string
  version: string
  sharedOptions?: Record<string, SharedOption[]>
  templates: EntityTemplate[]
}
