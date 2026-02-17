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

      <fieldset class="border border-gray-700 rounded-lg p-4">
        <legend class="text-sm text-gray-300 px-2">
          Dice Mechanics (optional)
        </legend>

        <div class="flex items-center gap-3 mb-3">
          <label class="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              :checked="!!store.system.dice"
              class="rounded bg-gray-800 border-gray-600 text-indigo-500 focus:ring-indigo-500"
              @change="store.updateDice(($event.target as HTMLInputElement).checked ? { defaultDie: 'd20' } : undefined)"
            >
            Enable dice mechanics
          </label>
        </div>

        <template v-if="store.system.dice">
          <div class="space-y-3">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Default Die</label>
              <input
                :value="store.system.dice.defaultDie"
                placeholder="d20"
                class="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                @input="store.updateDice({ defaultDie: ($event.target as HTMLInputElement).value, modifier: store.system.dice?.modifier })"
              >
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Modifier (optional)</label>
              <input
                :value="store.system.dice.modifier ?? ''"
                placeholder="e.g. +{abilities.dexterity}"
                class="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                @input="store.updateDice({ defaultDie: store.system.dice!.defaultDie, modifier: ($event.target as HTMLInputElement).value || undefined })"
              >
            </div>
          </div>
        </template>
      </fieldset>
    </div>

    <StepNavigation next-path="/builder/shared-options" />
  </div>
</template>
