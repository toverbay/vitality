<script setup lang="ts">
import { ref } from "vue"
import { useSystemStore } from "../../stores/system"

const props = defineProps<{
  listKey: string
}>()

const emit = defineEmits<{
  rename: [oldKey: string, newKey: string]
  remove: [key: string]
}>()

const store = useSystemStore()
const editingKey = ref(false)
const keyDraft = ref(props.listKey)

const options = () => store.system.sharedOptions?.[props.listKey] ?? []

function commitRename() {
  editingKey.value = false
  const trimmed = keyDraft.value.trim()
  if (trimmed && trimmed !== props.listKey) {
    emit("rename", props.listKey, trimmed)
  } else {
    keyDraft.value = props.listKey
  }
}
</script>

<template>
  <div class="bg-gray-800 rounded-lg border border-gray-700 p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <template v-if="editingKey">
          <input
            v-model="keyDraft"
            class="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
            @blur="commitRename"
            @keydown.enter="commitRename"
          >
        </template>
        <template v-else>
          <span
            class="font-medium text-gray-100 cursor-pointer hover:text-indigo-400"
            @click="editingKey = true; keyDraft = listKey"
          >
            {{ listKey }}
          </span>
        </template>
      </div>
      <button
        class="text-sm text-red-400 hover:text-red-300"
        @click="emit('remove', listKey)"
      >
        Remove List
      </button>
    </div>

    <div class="space-y-2">
      <div
        v-for="(opt, i) in options()"
        :key="i"
        class="flex items-center gap-2"
      >
        <input
          :value="opt.label"
          placeholder="Label"
          class="flex-1 px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          @input="store.updateSharedOption(listKey, i, { label: ($event.target as HTMLInputElement).value, value: opt.value })"
        >
        <input
          :value="opt.value"
          placeholder="Value"
          class="flex-1 px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          @input="store.updateSharedOption(listKey, i, { label: opt.label, value: ($event.target as HTMLInputElement).value })"
        >
        <button
          class="text-gray-500 hover:text-red-400 text-sm"
          @click="store.removeSharedOption(listKey, i)"
        >
          X
        </button>
      </div>
    </div>

    <button
      class="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
      @click="store.addSharedOption(listKey, { label: '', value: '' })"
    >
      + Add Option
    </button>
  </div>
</template>
