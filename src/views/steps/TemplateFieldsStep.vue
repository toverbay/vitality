<script setup lang="ts">
import { useSystemStore } from "../../stores/system"
import SectionEditor from "../../components/builder/SectionEditor.vue"
import StepNavigation from "../../components/wizard/StepNavigation.vue"

const store = useSystemStore()

// Auto-select first template if none active
if (!store.activeTemplate && store.system.templates.length > 0) {
  store.activeTemplateId = store.system.templates[0]!.id
}
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-100 mb-1">
      Sections &amp; Fields
    </h2>
    <p class="text-sm text-gray-400 mb-4">
      Add sections and fields to each template. Select a template to edit below.
    </p>

    <div
      v-if="store.system.templates.length === 0"
      class="text-gray-500 text-sm py-8 text-center"
    >
      No templates defined. Go back to Step 3 to add one.
    </div>

    <template v-else>
      <div class="flex gap-2 mb-4 flex-wrap">
        <button
          v-for="tmpl in store.system.templates"
          :key="tmpl.id"
          class="px-3 py-1.5 rounded-lg text-sm transition-colors"
          :class="
            store.activeTemplateId === tmpl.id
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          "
          @click="store.activeTemplateId = tmpl.id"
        >
          {{ tmpl.name || tmpl.id }}
        </button>
      </div>

      <template v-if="store.activeTemplate">
        <div class="space-y-4">
          <SectionEditor
            v-for="(section, i) in store.activeTemplate.sections"
            :key="i"
            :section="section"
            :section-index="i"
            :template-id="store.activeTemplate.id"
            @remove="store.removeSection(store.activeTemplate!.id, i)"
          />
        </div>

        <button
          class="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          @click="store.addSection(store.activeTemplate!.id)"
        >
          + Add Section
        </button>
      </template>
    </template>

    <StepNavigation
      prev-path="/builder/templates"
      next-path="/builder/review"
    />
  </div>
</template>
