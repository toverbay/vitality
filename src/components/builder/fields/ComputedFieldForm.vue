<script setup lang="ts">
import type { ComputedFieldDef } from "../../../engine"

const props = defineProps<{ field: ComputedFieldDef }>()
const emit = defineEmits<{ update: [patch: Record<string, unknown>] }>()
</script>

<template>
  <div>
    <label class="block text-xs text-gray-400 mb-1">Formula</label>
    <input
      :value="props.field.formula"
      placeholder="e.g. floor(({abilities.str} - 10) / 2)"
      class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm font-mono placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
      @input="emit('update', { formula: ($event.target as HTMLInputElement).value })"
    >
    <p class="text-xs text-gray-500 mt-1">
      Use {section.field} for references. Functions: floor, ceil, round, min, max, abs.
    </p>
  </div>
</template>
