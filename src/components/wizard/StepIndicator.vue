<script setup lang="ts">
defineProps<{
  currentStep: number
  steps: Array<{ label: string; path: string }>
}>()
</script>

<template>
  <nav class="flex items-center gap-2 mb-8">
    <template
      v-for="(step, i) in steps"
      :key="step.path"
    >
      <div
        v-if="i > 0"
        class="h-px flex-1 bg-gray-700"
        :class="{ 'bg-indigo-500': i < currentStep }"
      />
      <RouterLink
        :to="step.path"
        class="flex items-center gap-2 shrink-0"
      >
        <span
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors"
          :class="
            i + 1 === currentStep
              ? 'border-indigo-500 bg-indigo-500 text-white'
              : i + 1 < currentStep
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-gray-600 text-gray-400'
          "
        >
          {{ i + 1 }}
        </span>
        <span
          class="text-sm hidden sm:inline"
          :class="i + 1 === currentStep ? 'text-gray-100' : 'text-gray-400'"
        >
          {{ step.label }}
        </span>
      </RouterLink>
    </template>
  </nav>
</template>
