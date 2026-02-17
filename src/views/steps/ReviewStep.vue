<script setup lang="ts">
import { computed } from "vue"
import { useSystemStore } from "../../stores/system"
import ValidationErrors from "../../components/builder/ValidationErrors.vue"
import JsonPreview from "../../components/builder/JsonPreview.vue"
import StepNavigation from "../../components/wizard/StepNavigation.vue"

const store = useSystemStore()

const jsonOutput = computed(() => store.exportAsJson())

function download() {
  const blob = new Blob([jsonOutput.value], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${store.system.id}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-100 mb-1">
      Review &amp; Export
    </h2>
    <p class="text-sm text-gray-400 mb-4">
      Review your system definition and fix any validation errors before exporting.
    </p>

    <div class="space-y-4">
      <ValidationErrors :errors="store.validation.errors" />

      <div>
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-300">
            JSON Preview
          </h3>
          <button
            :disabled="!store.validation.valid"
            class="px-4 py-2 rounded-lg text-sm transition-colors"
            :class="
              store.validation.valid
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            "
            @click="download"
          >
            Download JSON
          </button>
        </div>
        <JsonPreview :json="jsonOutput" />
      </div>
    </div>

    <StepNavigation prev-path="/builder/template-fields" />
  </div>
</template>
