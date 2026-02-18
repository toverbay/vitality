<script setup lang="ts">
import { ref, computed } from "vue"
import { useRoute } from "vue-router"
import { useSystemStore } from "../stores/system"
import StepIndicator from "../components/wizard/StepIndicator.vue"

const route = useRoute()
const store = useSystemStore()
const currentStep = computed(() => (route.meta.step as number) ?? 1)
const fileInput = ref<HTMLInputElement | null>(null)

const steps = [
  { label: "System Info", path: "/builder/system-info" },
  { label: "Shared Options", path: "/builder/shared-options" },
  { label: "Templates", path: "/builder/templates" },
  { label: "Sections & Fields", path: "/builder/template-fields" },
  { label: "Review", path: "/builder/review" },
]

function exportJson() {
  const json = store.exportAsJson()
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${store.system.id}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  fileInput.value?.click()
}

function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    store.loadFromJson(reader.result as string)
  }
  reader.readAsText(file)
  // Reset so the same file can be re-imported
  if (fileInput.value) fileInput.value.value = ""
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-2xl font-bold text-gray-100">
        <RouterLink
          to="/"
          class="hover:text-indigo-400 transition-colors"
        >
          Vitality
        </RouterLink>
        <span class="text-gray-500 font-normal text-lg ml-2">/ Builder</span>
      </h1>
      <div class="flex gap-2">
        <button
          class="px-3 py-1.5 rounded-lg text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
          @click="triggerImport"
        >
          Import
        </button>
        <button
          class="px-3 py-1.5 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          @click="exportJson"
        >
          Export
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleImport"
        >
      </div>
    </div>
    <p class="text-gray-400 mb-6 text-sm">
      Build your game system step by step
    </p>
    <StepIndicator
      :current-step="currentStep"
      :steps="steps"
    />
    <RouterView />
  </div>
</template>
