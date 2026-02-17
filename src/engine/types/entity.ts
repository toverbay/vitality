export interface ResourceValue {
  current: number
  max: number
}

export type FieldValue =
  | number
  | string
  | boolean
  | null
  | ResourceValue
  | ListItemData[]

export interface ListItemData {
  id: string
  [fieldKey: string]: FieldValue
}

export type SectionData = Record<string, FieldValue>

export type EntityData = Record<string, SectionData>

export interface EntityInstance {
  id: string
  templateId: string
  systemId: string
  name: string
  data: EntityData
  createdAt: number
  updatedAt: number
}
