import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import provenancePlugin from "./eslint-plugin-provenance/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["src/simulation/**/*.ts", "src/platform/**/*.ts"],
    plugins: {
      provenance: provenancePlugin,
    },
    rules: {
      "provenance/require-provenance": [
        "error",
        {
          include: ["src/simulation/**/*.ts", "src/platform/**/*.ts"],
          exclude: ["**/__tests__/**", "**/*.test.ts"],
          allowedNames: ["index", "i", "j", "k", "count", "length", "tmp"],
        },
      ],
    },
  },
];

export default eslintConfig;
