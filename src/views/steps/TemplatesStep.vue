<script setup lang="ts">
import { useSystemStore } from "../../stores/system"
import TemplateCard from "../../components/builder/TemplateCard.vue"
import StepNavigation from "../../components/wizard/StepNavigation.vue"

const store = useSystemStore()
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-100 mb-1">
      Entity Templates
    </h2>
    <p class="text-sm text-gray-400 mb-4">
      Define the types of entities in your system (e.g. characters, monsters, NPCs).
    </p>

    <div class="grid gap-4 sm:grid-cols-2">
      <TemplateCard
        v-for="tmpl in store.system.templates"
        :key="tmpl.id"
        :template="tmpl"
        @remove="store.removeTemplate"
      />
    </div>

    <button
      class="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
      @click="store.addTemplate()"
    >
      + Add Template
    </button>

    <StepNavigation
      prev-path="/builder/shared-options"
      next-path="/builder/template-fields"
    />
  </div>
</template>
