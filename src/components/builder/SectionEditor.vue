<script setup lang="ts">
import type { Section, FieldDef } from "../../engine"
import { useSystemStore } from "../../stores/system"
import FieldEditor from "./FieldEditor.vue"

const props = defineProps<{
  section: Section
  sectionIndex: number
  templateId: string
}>()

defineEmits<{
  remove: []
}>()

const store = useSystemStore()
</script>

<template>
  <div class="bg-gray-800 rounded-lg border border-gray-700 p-4">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Section Key</label>
          <input
            :value="props.section.key"
            placeholder="section_key"
            class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            @input="store.updateSection(props.templateId, props.sectionIndex, { key: ($event.target as HTMLInputElement).value })"
          >
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Section Label</label>
          <input
            :value="props.section.label"
            placeholder="Display Label"
            class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            @input="store.updateSection(props.templateId, props.sectionIndex, { label: ($event.target as HTMLInputElement).value })"
          >
        </div>
      </div>
      <button
        class="shrink-0 ml-2 text-sm text-red-400 hover:text-red-300"
        @click="$emit('remove')"
      >
        Remove Section
      </button>
    </div>

    <div class="space-y-3">
      <FieldEditor
        v-for="(field, i) in props.section.fields"
        :key="i"
        :field="field"
        :index="i"
        :fields="props.section.fields"
        @update="(patch: Record<string, unknown>) => store.updateField(props.section.fields, i, patch)"
        @change-type="(newType: FieldDef['type']) => store.changeFieldType(props.section.fields, i, newType)"
        @remove="store.removeField(props.section.fields, i)"
      />
    </div>

    <button
      class="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
      @click="store.addField(props.section.fields)"
    >
      + Add Field
    </button>
  </div>
</template>
