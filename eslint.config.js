import js from "@eslint/js"
import vue from "eslint-plugin-vue"
import tseslint from "typescript-eslint"
import stylistic from "@stylistic/eslint-plugin"

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      "vue/block-order": ["error", { order: ["script", "template", "style"] }],
      "vue/multi-word-component-names": "off",
    },
  },
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/semi": ["error", "never"],
      "@stylistic/quotes": ["error", "double"],
    },
  },
  {
    ignores: ["dist/**"],
  },
]
