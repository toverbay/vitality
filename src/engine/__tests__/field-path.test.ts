import { describe, it, expect } from "vitest"
import { resolveFieldPath, createFieldResolver } from "../util/field-path"
import type { EntityData } from "../types"

const testData: EntityData = {
  abilities: {
    strength: {
      score: 18,
      modifier: null,
    } as unknown as number, // group stored as nested object
  },
  combat: {
    hp: { current: 45, max: 50 },
    initiative: 3,
  },
  info: {
    name: "Tordek",
    isNpc: false,
  },
}

describe("resolveFieldPath", () => {
  it("resolves top-level section fields", () => {
    expect(resolveFieldPath(testData, "combat.initiative")).toBe(3)
  })

  it("resolves nested group fields", () => {
    const data: EntityData = {
      abilities: {
        strength: {
          score: 18,
        } as unknown as number,
      },
    }
    expect(resolveFieldPath(data, "abilities.strength.score")).toBe(18)
  })

  it("returns undefined for missing paths", () => {
    expect(resolveFieldPath(testData, "abilities.charisma")).toBeUndefined()
    expect(resolveFieldPath(testData, "nonexistent.path")).toBeUndefined()
  })

  it("resolves resource values", () => {
    expect(resolveFieldPath(testData, "combat.hp")).toEqual({ current: 45, max: 50 })
  })
})

describe("createFieldResolver", () => {
  it("resolves numbers directly", () => {
    const resolve = createFieldResolver(testData)
    expect(resolve("combat.initiative")).toBe(3)
  })

  it("resolves resource to current value", () => {
    const resolve = createFieldResolver(testData)
    expect(resolve("combat.hp")).toBe(45)
  })

  it("resolves booleans as 0/1", () => {
    const resolve = createFieldResolver(testData)
    expect(resolve("info.isNpc")).toBe(0)
  })

  it("returns 0 for missing paths", () => {
    const resolve = createFieldResolver(testData)
    expect(resolve("nonexistent.field")).toBe(0)
  })

  it("returns 0 for null values", () => {
    const data: EntityData = {
      section: { computed: null },
    }
    const resolve = createFieldResolver(data)
    expect(resolve("section.computed")).toBe(0)
  })
})
