<script setup lang="ts">
import { ref } from "vue"
import { useSystemStore } from "../../stores/system"
import SharedOptionEditor from "../../components/builder/SharedOptionEditor.vue"
import StepNavigation from "../../components/wizard/StepNavigation.vue"

const store = useSystemStore()
const newListKey = ref("")

function addList() {
  const key = newListKey.value.trim()
  if (!key) return
  store.addSharedOptionList(key)
  newListKey.value = ""
}
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-100 mb-1">
      Shared Options
    </h2>
    <p class="text-sm text-gray-400 mb-4">
      Define reusable option lists that can be referenced by select fields across templates.
    </p>

    <div class="space-y-4">
      <SharedOptionEditor
        v-for="key in store.sharedOptionKeys"
        :key="key"
        :list-key="key"
        @rename="(oldKey, newKey) => store.renameSharedOptionList(oldKey, newKey)"
        @remove="(k) => store.removeSharedOptionList(k)"
      />
    </div>

    <div class="flex gap-2 mt-4">
      <input
        v-model="newListKey"
        placeholder="New list key (e.g. alignments)"
        class="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        @keydown.enter="addList"
      >
      <button
        class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
        @click="addList"
      >
        Add List
      </button>
    </div>

    <StepNavigation
      prev-path="/builder/system-info"
      next-path="/builder/templates"
    />
  </div>
</template>
