<script setup lang="ts">
import { computed } from "vue"
import type { SelectFieldDef } from "../../../engine"
import { useSystemStore } from "../../../stores/system"

const props = defineProps<{ field: SelectFieldDef }>()
const emit = defineEmits<{ update: [patch: Record<string, unknown>] }>()

const store = useSystemStore()

const mode = computed(() => props.field.optionsRef ? "ref" : "inline")

function setMode(m: "inline" | "ref") {
  if (m === "inline") {
    emit("update", { optionsRef: undefined, options: props.field.options ?? [] })
  } else {
    emit("update", { options: undefined, optionsRef: store.sharedOptionKeys[0] ?? "" })
  }
}

function updateInlineOption(index: number, key: "label" | "value", val: string) {
  const opts = [...(props.field.options ?? [])]
  opts[index] = { ...opts[index]!, [key]: val }
  emit("update", { options: opts })
}

function addInlineOption() {
  const opts = [...(props.field.options ?? []), { label: "", value: "" }]
  emit("update", { options: opts })
}

function removeInlineOption(index: number) {
  const opts = [...(props.field.options ?? [])]
  opts.splice(index, 1)
  emit("update", { options: opts })
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-4">
      <label class="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="radio"
          name="select-mode"
          value="inline"
          :checked="mode === 'inline'"
          class="text-indigo-500"
          @change="setMode('inline')"
        >
        Inline options
      </label>
      <label class="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="radio"
          name="select-mode"
          value="ref"
          :checked="mode === 'ref'"
          class="text-indigo-500"
          @change="setMode('ref')"
        >
        Shared reference
      </label>
    </div>

    <template v-if="mode === 'inline'">
      <div
        v-for="(opt, i) in props.field.options ?? []"
        :key="i"
        class="flex items-center gap-2"
      >
        <input
          :value="opt.label"
          placeholder="Label"
          class="flex-1 px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          @input="updateInlineOption(i, 'label', ($event.target as HTMLInputElement).value)"
        >
        <input
          :value="opt.value"
          placeholder="Value"
          class="flex-1 px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          @input="updateInlineOption(i, 'value', ($event.target as HTMLInputElement).value)"
        >
        <button
          class="text-gray-500 hover:text-red-400 text-sm"
          @click="removeInlineOption(i)"
        >
          X
        </button>
      </div>
      <button
        class="text-sm text-indigo-400 hover:text-indigo-300"
        @click="addInlineOption"
      >
        + Add Option
      </button>
    </template>

    <template v-else>
      <div>
        <label class="block text-xs text-gray-400 mb-1">Shared Options Key</label>
        <select
          :value="props.field.optionsRef"
          class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
          @change="emit('update', { optionsRef: ($event.target as HTMLSelectElement).value })"
        >
          <option
            v-if="store.sharedOptionKeys.length === 0"
            value=""
            disabled
          >
            No shared option lists defined
          </option>
          <option
            v-for="k in store.sharedOptionKeys"
            :key="k"
            :value="k"
          >
            {{ k }}
          </option>
        </select>
      </div>
    </template>

    <div>
      <label class="block text-xs text-gray-400 mb-1">Default value</label>
      <input
        :value="props.field.default ?? ''"
        placeholder="(none)"
        class="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        @input="emit('update', { default: ($event.target as HTMLInputElement).value || undefined })"
      >
    </div>
  </div>
</template>
