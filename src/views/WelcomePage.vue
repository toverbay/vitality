<script setup lang="ts">
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-gray-100 mb-3">
      Vitality
    </h1>
    <p class="text-lg text-gray-300 mb-8">
      A visual builder for tabletop RPG system definitions. Instead of writing
      JSON by hand, walk through a guided wizard to create your game system
      step by step.
    </p>

    <RouterLink
      to="/builder/system-info"
      class="inline-block px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
    >
      Get Started
    </RouterLink>

    <div class="mt-12 space-y-8">
      <section>
        <h2 class="text-xl font-semibold text-gray-100 mb-3">
          How it works
        </h2>
        <p class="text-gray-400 mb-4">
          The builder walks you through five steps. You can jump between steps
          at any time using the step bar at the top — nothing is lost when you
          navigate back and forth.
        </p>
        <ol class="space-y-4">
          <li class="flex gap-3">
            <span class="shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center font-medium">1</span>
            <div>
              <h3 class="text-gray-100 font-medium">
                System Info
              </h3>
              <p class="text-sm text-gray-400">
                Name your system, set a version, and choose an ID.
              </p>
            </div>
          </li>
          <li class="flex gap-3">
            <span class="shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center font-medium">2</span>
            <div>
              <h3 class="text-gray-100 font-medium">
                Shared Options
              </h3>
              <p class="text-sm text-gray-400">
                Define reusable option lists — things like alignments, damage
                types, or skill proficiencies. Any select field can reference
                these instead of duplicating choices.
              </p>
            </div>
          </li>
          <li class="flex gap-3">
            <span class="shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center font-medium">3</span>
            <div>
              <h3 class="text-gray-100 font-medium">
                Templates
              </h3>
              <p class="text-sm text-gray-400">
                Create entity templates — the blueprints for things in your
                game (characters, monsters, items, etc.). Give each one an ID,
                a display name, and a type.
              </p>
            </div>
          </li>
          <li class="flex gap-3">
            <span class="shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center font-medium">4</span>
            <div>
              <h3 class="text-gray-100 font-medium">
                Sections &amp; Fields
              </h3>
              <p class="text-sm text-gray-400">
                The heart of the builder. For each template, add sections
                (like "Abilities" or "Combat") and fill them with fields.
                Eight field types are available:
              </p>
              <ul class="text-sm text-gray-400 mt-2 ml-4 space-y-1 list-disc">
                <li>
                  <span class="text-gray-300">text</span> — free-form text, optionally multiline
                </li>
                <li>
                  <span class="text-gray-300">number</span> — numeric value with optional min/max
                </li>
                <li>
                  <span class="text-gray-300">boolean</span> — a true/false toggle
                </li>
                <li>
                  <span class="text-gray-300">select</span> — pick from inline choices or a shared option list
                </li>
                <li>
                  <span class="text-gray-300">resource</span> — a current/max pair (like HP), max can be a formula
                </li>
                <li>
                  <span class="text-gray-300">list</span> — a repeating list of items, each with its own fields
                </li>
                <li>
                  <span class="text-gray-300">group</span> — a nested set of fields (for sub-objects)
                </li>
                <li>
                  <span class="text-gray-300">computed</span> — auto-calculated from a formula, e.g.
                  <code class="text-indigo-400">floor(({abilities.str} - 10) / 2)</code>
                </li>
              </ul>
            </div>
          </li>
          <li class="flex gap-3">
            <span class="shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center font-medium">5</span>
            <div>
              <h3 class="text-gray-100 font-medium">
                Review &amp; Export
              </h3>
              <p class="text-sm text-gray-400">
                See the full JSON output, check for validation errors, and
                download the finished file. The validator catches missing
                required fields, broken option references, invalid formulas,
                and circular dependencies.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-gray-100 mb-3">
          Tips
        </h2>
        <ul class="space-y-2 text-sm text-gray-400 list-disc ml-4">
          <li>
            You don't have to fill everything in order — jump to any step and
            come back later.
          </li>
          <li>
            Define your shared option lists early (Step 2) so they're available
            when building select fields in Step 4.
          </li>
          <li>
            Formulas reference fields with
            <code class="text-indigo-400">{section.field}</code> syntax and
            support <code class="text-indigo-400">floor</code>,
            <code class="text-indigo-400">ceil</code>,
            <code class="text-indigo-400">round</code>,
            <code class="text-indigo-400">min</code>,
            <code class="text-indigo-400">max</code>, and
            <code class="text-indigo-400">abs</code>.
          </li>
          <li>
            The Review step validates everything in real time — fix errors
            there before exporting.
          </li>
          <li>
            Your work lives in browser memory. Export your JSON before closing
            the tab!
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
