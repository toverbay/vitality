<script setup lang="ts">
import type { ResourceFieldDef } from "../../../engine"

const props = defineProps<{ field: ResourceFieldDef }>()
const emit = defineEmits<{ update: [patch: Record<string, unknown>] }>()

function setNum(key: string, raw: string) {
  const val = raw === "" ? undefined : Number(raw)
  emit("update", { [key]: val })
}

function setMax(raw: string) {
  // Allow formula strings (starting with {) or numbers
  const trimmed = raw.trim()
  if (trimmed === "") {
    emit("update", { max: undefined })
  } else if (trimmed.startsWith("{") || isNaN(Number(trimmed))) {
    emit("update", { max: trimmed })
  } else {
    emit("update", { max: Number(trimmed) })
  }
}
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <div>
      <label class="block text-xs text-gray-400 mb-1">Min</label>
      <input
        type="number"
        :value="props.field.min ?? ''"
        placeholder="--"
        class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
        @input="setNum('min', ($event.target as HTMLInputElement).value)"
      >
    </div>
    <div>
      <label class="block text-xs text-gray-400 mb-1">Max (number or formula)</label>
      <input
        :value="props.field.max ?? ''"
        placeholder="e.g. 20 or {abilities.con}"
        class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        @input="setMax(($event.target as HTMLInputElement).value)"
      >
    </div>
    <div>
      <label class="block text-xs text-gray-400 mb-1">Default</label>
      <input
        type="number"
        :value="props.field.default ?? ''"
        placeholder="--"
        class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
        @input="setNum('default', ($event.target as HTMLInputElement).value)"
      >
    </div>
  </div>
</template>
