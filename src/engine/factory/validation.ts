import type { EntityTemplate, FieldDef } from "../types"
import { extractDependencies } from "../formula"

export interface ValidationError {
  path: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export function validateSystem(system: unknown): ValidationResult {
  const errors: ValidationError[] = []

  if (!isObject(system)) {
    return { valid: false, errors: [{ path: "", message: "System must be an object" }] }
  }

  const s = system as Record<string, unknown>
  requireString(s, "id", "", errors)
  requireString(s, "name", "", errors)
  requireString(s, "version", "", errors)

  if (!Array.isArray(s.templates)) {
    errors.push({ path: "templates", message: "templates must be an array" })
    return { valid: false, errors }
  }

  const templateIds = new Set<string>()
  for (let i = 0; i < s.templates.length; i++) {
    const tResult = validateTemplate(s.templates[i] as unknown, `templates[${i}]`)
    errors.push(...tResult.errors)

    const t = s.templates[i] as Record<string, unknown>
    if (typeof t.id === "string") {
      if (templateIds.has(t.id)) {
        errors.push({ path: `templates[${i}].id`, message: `Duplicate template id "${t.id}"` })
      }
      templateIds.add(t.id)
    }
  }

  // Validate sharedOptions references
  const sharedKeys = new Set<string>()
  if (s.sharedOptions && isObject(s.sharedOptions)) {
    for (const key of Object.keys(s.sharedOptions)) {
      sharedKeys.add(key)
    }
  }

  // Only proceed with typed access if templates validated
  for (let ti = 0; ti < s.templates.length; ti++) {
    const tmpl = s.templates[ti] as Record<string, unknown>
    if (!Array.isArray(tmpl.sections)) continue
    for (let si = 0; si < tmpl.sections.length; si++) {
      const section = tmpl.sections[si] as Record<string, unknown>
      if (Array.isArray(section.fields)) {
        validateOptionsRefs(section.fields as FieldDef[], sharedKeys, `templates[${ti}].sections[${si}]`, errors)
      }
    }
  }

  // Validate formulas parse and check for circular computed deps
  for (let ti = 0; ti < s.templates.length; ti++) {
    const tmpl = s.templates[ti] as Record<string, unknown>
    if (!Array.isArray(tmpl.sections)) continue
    validateFormulas(tmpl as unknown as EntityTemplate, `templates[${ti}]`, errors)
  }

  return { valid: errors.length === 0, errors }
}

function validateTemplateInner(template: unknown, basePath: string): ValidationResult {
  const errors: ValidationError[] = []

  if (!isObject(template)) {
    return { valid: false, errors: [{ path: basePath, message: "Template must be an object" }] }
  }

  const t = template as Record<string, unknown>
  requireString(t, "id", basePath, errors)
  requireString(t, "name", basePath, errors)
  requireString(t, "type", basePath, errors)

  if (!Array.isArray(t.sections)) {
    errors.push({ path: `${basePath}.sections`, message: "sections must be an array" })
    return { valid: false, errors }
  }

  const sectionKeys = new Set<string>()
  for (let i = 0; i < t.sections.length; i++) {
    const section = t.sections[i] as unknown
    const sPath = `${basePath}.sections[${i}]`

    if (!isObject(section)) {
      errors.push({ path: sPath, message: "Section must be an object" })
      continue
    }

    const sec = section as Record<string, unknown>
    requireString(sec, "key", sPath, errors)
    requireString(sec, "label", sPath, errors)

    if (typeof sec.key === "string") {
      if (sectionKeys.has(sec.key)) {
        errors.push({ path: `${sPath}.key`, message: `Duplicate section key "${sec.key}"` })
      }
      sectionKeys.add(sec.key)
    }

    if (!Array.isArray(sec.fields)) {
      errors.push({ path: `${sPath}.fields`, message: "fields must be an array" })
      continue
    }

    const fieldKeys = new Set<string>()
    validateFields(sec.fields as FieldDef[], fieldKeys, sPath, errors)
  }

  return { valid: errors.length === 0, errors }
}

export function validateTemplate(template: unknown, basePath = ""): ValidationResult {
  return validateTemplateInner(template, basePath)
}

export function validateEntityData(data: unknown, template: EntityTemplate): ValidationResult {
  const errors: ValidationError[] = []

  if (!isObject(data)) {
    return { valid: false, errors: [{ path: "", message: "Entity data must be an object" }] }
  }

  const d = data as Record<string, unknown>

  for (const section of template.sections) {
    if (!(section.key in d)) {
      errors.push({ path: section.key, message: `Missing section "${section.key}"` })
      continue
    }

    const sectionData = d[section.key]
    if (!isObject(sectionData)) {
      errors.push({ path: section.key, message: `Section "${section.key}" must be an object` })
      continue
    }

    validateFieldData(sectionData as Record<string, unknown>, section.fields, section.key, errors)
  }

  return { valid: errors.length === 0, errors }
}

function validateFields(fields: FieldDef[], keys: Set<string>, basePath: string, errors: ValidationError[]): void {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]!
    const fPath = `${basePath}.fields[${i}]`

    if (!isObject(field) || typeof field.key !== "string" || typeof field.type !== "string") {
      errors.push({ path: fPath, message: "Field must have key and type" })
      continue
    }

    if (keys.has(field.key)) {
      errors.push({ path: `${fPath}.key`, message: `Duplicate field key "${field.key}"` })
    }
    keys.add(field.key)

    if (field.type === "group" && Array.isArray(field.fields)) {
      const groupKeys = new Set<string>()
      validateFields(field.fields, groupKeys, fPath, errors)
    }

    if (field.type === "list" && Array.isArray(field.itemFields)) {
      const listKeys = new Set<string>()
      validateFields(field.itemFields, listKeys, fPath, errors)
    }
  }
}

function validateOptionsRefs(fields: FieldDef[], sharedKeys: Set<string>, basePath: string, errors: ValidationError[]): void {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]!
    const fPath = `${basePath}.fields[${i}]`

    if (field.type === "select" && field.optionsRef && !sharedKeys.has(field.optionsRef)) {
      errors.push({ path: `${fPath}.optionsRef`, message: `Unknown sharedOptions reference "${field.optionsRef}"` })
    }

    if (field.type === "group") {
      validateOptionsRefs(field.fields, sharedKeys, fPath, errors)
    }

    if (field.type === "list") {
      validateOptionsRefs(field.itemFields, sharedKeys, fPath, errors)
    }
  }
}

function validateFormulas(template: EntityTemplate, basePath: string, errors: ValidationError[]): void {
  const computedFields = new Map<string, string[]>()

  for (const section of template.sections) {
    collectComputedFields(section.fields, `${section.key}`, computedFields, basePath, errors)
  }

  // Check for circular dependencies
  for (const [fieldPath] of computedFields) {
    const visited = new Set<string>()
    if (hasCycle(fieldPath, computedFields, visited)) {
      errors.push({ path: `${basePath}.${fieldPath}`, message: `Circular dependency detected for computed field "${fieldPath}"` })
    }
  }
}

function collectComputedFields(
  fields: FieldDef[],
  prefix: string,
  computed: Map<string, string[]>,
  basePath: string,
  errors: ValidationError[],
): void {
  for (const field of fields) {
    const fieldPath = `${prefix}.${field.key}`

    if (field.type === "computed") {
      try {
        const deps = extractDependencies(field.formula)
        computed.set(fieldPath, deps)
      } catch {
        errors.push({ path: `${basePath}.${fieldPath}.formula`, message: `Invalid formula: ${field.formula}` })
      }
    }

    if (field.type === "group") {
      collectComputedFields(field.fields, fieldPath, computed, basePath, errors)
    }
  }
}

function hasCycle(
  fieldPath: string,
  computed: Map<string, string[]>,
  visited: Set<string>,
): boolean {
  if (visited.has(fieldPath)) return true
  visited.add(fieldPath)

  const deps = computed.get(fieldPath)
  if (deps) {
    for (const dep of deps) {
      if (hasCycle(dep, computed, new Set(visited))) {
        return true
      }
    }
  }

  return false
}

function validateFieldData(
  data: Record<string, unknown>,
  fields: FieldDef[],
  basePath: string,
  errors: ValidationError[],
): void {
  for (const field of fields) {
    const fPath = `${basePath}.${field.key}`

    if (!(field.key in data)) {
      errors.push({ path: fPath, message: `Missing field "${field.key}"` })
      continue
    }

    const value = data[field.key]

    switch (field.type) {
      case "number":
        if (typeof value !== "number") {
          errors.push({ path: fPath, message: "Expected number" })
        }
        break
      case "text":
        if (typeof value !== "string") {
          errors.push({ path: fPath, message: "Expected string" })
        }
        break
      case "boolean":
        if (typeof value !== "boolean") {
          errors.push({ path: fPath, message: "Expected boolean" })
        }
        break
      case "select":
        if (typeof value !== "string") {
          errors.push({ path: fPath, message: "Expected string" })
        }
        break
      case "resource":
        if (!isObject(value) || typeof (value as Record<string, unknown>).current !== "number" || typeof (value as Record<string, unknown>).max !== "number") {
          errors.push({ path: fPath, message: "Expected resource object with current and max" })
        }
        break
      case "list":
        if (!Array.isArray(value)) {
          errors.push({ path: fPath, message: "Expected array" })
        }
        break
      case "computed":
        if (value !== null) {
          errors.push({ path: fPath, message: "Computed fields must be null" })
        }
        break
      case "group":
        if (!isObject(value)) {
          errors.push({ path: fPath, message: "Expected object" })
        } else {
          validateFieldData(value as Record<string, unknown>, field.fields, fPath, errors)
        }
        break
    }
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requireString(obj: Record<string, unknown>, key: string, basePath: string, errors: ValidationError[]): void {
  const path = basePath ? `${basePath}.${key}` : key
  if (typeof obj[key] !== "string" || obj[key] === "") {
    errors.push({ path, message: `${key} must be a non-empty string` })
  }
}
