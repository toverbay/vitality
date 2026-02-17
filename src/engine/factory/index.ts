import type { EntityTemplate, EntityInstance, EntityData, FieldValue, ListItemData } from "../types"
import type { FieldDef } from "../types"

export function createEntityInstance(
  template: EntityTemplate,
  systemId: string,
  name: string,
): EntityInstance {
  const now = Date.now()
  const data: EntityData = {}

  for (const section of template.sections) {
    const sectionData: Record<string, FieldValue> = {}
    for (const field of section.fields) {
      sectionData[field.key] = createDefaultFieldValue(field)
    }
    data[section.key] = sectionData
  }

  return {
    id: generateId(),
    templateId: template.id,
    systemId,
    name,
    data,
    createdAt: now,
    updatedAt: now,
  }
}

export function createDefaultFieldValue(fieldDef: FieldDef): FieldValue {
  switch (fieldDef.type) {
    case "number":
      return fieldDef.default ?? 0
    case "text":
      return fieldDef.default ?? ""
    case "boolean":
      return fieldDef.default ?? false
    case "select":
      return fieldDef.default ?? ""
    case "resource":
      return { current: fieldDef.default ?? 0, max: fieldDef.default ?? 0 }
    case "list":
      return []
    case "group": {
      const groupData: Record<string, FieldValue> = {}
      for (const child of fieldDef.fields) {
        groupData[child.key] = createDefaultFieldValue(child)
      }
      return groupData as unknown as FieldValue
    }
    case "computed":
      return null
  }
}

export function createListItem(itemFields: FieldDef[]): ListItemData {
  const item: ListItemData = { id: generateId() }
  for (const field of itemFields) {
    item[field.key] = createDefaultFieldValue(field)
  }
  return item
}

function generateId(): string {
  return crypto.randomUUID()
}
