<script setup lang="ts">
import type { BooleanFieldDef } from "../../../engine"

const props = defineProps<{ field: BooleanFieldDef }>()
const emit = defineEmits<{ update: [patch: Record<string, unknown>] }>()
</script>

<template>
  <div>
    <label class="flex items-center gap-2 text-sm text-gray-300">
      <input
        type="checkbox"
        :checked="!!props.field.default"
        class="rounded bg-gray-700 border-gray-600 text-indigo-500"
        @change="emit('update', { default: ($event.target as HTMLInputElement).checked || undefined })"
      >
      Default checked
    </label>
  </div>
</template>
