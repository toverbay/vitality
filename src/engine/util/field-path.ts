import type { EntityData, FieldValue, ResourceValue } from "../types"
import type { FieldResolver } from "../formula"

export function resolveFieldPath(data: EntityData, path: string): FieldValue | undefined {
  const parts = path.split(".")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = data

  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      return undefined
    }
    current = current[part]
  }

  return current as FieldValue | undefined
}

export function createFieldResolver(data: EntityData): FieldResolver {
  return (path: string): number => {
    const value = resolveFieldPath(data, path)

    if (value == null) return 0
    if (typeof value === "number") return value
    if (typeof value === "boolean") return value ? 1 : 0
    if (typeof value === "string") {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }

    // ResourceValue — resolve to current
    if (isResourceValue(value)) {
      return value.current
    }

    return 0
  }
}

function isResourceValue(value: unknown): value is ResourceValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "current" in value &&
    typeof (value as ResourceValue).current === "number"
  )
}
