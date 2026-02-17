<script setup lang="ts">
import { type Component } from "vue"
import type { FieldDef } from "../../engine"
import NumberFieldForm from "./fields/NumberFieldForm.vue"
import TextFieldForm from "./fields/TextFieldForm.vue"
import BooleanFieldForm from "./fields/BooleanFieldForm.vue"
import SelectFieldForm from "./fields/SelectFieldForm.vue"
import ResourceFieldForm from "./fields/ResourceFieldForm.vue"
import ListFieldForm from "./fields/ListFieldForm.vue"
import GroupFieldForm from "./fields/GroupFieldForm.vue"
import ComputedFieldForm from "./fields/ComputedFieldForm.vue"

const props = defineProps<{
  field: FieldDef
  index: number
  fields: FieldDef[]
  depth?: number
}>()

const emit = defineEmits<{
  update: [patch: Record<string, unknown>]
  "change-type": [newType: FieldDef["type"]]
  remove: []
}>()

const fieldTypes: FieldDef["type"][] = [
  "text", "number", "boolean", "select", "resource", "list", "group", "computed",
]

const subFormMap: Record<FieldDef["type"], Component> = {
  number: NumberFieldForm,
  text: TextFieldForm,
  boolean: BooleanFieldForm,
  select: SelectFieldForm,
  resource: ResourceFieldForm,
  list: ListFieldForm,
  group: GroupFieldForm,
  computed: ComputedFieldForm,
}
</script>

<template>
  <div class="bg-gray-800/50 rounded-lg border border-gray-700 p-3">
    <div class="flex items-start gap-2 mb-2">
      <div class="flex-1 grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Key</label>
          <input
            :value="props.field.key"
            placeholder="field_key"
            class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            @input="emit('update', { key: ($event.target as HTMLInputElement).value })"
          >
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Label</label>
          <input
            :value="props.field.label"
            placeholder="Display Label"
            class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            @input="emit('update', { label: ($event.target as HTMLInputElement).value })"
          >
        </div>
      </div>
      <div class="shrink-0">
        <label class="block text-xs text-gray-400 mb-1">Type</label>
        <select
          :value="props.field.type"
          class="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
          @change="emit('change-type', ($event.target as HTMLSelectElement).value as FieldDef['type'])"
        >
          <option
            v-for="ft in fieldTypes"
            :key="ft"
            :value="ft"
          >
            {{ ft }}
          </option>
        </select>
      </div>
      <button
        class="shrink-0 mt-5 text-gray-500 hover:text-red-400 text-sm"
        @click="emit('remove')"
      >
        X
      </button>
    </div>

    <component
      :is="subFormMap[props.field.type]"
      :field="props.field"
      :depth="props.depth ?? 0"
      @update="(patch: Record<string, unknown>) => emit('update', patch)"
    />
  </div>
</template>
