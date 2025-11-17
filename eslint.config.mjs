import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

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
  // Security rules for MARCUS platform
  {
    files: ["src/platform/**/*.ts", "src/platform/**/*.tsx"],
    rules: {
      // Prevent eval() and similar dangerous functions
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // Prevent prototype pollution
      "no-proto": "error",

      // Require proper error handling
      "no-throw-literal": "error",

      // Prevent regex DoS
      "no-useless-escape": "warn",

      // Require strict mode
      "strict": ["error", "global"],

      // Prevent unsafe dynamic imports
      "no-unsanitized/method": "off", // Would need plugin
      "no-unsanitized/property": "off", // Would need plugin
    },
  },
];

export default eslintConfig;
