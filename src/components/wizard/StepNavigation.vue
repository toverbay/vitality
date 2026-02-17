<script setup lang="ts">
defineProps<{
  prevPath?: string
  nextPath?: string
  nextLabel?: string
}>()
</script>

<template>
  <div class="flex justify-between pt-6 mt-6 border-t border-gray-700">
    <RouterLink
      v-if="prevPath"
      :to="prevPath"
      class="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
    >
      Back
    </RouterLink>
    <span v-else />
    <RouterLink
      v-if="nextPath"
      :to="nextPath"
      class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
    >
      {{ nextLabel ?? "Next" }}
    </RouterLink>
  </div>
</template>
