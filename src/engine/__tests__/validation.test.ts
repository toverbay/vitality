import { describe, it, expect } from "vitest"
import { validateSystem, validateTemplate, validateEntityData } from "../factory/validation"
import type { SystemDefinition, EntityTemplate } from "../types"

const validTemplate: EntityTemplate = {
  id: "char",
  name: "Character",
  type: "character",
  sections: [
    {
      key: "abilities",
      label: "Ability Scores",
      fields: [
        { type: "number", key: "strength", label: "STR", default: 10 },
        { type: "computed", key: "strMod", label: "STR Mod", formula: "floor(({abilities.strength} - 10) / 2)" },
      ],
    },
  ],
}

const validSystem: SystemDefinition = {
  id: "dnd5e",
  name: "D&D 5th Edition",
  version: "1.0.0",
  sharedOptions: {
    alignments: [
      { label: "Lawful Good", value: "lg" },
      { label: "Chaotic Evil", value: "ce" },
    ],
  },
  templates: [validTemplate],
}

describe("validateTemplate", () => {
  it("accepts a valid template", () => {
    const result = validateTemplate(validTemplate)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("rejects non-object", () => {
    const result = validateTemplate("not an object")
    expect(result.valid).toBe(false)
  })

  it("rejects missing id", () => {
    const result = validateTemplate({ ...validTemplate, id: "" })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.path.includes("id"))).toBe(true)
  })

  it("rejects duplicate section keys", () => {
    const tmpl = {
      ...validTemplate,
      sections: [
        { key: "abilities", label: "A", fields: [] },
        { key: "abilities", label: "B", fields: [] },
      ],
    }
    const result = validateTemplate(tmpl)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes("Duplicate section key"))).toBe(true)
  })

  it("rejects duplicate field keys in a section", () => {
    const tmpl = {
      ...validTemplate,
      sections: [
        {
          key: "sec",
          label: "Section",
          fields: [
            { type: "number", key: "dup", label: "A" },
            { type: "number", key: "dup", label: "B" },
          ],
        },
      ],
    }
    const result = validateTemplate(tmpl)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes("Duplicate field key"))).toBe(true)
  })
})

describe("validateSystem", () => {
  it("accepts a valid system", () => {
    const result = validateSystem(validSystem)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("rejects non-object", () => {
    const result = validateSystem(null)
    expect(result.valid).toBe(false)
  })

  it("rejects missing templates", () => {
    const result = validateSystem({ ...validSystem, templates: "bad" })
    expect(result.valid).toBe(false)
  })

  it("detects duplicate template ids", () => {
    const result = validateSystem({
      ...validSystem,
      templates: [validTemplate, validTemplate],
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes("Duplicate template id"))).toBe(true)
  })

  it("detects invalid optionsRef", () => {
    const system = {
      ...validSystem,
      templates: [{
        ...validTemplate,
        sections: [{
          key: "info",
          label: "Info",
          fields: [{ type: "select", key: "align", label: "Alignment", optionsRef: "nonexistent" }],
        }],
      }],
    }
    const result = validateSystem(system)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes("Unknown sharedOptions reference"))).toBe(true)
  })

  it("detects invalid formulas", () => {
    const system = {
      ...validSystem,
      templates: [{
        ...validTemplate,
        sections: [{
          key: "sec",
          label: "Section",
          fields: [{ type: "computed", key: "bad", label: "Bad", formula: "{unclosed" }],
        }],
      }],
    }
    const result = validateSystem(system)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes("Invalid formula"))).toBe(true)
  })

  it("detects circular computed dependencies", () => {
    const system = {
      ...validSystem,
      templates: [{
        ...validTemplate,
        sections: [{
          key: "sec",
          label: "Section",
          fields: [
            { type: "computed", key: "a", label: "A", formula: "{sec.b}" },
            { type: "computed", key: "b", label: "B", formula: "{sec.a}" },
          ],
        }],
      }],
    }
    const result = validateSystem(system)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes("Circular dependency"))).toBe(true)
  })
})

describe("validateEntityData", () => {
  it("accepts valid data matching template", () => {
    const data = {
      abilities: {
        strength: 14,
        strMod: null,
      },
    }
    const result = validateEntityData(data, validTemplate)
    expect(result.valid).toBe(true)
  })

  it("rejects missing section", () => {
    const result = validateEntityData({}, validTemplate)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes("Missing section"))).toBe(true)
  })

  it("rejects wrong field types", () => {
    const data = {
      abilities: {
        strength: "not a number",
        strMod: null,
      },
    }
    const result = validateEntityData(data, validTemplate)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message === "Expected number")).toBe(true)
  })

  it("rejects non-null computed field", () => {
    const data = {
      abilities: {
        strength: 10,
        strMod: 5,
      },
    }
    const result = validateEntityData(data, validTemplate)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes("Computed fields must be null"))).toBe(true)
  })
})
