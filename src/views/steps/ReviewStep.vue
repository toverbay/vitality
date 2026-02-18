<script setup lang="ts">
import { computed } from "vue"
import { useSystemStore } from "../../stores/system"
import ValidationErrors from "../../components/builder/ValidationErrors.vue"
import JsonPreview from "../../components/builder/JsonPreview.vue"
import StepNavigation from "../../components/wizard/StepNavigation.vue"

const store = useSystemStore()

const jsonOutput = computed(() => store.exportAsJson())
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-100 mb-1">
      Review
    </h2>
    <p class="text-sm text-gray-400 mb-4">
      Check for validation errors and preview the final JSON.
      Use the Export button in the header to download at any time.
    </p>

    <div class="space-y-4">
      <ValidationErrors :errors="store.validation.errors" />

      <div>
        <h3 class="text-sm font-medium text-gray-300 mb-2">
          JSON Preview
        </h3>
        <JsonPreview :json="jsonOutput" />
      </div>
    </div>

    <StepNavigation prev-path="/builder/template-fields" />
  </div>
</template>
