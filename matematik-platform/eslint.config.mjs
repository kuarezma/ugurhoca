import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

const tsFiles = ["**/*.ts", "**/*.tsx"];

const config = [
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "data/**",
      "node_modules/**",
      "public/sw.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals,
  {
    files: tsFiles,
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@next/next/no-img-element": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "import/no-anonymous-default-export": "off",
      "jsx-a11y/alt-text": "warn",
      "no-empty": [
        "error",
        {
          allowEmptyCatch: true,
        },
      ],
      "no-console": [
        "warn",
        {
          allow: ["error", "warn"],
        },
      ],
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off",
      "unused-imports/no-unused-imports": "error",
    },
  },
  {
    files: ["src/app/**/page.tsx"],
    rules: {
      "max-lines": [
        "warn",
        {
          max: 250,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  prettier,
];

export default config;
