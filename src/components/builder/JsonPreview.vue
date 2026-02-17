<script setup lang="ts">
defineProps<{
  json: string
}>()
</script>

<template>
  <div class="bg-gray-950 rounded-lg border border-gray-700 p-4 overflow-auto max-h-96">
    <pre class="text-sm text-gray-300 font-mono whitespace-pre">{{ json }}</pre>
  </div>
</template>
