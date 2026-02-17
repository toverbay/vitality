<script setup lang="ts">
import type { GroupFieldDef, FieldDef } from "../../../engine"
import { useSystemStore } from "../../../stores/system"
import FieldEditor from "../FieldEditor.vue"

const props = defineProps<{
  field: GroupFieldDef
  depth: number
}>()

const store = useSystemStore()
</script>

<template>
  <div class="border-l-2 border-gray-600 pl-3 mt-2">
    <p class="text-xs text-gray-400 mb-2">
      Group Fields
    </p>
    <div class="space-y-3">
      <FieldEditor
        v-for="(child, i) in props.field.fields"
        :key="i"
        :field="child"
        :index="i"
        :fields="props.field.fields"
        :depth="props.depth + 1"
        @update="(patch: Record<string, unknown>) => store.updateField(props.field.fields, i, patch)"
        @change-type="(newType: FieldDef['type']) => store.changeFieldType(props.field.fields, i, newType)"
        @remove="store.removeField(props.field.fields, i)"
      />
    </div>
    <button
      class="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
      @click="store.addField(props.field.fields)"
    >
      + Add Group Field
    </button>
  </div>
</template>
