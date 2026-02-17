import { ref, computed } from "vue"
import { defineStore } from "pinia"
import type {
  SystemDefinition,
  EntityTemplate,
  Section,
  FieldDef,
  SharedOption,
} from "../engine"
import { validateSystem } from "../engine"

function uuid(): string {
  return crypto.randomUUID()
}

function emptySystem(): SystemDefinition {
  return {
    id: uuid(),
    name: "",
    version: "1.0.0",
    dice: undefined,
    sharedOptions: {},
    templates: [],
  }
}

export const useSystemStore = defineStore("system", () => {
  const system = ref<SystemDefinition>(emptySystem())
  const activeTemplateId = ref<string | null>(null)

  // --- Computed ---

  const validation = computed(() => validateSystem(system.value))

  const sharedOptionKeys = computed(() =>
    Object.keys(system.value.sharedOptions ?? {}),
  )

  const activeTemplate = computed(() =>
    system.value.templates.find(t => t.id === activeTemplateId.value) ?? null,
  )

  // --- System Info ---

  function updateSystemInfo(patch: { id?: string; name?: string; version?: string }) {
    if (patch.id !== undefined) system.value.id = patch.id
    if (patch.name !== undefined) system.value.name = patch.name
    if (patch.version !== undefined) system.value.version = patch.version
  }

  function updateDice(dice: { defaultDie: string; modifier?: string } | undefined) {
    system.value.dice = dice
  }

  // --- Shared Options ---

  function addSharedOptionList(key: string) {
    if (!system.value.sharedOptions) system.value.sharedOptions = {}
    if (!(key in system.value.sharedOptions)) {
      system.value.sharedOptions[key] = []
    }
  }

  function removeSharedOptionList(key: string) {
    if (system.value.sharedOptions) {
      delete system.value.sharedOptions[key]
    }
  }

  function renameSharedOptionList(oldKey: string, newKey: string) {
    if (!system.value.sharedOptions || oldKey === newKey) return
    const opts = system.value.sharedOptions[oldKey]
    if (!opts) return
    delete system.value.sharedOptions[oldKey]
    system.value.sharedOptions[newKey] = opts
  }

  function addSharedOption(listKey: string, option: SharedOption) {
    const list = system.value.sharedOptions?.[listKey]
    if (list) list.push(option)
  }

  function removeSharedOption(listKey: string, index: number) {
    const list = system.value.sharedOptions?.[listKey]
    if (list) list.splice(index, 1)
  }

  function updateSharedOption(listKey: string, index: number, option: SharedOption) {
    const list = system.value.sharedOptions?.[listKey]
    if (list && list[index]) {
      list[index] = option
    }
  }

  // --- Templates ---

  function addTemplate() {
    const tmpl: EntityTemplate = {
      id: uuid(),
      name: "",
      type: "",
      sections: [],
    }
    system.value.templates.push(tmpl)
    activeTemplateId.value = tmpl.id
    return tmpl
  }

  function removeTemplate(id: string) {
    const idx = system.value.templates.findIndex(t => t.id === id)
    if (idx !== -1) {
      system.value.templates.splice(idx, 1)
      if (activeTemplateId.value === id) {
        activeTemplateId.value = system.value.templates[0]?.id ?? null
      }
    }
  }

  function updateTemplate(id: string, patch: { id?: string; name?: string; type?: string }) {
    const tmpl = system.value.templates.find(t => t.id === id)
    if (!tmpl) return
    if (patch.id !== undefined) {
      if (activeTemplateId.value === tmpl.id) activeTemplateId.value = patch.id
      tmpl.id = patch.id
    }
    if (patch.name !== undefined) tmpl.name = patch.name
    if (patch.type !== undefined) tmpl.type = patch.type
  }

  // --- Sections ---

  function addSection(templateId: string) {
    const tmpl = system.value.templates.find(t => t.id === templateId)
    if (!tmpl) return
    const section: Section = { key: "", label: "", fields: [] }
    tmpl.sections.push(section)
    return section
  }

  function removeSection(templateId: string, sectionIndex: number) {
    const tmpl = system.value.templates.find(t => t.id === templateId)
    if (tmpl) tmpl.sections.splice(sectionIndex, 1)
  }

  function updateSection(templateId: string, sectionIndex: number, patch: { key?: string; label?: string }) {
    const tmpl = system.value.templates.find(t => t.id === templateId)
    const section = tmpl?.sections[sectionIndex]
    if (!section) return
    if (patch.key !== undefined) section.key = patch.key
    if (patch.label !== undefined) section.label = patch.label
  }

  // --- Fields ---

  function addField(fields: FieldDef[], type: FieldDef["type"] = "text") {
    const base = { key: "", label: "" }
    let field: FieldDef
    switch (type) {
      case "number": field = { ...base, type: "number" }; break
      case "text": field = { ...base, type: "text" }; break
      case "boolean": field = { ...base, type: "boolean" }; break
      case "select": field = { ...base, type: "select", options: [] }; break
      case "resource": field = { ...base, type: "resource" }; break
      case "list": field = { ...base, type: "list", itemFields: [] }; break
      case "group": field = { ...base, type: "group", fields: [] }; break
      case "computed": field = { ...base, type: "computed", formula: "" }; break
    }
    fields.push(field)
    return field
  }

  function removeField(fields: FieldDef[], index: number) {
    fields.splice(index, 1)
  }

  function updateField(fields: FieldDef[], index: number, patch: Record<string, unknown>) {
    const field = fields[index]
    if (!field) return
    Object.assign(field, patch)
  }

  function changeFieldType(fields: FieldDef[], index: number, newType: FieldDef["type"]) {
    const old = fields[index]
    if (!old || old.type === newType) return
    const base = { key: old.key, label: old.label }
    let field: FieldDef
    switch (newType) {
      case "number": field = { ...base, type: "number" }; break
      case "text": field = { ...base, type: "text" }; break
      case "boolean": field = { ...base, type: "boolean" }; break
      case "select": field = { ...base, type: "select", options: [] }; break
      case "resource": field = { ...base, type: "resource" }; break
      case "list": field = { ...base, type: "list", itemFields: [] }; break
      case "group": field = { ...base, type: "group", fields: [] }; break
      case "computed": field = { ...base, type: "computed", formula: "" }; break
    }
    fields[index] = field
  }

  // --- Export / Import ---

  function exportAsJson(): string {
    const clone = JSON.parse(JSON.stringify(system.value)) as Record<string, unknown>
    // Remove empty sharedOptions
    if (clone.sharedOptions && Object.keys(clone.sharedOptions as object).length === 0) {
      delete clone.sharedOptions
    }
    // Remove undefined dice
    if (!clone.dice) delete clone.dice
    return JSON.stringify(clone, null, 2)
  }

  function loadFromJson(json: string) {
    const parsed = JSON.parse(json) as SystemDefinition
    system.value = parsed
    activeTemplateId.value = parsed.templates[0]?.id ?? null
  }

  function reset() {
    system.value = emptySystem()
    activeTemplateId.value = null
  }

  return {
    system,
    activeTemplateId,
    validation,
    sharedOptionKeys,
    activeTemplate,
    updateSystemInfo,
    updateDice,
    addSharedOptionList,
    removeSharedOptionList,
    renameSharedOptionList,
    addSharedOption,
    removeSharedOption,
    updateSharedOption,
    addTemplate,
    removeTemplate,
    updateTemplate,
    addSection,
    removeSection,
    updateSection,
    addField,
    removeField,
    updateField,
    changeFieldType,
    exportAsJson,
    loadFromJson,
    reset,
  }
})
