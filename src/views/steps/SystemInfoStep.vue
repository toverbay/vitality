<script setup lang="ts">
import { useSystemStore } from "../../stores/system"
import StepNavigation from "../../components/wizard/StepNavigation.vue"

const store = useSystemStore()
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-100 mb-4">
      System Info
    </h2>

    <div class="space-y-4">
      <div>
        <label class="block text-sm text-gray-300 mb-1">System ID</label>
        <input
          :value="store.system.id"
          class="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 focus:border-indigo-500 focus:outline-none"
          @input="store.updateSystemInfo({ id: ($event.target as HTMLInputElement).value })"
        >
        <p class="text-xs text-gray-500 mt-1">
          Auto-generated UUID. You can edit it if needed.
        </p>
      </div>

      <div>
        <label class="block text-sm text-gray-300 mb-1">Name</label>
        <input
          :value="store.system.name"
          placeholder="e.g. Dungeons & Dragons 5e"
          class="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          @input="store.updateSystemInfo({ name: ($event.target as HTMLInputElement).value })"
        >
      </div>

      <div>
        <label class="block text-sm text-gray-300 mb-1">Version</label>
        <input
          :value="store.system.version"
          placeholder="1.0.0"
          class="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          @input="store.updateSystemInfo({ version: ($event.target as HTMLInputElement).value })"
        >
      </div>
    </div>

    <StepNavigation next-path="/builder/shared-options" />
  </div>
</template>
