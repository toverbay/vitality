<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import StepIndicator from "../components/wizard/StepIndicator.vue"

const route = useRoute()
const currentStep = computed(() => (route.meta.step as number) ?? 1)

const steps = [
  { label: "System Info", path: "/builder/system-info" },
  { label: "Shared Options", path: "/builder/shared-options" },
  { label: "Templates", path: "/builder/templates" },
  { label: "Sections & Fields", path: "/builder/template-fields" },
  { label: "Review", path: "/builder/review" },
]
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-100 mb-2">
      <RouterLink
        to="/"
        class="hover:text-indigo-400 transition-colors"
      >
        Vitality
      </RouterLink>
      <span class="text-gray-500 font-normal text-lg ml-2">/ Builder</span>
    </h1>
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
