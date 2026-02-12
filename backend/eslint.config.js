//import js from "@eslint/js";
//import globals from "globals";
//import pluginReact from "eslint-plugin-react";
//import { defineConfig } from "eslint/config";

//export default defineConfig([
  //{ files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  //pluginReact.configs.flat.recommended,
//]);
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
  // TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.json"],
    plugins: { "@typescript-eslint": tsPlugin },
    languageOptions: {
      parser: tsParser,
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": "off", // disable JS version
      "@typescript-eslint/no-unused-vars": [
        "error",
        { vars: "all", args: "after-used", ignoreRestSiblings: true }
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // Auto-fixable formatting rules
      "semi": ["error", "never"],                   // avoid semicolons
      "quotes": ["error", "single"],                // use single quotes
      "comma-dangle": ["error", "never"],           // no trailing commas
      "indent": ["error", 4],                        // 4 spaces
      "space-before-function-paren": ["error", "never"], // fix spacing before parens
      "key-spacing": ["error", { beforeColon: false, afterColon: true }], // spacing in objects
      "space-infix-ops": "error",                   // spacing around operators
      "object-curly-spacing": ["error", "always"],  // spaces inside {}
      "array-bracket-spacing": ["error", "never"],  // no spaces inside []
      "eol-last": ["error", "always"],             // newline at end of file
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }], // limit empty lines

      // Naming rules (not auto-fixable)
      "@typescript-eslint/naming-convention": [
  "off"
],
    },
  },

  // JavaScript files
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs", "**/*.jsx"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
]);
