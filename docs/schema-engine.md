# Schema Engine API Reference

The schema engine (`src/engine/`) provides the type system, formula evaluation, entity creation, and validation layer for Vitality's TTRPG system definitions. Import everything from the barrel:

```ts
import {
  // Types
  type FieldDef, type EntityTemplate, type EntityInstance,
  type SystemDefinition, type EntityData,
  // Formula
  evaluateFormula, parseFormula, extractDependencies, FormulaError,
  // Factory
  createEntityInstance, createDefaultFieldValue, createListItem,
  // Validation
  validateSystem, validateTemplate, validateEntityData,
  // Utilities
  resolveFieldPath, createFieldResolver,
} from "./engine"
```

---

## Field Types

Templates are built from eight field types, expressed as a discriminated union on the `type` property.

| Type | Runtime Value | Default | Extra Properties |
|------|--------------|---------|-----------------|
| `number` | `number` | `0` | `min?`, `max?`, `default?` |
| `text` | `string` | `""` | `multiline?`, `default?` |
| `boolean` | `boolean` | `false` | `default?` |
| `select` | `string` | `""` | `options?`, `optionsRef?`, `default?` |
| `resource` | `ResourceValue` | `{ current: 0, max: 0 }` | `min?`, `max?` (number or formula string), `default?` |
| `list` | `ListItemData[]` | `[]` | `itemFields` |
| `group` | `Record<string, FieldValue>` | nested defaults | `fields` |
| `computed` | `null` (evaluated at runtime) | `null` | `formula` |

### NumberFieldDef

```ts
interface NumberFieldDef {
  type: "number"
  key: string
  label: string
  min?: number
  max?: number
  default?: number
}
```

### TextFieldDef

```ts
interface TextFieldDef {
  type: "text"
  key: string
  label: string
  multiline?: boolean
  default?: string
}
```

### BooleanFieldDef

```ts
interface BooleanFieldDef {
  type: "boolean"
  key: string
  label: string
  default?: boolean
}
```

### SelectFieldDef

Inline options or a reference to `SystemDefinition.sharedOptions`:

```ts
interface SelectFieldDef {
  type: "select"
  key: string
  label: string
  options?: Array<{ label: string; value: string }>
  optionsRef?: string   // key into sharedOptions
  default?: string
}
```

### ResourceFieldDef

`max` accepts a number or a formula string (e.g. `"{abilities.constitution.score}"`) for dynamic caps:

```ts
interface ResourceFieldDef {
  type: "resource"
  key: string
  label: string
  min?: number
  max?: number | string
  default?: number      // applied to both current and max
}
```

### ListFieldDef

```ts
interface ListFieldDef {
  type: "list"
  key: string
  label: string
  itemFields: FieldDef[]
}
```

### GroupFieldDef

```ts
interface GroupFieldDef {
  type: "group"
  key: string
  label: string
  fields: FieldDef[]
}
```

### ComputedFieldDef

```ts
interface ComputedFieldDef {
  type: "computed"
  key: string
  label: string
  formula: string
}
```

### FieldDef Union

```ts
type FieldDef =
  | NumberFieldDef | TextFieldDef | BooleanFieldDef | SelectFieldDef
  | ResourceFieldDef | ListFieldDef | GroupFieldDef | ComputedFieldDef
```

---

## Core Types

### Section & EntityTemplate

```ts
interface Section {
  key: string
  label: string
  fields: FieldDef[]
}

interface EntityTemplate {
  id: string
  name: string
  type: string        // e.g. "character", "npc", "monster"
  sections: Section[]
}
```

### EntityInstance

```ts
interface EntityInstance {
  id: string          // UUID, auto-generated
  templateId: string
  systemId: string
  name: string
  data: EntityData
  createdAt: number   // ms since epoch
  updatedAt: number
}
```

### EntityData & FieldValue

```ts
type FieldValue =
  | number | string | boolean | null
  | ResourceValue
  | ListItemData[]

interface ResourceValue { current: number; max: number }
interface ListItemData { id: string; [fieldKey: string]: FieldValue }

type SectionData = Record<string, FieldValue>
type EntityData  = Record<string, SectionData>
```

Data is structured as `{ [sectionKey]: { [fieldKey]: FieldValue } }`:

```ts
const data: EntityData = {
  abilities: {
    strength:     { score: 16, modifier: null },  // group fields
    dexterity:    { score: 12, modifier: null },
  },
  combat: {
    hp: { current: 45, max: 45 },                 // resource
    ac: 18,                                        // number
  },
  inventory: {
    items: [                                       // list
      { id: "abc-123", name: "Longsword", weight: 3 },
    ],
  },
}
```

### SystemDefinition

```ts
interface SystemDefinition {
  id: string
  name: string
  version: string
  dice?: DiceMechanics
  sharedOptions?: Record<string, SharedOption[]>
  templates: EntityTemplate[]
}

interface DiceMechanics { defaultDie: string; modifier?: string }
interface SharedOption  { label: string; value: string }
```

---

## Formula Engine

### Syntax Reference

**Field references** use braces with dot-separated paths:

```
{abilities.strength.score}
{combat.hp}
```

**Operators** (standard precedence — `*`/`/` before `+`/`-`):

| Operator | Description |
|----------|-------------|
| `+` `-` | Addition, subtraction (also unary) |
| `*` `/` | Multiplication, division (division by zero returns `0`) |
| `(` `)` | Grouping |

**Built-in functions** (case-sensitive):

| Function | Description |
|----------|-------------|
| `floor(n)` | Largest integer <= n |
| `ceil(n)` | Smallest integer >= n |
| `round(n)` | Nearest integer |
| `min(a, b, ...)` | Minimum of arguments |
| `max(a, b, ...)` | Maximum of arguments |
| `abs(n)` | Absolute value |

**Number literals**: integers (`42`) and decimals (`3.14`).

#### Example Formulas

```
floor(({abilities.strength.score} - 10) / 2)     // ability modifier
{combat.base_ac} + floor(({abilities.dexterity.score} - 10) / 2)
max({combat.hp.current}, 0)
```

### evaluateFormula

```ts
function evaluateFormula(formula: string, resolve: FieldResolver): number
```

Parses and evaluates a formula. The `resolve` callback maps field paths to numbers.

```ts
import { evaluateFormula, createFieldResolver } from "./engine"

const resolve = createFieldResolver(entity.data)
const modifier = evaluateFormula("floor(({abilities.strength.score} - 10) / 2)", resolve)
```

Throws `FormulaError` on syntax errors or unknown functions.

### parseFormula

```ts
function parseFormula(formula: string): ASTNode
```

Returns the abstract syntax tree without evaluating. Useful for introspection or custom evaluation.

```ts
const ast = parseFormula("{combat.ac} + 2")
// { kind: "binary", operator: "+",
//   left:  { kind: "fieldRef", path: "combat.ac" },
//   right: { kind: "number", value: 2 } }
```

### extractDependencies

```ts
function extractDependencies(formula: string): string[]
```

Returns all field paths referenced in a formula. Useful for building dependency graphs or reactive updates.

```ts
extractDependencies("floor(({abilities.strength.score} - 10) / 2)")
// ["abilities.strength.score"]

extractDependencies("{combat.base_ac} + {abilities.dexterity.modifier}")
// ["combat.base_ac", "abilities.dexterity.modifier"]
```

### FormulaError

```ts
class FormulaError extends Error {
  position: number  // character offset in the formula string
  constructor(message: string, position: number)
}
```

### AST Node Types

```ts
type ASTNode = NumberLiteral | FieldRef | BinaryOp | UnaryOp | FunctionCall

interface NumberLiteral { kind: "number";    value: number }
interface FieldRef      { kind: "fieldRef";  path: string }
interface BinaryOp      { kind: "binary";    operator: string; left: ASTNode; right: ASTNode }
interface UnaryOp       { kind: "unary";     operator: string; operand: ASTNode }
interface FunctionCall   { kind: "function";  name: string;    args: ASTNode[] }
```

### FieldResolver

```ts
type FieldResolver = (path: string) => number
```

---

## Factory Functions

### createEntityInstance

```ts
function createEntityInstance(
  template: EntityTemplate,
  systemId: string,
  name: string,
): EntityInstance
```

Creates a new entity with all fields initialized to defaults, a generated UUID, and timestamps set to `Date.now()`.

```ts
const character = createEntityInstance(characterTemplate, "dnd5e", "Tordek")
// character.id          → "a1b2c3d4-..."
// character.data        → { abilities: { strength: { score: 0, modifier: null }, ... }, ... }
// character.createdAt   → 1708000000000
```

### createDefaultFieldValue

```ts
function createDefaultFieldValue(fieldDef: FieldDef): FieldValue
```

Returns the default value for any field definition:

| Type | Default |
|------|---------|
| `number` | `fieldDef.default ?? 0` |
| `text` | `fieldDef.default ?? ""` |
| `boolean` | `fieldDef.default ?? false` |
| `select` | `fieldDef.default ?? ""` |
| `resource` | `{ current: fieldDef.default ?? 0, max: fieldDef.default ?? 0 }` |
| `list` | `[]` |
| `group` | recursively defaults for each child field |
| `computed` | `null` |

```ts
createDefaultFieldValue({ type: "number", key: "score", label: "Score", default: 10 })
// 10

createDefaultFieldValue({ type: "resource", key: "hp", label: "HP", default: 12 })
// { current: 12, max: 12 }
```

### createListItem

```ts
function createListItem(itemFields: FieldDef[]): ListItemData
```

Creates a list item with a generated UUID and default values for each field.

```ts
const item = createListItem([
  { type: "text",   key: "name",   label: "Item Name" },
  { type: "number", key: "weight", label: "Weight" },
  { type: "number", key: "qty",    label: "Quantity", default: 1 },
])
// { id: "e5f6a7b8-...", name: "", weight: 0, qty: 1 }
```

---

## Validation

All validators return `ValidationResult` and collect every error rather than failing on the first.

```ts
interface ValidationError {
  path: string      // dot/bracket path to the invalid element
  message: string
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}
```

### validateSystem

```ts
function validateSystem(system: unknown): ValidationResult
```

Full validation of a `SystemDefinition`:
- `id`, `name`, `version` are non-empty strings
- `templates` is a valid array with unique IDs
- All `optionsRef` values point to keys in `sharedOptions`
- All computed field formulas parse successfully
- No circular dependencies among computed fields

```ts
const result = validateSystem(systemDef)
if (!result.valid) {
  for (const err of result.errors) {
    console.error(`${err.path}: ${err.message}`)
  }
}
```

### validateTemplate

```ts
function validateTemplate(template: unknown, basePath?: string): ValidationResult
```

Validates an `EntityTemplate` in isolation:
- `id`, `name`, `type` are non-empty strings
- `sections` array with unique section keys
- Field keys unique within each section
- Nested group and list fields validated recursively

### validateEntityData

```ts
function validateEntityData(data: unknown, template: EntityTemplate): ValidationResult
```

Validates runtime entity data against its template:
- All sections and fields present
- Value types match definitions (`number` fields hold numbers, etc.)
- Resource fields have `{ current: number, max: number }`
- Computed fields are `null`
- Group and list data validated recursively

```ts
const character = createEntityInstance(template, "dnd5e", "Tordek")
// ... mutate character.data ...
const result = validateEntityData(character.data, template)
if (!result.valid) {
  console.error(result.errors)
}
```

---

## Utilities

### resolveFieldPath

```ts
function resolveFieldPath(data: EntityData, path: string): FieldValue | undefined
```

Walks a dot-separated path through entity data. Returns `undefined` if any segment is missing.

```ts
resolveFieldPath(entity.data, "abilities.strength.score")  // 16
resolveFieldPath(entity.data, "combat.hp")                 // { current: 45, max: 45 }
resolveFieldPath(entity.data, "nonexistent.field")         // undefined
```

### createFieldResolver

```ts
function createFieldResolver(data: EntityData): FieldResolver
```

Wraps `resolveFieldPath` to produce the `FieldResolver` callback needed by `evaluateFormula`. Coerces values to numbers:

| Value | Coercion |
|-------|----------|
| `number` | returned as-is |
| `boolean` | `true` -> `1`, `false` -> `0` |
| `string` | `parseFloat`, `0` if NaN |
| `ResourceValue` | `.current` |
| `null` / missing | `0` |

```ts
const resolve = createFieldResolver(entity.data)

// Compute all ability modifiers
const strMod = evaluateFormula("floor(({abilities.strength.score} - 10) / 2)", resolve)
const hpBonus = evaluateFormula("{combat.hp} + 5", resolve)
// ResourceValue → uses .current, so if hp is { current: 45, max: 45 }, result is 50
```
