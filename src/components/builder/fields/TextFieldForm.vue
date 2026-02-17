<script setup lang="ts">
import type { TextFieldDef } from "../../../engine"

const props = defineProps<{ field: TextFieldDef }>()
const emit = defineEmits<{ update: [patch: Record<string, unknown>] }>()
</script>

<template>
  <div class="space-y-2">
    <label class="flex items-center gap-2 text-sm text-gray-300">
      <input
        type="checkbox"
        :checked="!!props.field.multiline"
        class="rounded bg-gray-700 border-gray-600 text-indigo-500"
        @change="emit('update', { multiline: ($event.target as HTMLInputElement).checked || undefined })"
      >
      Multiline
    </label>
    <div>
      <label class="block text-xs text-gray-400 mb-1">Default</label>
      <input
        :value="props.field.default ?? ''"
        placeholder="(empty)"
        class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        @input="emit('update', { default: ($event.target as HTMLInputElement).value || undefined })"
      >
    </div>
  </div>
</template>
