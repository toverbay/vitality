<script setup lang="ts">
import type { ValidationError } from "../../engine"

defineProps<{
  errors: ValidationError[]
}>()
</script>

<template>
  <div
    v-if="errors.length > 0"
    class="bg-red-900/30 border border-red-700 rounded-lg p-4"
  >
    <h3 class="text-sm font-medium text-red-300 mb-2">
      Validation Errors ({{ errors.length }})
    </h3>
    <ul class="space-y-1">
      <li
        v-for="(err, i) in errors"
        :key="i"
        class="text-sm text-red-200"
      >
        <span
          v-if="err.path"
          class="text-red-400 font-mono text-xs"
        >{{ err.path }}: </span>
        {{ err.message }}
      </li>
    </ul>
  </div>
  <div
    v-else
    class="bg-green-900/30 border border-green-700 rounded-lg p-4"
  >
    <p class="text-sm text-green-300">
      System definition is valid.
    </p>
  </div>
</template>
