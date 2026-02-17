<script setup lang="ts">
import type { ListFieldDef, FieldDef } from "../../../engine"
import { useSystemStore } from "../../../stores/system"
import FieldEditor from "../FieldEditor.vue"

const props = defineProps<{
  field: ListFieldDef
  depth: number
}>()

const store = useSystemStore()
</script>

<template>
  <div class="border-l-2 border-gray-600 pl-3 mt-2">
    <p class="text-xs text-gray-400 mb-2">
      Item Fields
    </p>
    <div class="space-y-3">
      <FieldEditor
        v-for="(child, i) in props.field.itemFields"
        :key="i"
        :field="child"
        :index="i"
        :fields="props.field.itemFields"
        :depth="props.depth + 1"
        @update="(patch: Record<string, unknown>) => store.updateField(props.field.itemFields, i, patch)"
        @change-type="(newType: FieldDef['type']) => store.changeFieldType(props.field.itemFields, i, newType)"
        @remove="store.removeField(props.field.itemFields, i)"
      />
    </div>
    <button
      class="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
      @click="store.addField(props.field.itemFields)"
    >
      + Add Item Field
    </button>
  </div>
</template>
