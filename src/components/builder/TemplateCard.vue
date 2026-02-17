<script setup lang="ts">
import type { EntityTemplate } from "../../engine"
import { useSystemStore } from "../../stores/system"

const props = defineProps<{
  template: EntityTemplate
}>()

defineEmits<{
  remove: [id: string]
}>()

const store = useSystemStore()
</script>

<template>
  <div
    class="bg-gray-800 rounded-lg border border-gray-700 p-4"
    :class="{ 'border-indigo-500': store.activeTemplateId === props.template.id }"
  >
    <div class="flex items-start justify-between mb-3">
      <button
        class="text-sm font-medium text-indigo-400 hover:text-indigo-300"
        @click="store.activeTemplateId = props.template.id"
      >
        {{ props.template.name || "(unnamed)" }}
      </button>
      <button
        class="text-sm text-red-400 hover:text-red-300"
        @click="$emit('remove', props.template.id)"
      >
        Remove
      </button>
    </div>
    <div class="space-y-2">
      <div>
        <label class="block text-xs text-gray-400 mb-1">Template ID</label>
        <input
          :value="props.template.id"
          class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
          @input="store.updateTemplate(props.template.id, { id: ($event.target as HTMLInputElement).value })"
        >
      </div>
      <div>
        <label class="block text-xs text-gray-400 mb-1">Name</label>
        <input
          :value="props.template.name"
          placeholder="e.g. Character Sheet"
          class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          @input="store.updateTemplate(props.template.id, { name: ($event.target as HTMLInputElement).value })"
        >
      </div>
      <div>
        <label class="block text-xs text-gray-400 mb-1">Type</label>
        <input
          :value="props.template.type"
          placeholder="e.g. character"
          class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          @input="store.updateTemplate(props.template.id, { type: ($event.target as HTMLInputElement).value })"
        >
      </div>
    </div>
    <p class="text-xs text-gray-500 mt-2">
      {{ props.template.sections.length }} section(s)
    </p>
  </div>
</template>
