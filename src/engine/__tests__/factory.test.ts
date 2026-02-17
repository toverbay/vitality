import { describe, it, expect } from "vitest"
import { createEntityInstance, createDefaultFieldValue, createListItem } from "../factory"
import type { EntityTemplate, FieldDef } from "../types"

const testTemplate: EntityTemplate = {
  id: "char-5e",
  name: "Character",
  type: "character",
  sections: [
    {
      key: "abilities",
      label: "Ability Scores",
      fields: [
        { type: "number", key: "strength", label: "Strength", default: 10 },
        { type: "number", key: "dexterity", label: "Dexterity" },
      ],
    },
    {
      key: "info",
      label: "Info",
      fields: [
        { type: "text", key: "name", label: "Character Name" },
        { type: "boolean", key: "inspiration", label: "Inspiration" },
        { type: "select", key: "alignment", label: "Alignment", options: [{ label: "Good", value: "good" }] },
      ],
    },
    {
      key: "combat",
      label: "Combat",
      fields: [
        { type: "resource", key: "hp", label: "Hit Points", default: 10 },
        { type: "computed", key: "strMod", label: "STR Modifier", formula: "floor(({abilities.strength} - 10) / 2)" },
      ],
    },
    {
      key: "inventory",
      label: "Inventory",
      fields: [
        {
          type: "list",
          key: "items",
          label: "Items",
          itemFields: [
            { type: "text", key: "name", label: "Name" },
            { type: "number", key: "weight", label: "Weight" },
          ],
        },
      ],
    },
  ],
}

describe("createDefaultFieldValue", () => {
  it("returns default or 0 for number", () => {
    expect(createDefaultFieldValue({ type: "number", key: "str", label: "STR", default: 10 })).toBe(10)
    expect(createDefaultFieldValue({ type: "number", key: "str", label: "STR" })).toBe(0)
  })

  it("returns default or empty string for text", () => {
    expect(createDefaultFieldValue({ type: "text", key: "n", label: "N", default: "foo" })).toBe("foo")
    expect(createDefaultFieldValue({ type: "text", key: "n", label: "N" })).toBe("")
  })

  it("returns default or false for boolean", () => {
    expect(createDefaultFieldValue({ type: "boolean", key: "b", label: "B", default: true })).toBe(true)
    expect(createDefaultFieldValue({ type: "boolean", key: "b", label: "B" })).toBe(false)
  })

  it("returns default or empty string for select", () => {
    expect(createDefaultFieldValue({ type: "select", key: "s", label: "S" })).toBe("")
  })

  it("returns resource object for resource", () => {
    expect(createDefaultFieldValue({ type: "resource", key: "hp", label: "HP", default: 10 })).toEqual({ current: 10, max: 10 })
    expect(createDefaultFieldValue({ type: "resource", key: "hp", label: "HP" })).toEqual({ current: 0, max: 0 })
  })

  it("returns empty array for list", () => {
    const field: FieldDef = { type: "list", key: "items", label: "Items", itemFields: [] }
    expect(createDefaultFieldValue(field)).toEqual([])
  })

  it("returns null for computed", () => {
    expect(createDefaultFieldValue({ type: "computed", key: "c", label: "C", formula: "1+1" })).toBeNull()
  })

  it("returns nested defaults for group", () => {
    const field: FieldDef = {
      type: "group",
      key: "stats",
      label: "Stats",
      fields: [
        { type: "number", key: "score", label: "Score", default: 10 },
        { type: "computed", key: "mod", label: "Mod", formula: "1" },
      ],
    }
    expect(createDefaultFieldValue(field)).toEqual({ score: 10, mod: null })
  })
})

describe("createEntityInstance", () => {
  it("creates an instance with all sections and fields", () => {
    const instance = createEntityInstance(testTemplate, "dnd5e", "Tordek")

    expect(instance.templateId).toBe("char-5e")
    expect(instance.systemId).toBe("dnd5e")
    expect(instance.name).toBe("Tordek")
    expect(instance.id).toBeTruthy()
    expect(instance.createdAt).toBeGreaterThan(0)
    expect(instance.updatedAt).toBe(instance.createdAt)
  })

  it("populates section data with defaults", () => {
    const instance = createEntityInstance(testTemplate, "dnd5e", "Tordek")

    expect(instance.data["abilities"]!["strength"]).toBe(10)
    expect(instance.data["abilities"]!["dexterity"]).toBe(0)
    expect(instance.data["info"]!["name"]).toBe("")
    expect(instance.data["info"]!["inspiration"]).toBe(false)
    expect(instance.data["info"]!["alignment"]).toBe("")
    expect(instance.data["combat"]!["hp"]).toEqual({ current: 10, max: 10 })
    expect(instance.data["combat"]!["strMod"]).toBeNull()
    expect(instance.data["inventory"]!["items"]).toEqual([])
  })
})

describe("createListItem", () => {
  it("creates a list item with defaults and an id", () => {
    const itemFields: FieldDef[] = [
      { type: "text", key: "name", label: "Name" },
      { type: "number", key: "weight", label: "Weight" },
    ]
    const item = createListItem(itemFields)

    expect(item.id).toBeTruthy()
    expect(item.name).toBe("")
    expect(item.weight).toBe(0)
  })
})
