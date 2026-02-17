# Vitality

A visual builder for tabletop RPG system definitions. Define your game system through a guided wizard instead of writing JSON by hand.

## Getting Started

```bash
npm install
npm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173/vitality/`) and click **Get Started**.

## The Wizard

The builder walks you through five steps. You can jump between them freely — nothing is lost when you navigate back and forth.

### Step 1: System Info

Set the basics: a **name** for your system, a **version** string, and an auto-generated **ID** (editable if you prefer your own). Optionally enable **dice mechanics** to define a default die (e.g. `d20`) and a modifier formula.

### Step 2: Shared Options

Create reusable option lists that can be referenced by select fields in any template. Good candidates are things like alignments, damage types, or skill proficiencies. Each list has a key (e.g. `alignments`) and a set of label/value pairs.

### Step 3: Templates

Add **entity templates** — the blueprints for things in your game. A "Character Sheet" template, a "Monster" template, an "Item" template, etc. Each gets an ID, a display name, and a type string.

### Step 4: Sections & Fields

The core of the builder. Select a template from the tab bar, then add **sections** (like "Abilities" or "Combat"). Inside each section, add **fields**. Eight field types are available:

| Type | Description |
|------|-------------|
| **text** | Free-form text, optionally multiline |
| **number** | Numeric value with optional min/max and default |
| **boolean** | A true/false toggle |
| **select** | Pick from inline choices _or_ reference a shared option list from Step 2 |
| **resource** | A current/max pair (like HP); max can be a number or a formula |
| **list** | A repeating list of items, each with its own sub-fields |
| **group** | A nested object containing its own fields |
| **computed** | Auto-calculated from a formula |

#### Formulas

Computed fields and resource max values support formulas. Reference other fields with `{section.field}` syntax:

```
floor(({abilities.str} - 10) / 2)
```

Available functions: `floor`, `ceil`, `round`, `min`, `max`, `abs`.

### Step 5: Review & Export

See the full JSON, check for validation errors, and download the file. The validator catches:

- Missing required fields (id, name, version, template ids, etc.)
- Broken shared option references
- Invalid formula syntax
- Circular dependencies between computed fields

## Tips

- Define shared option lists early (Step 2) so they're available when building select fields.
- Your work lives in browser memory — **export before closing the tab**.
- You can change a field's type at any time; the key and label are preserved.
- List and group fields support nesting — a list item can contain groups, and groups can contain lists.

## Development

```bash
npm run dev        # Start dev server
npm run build      # Type-check + production build
npm run lint       # Run ESLint
npm run test       # Run engine tests
```
