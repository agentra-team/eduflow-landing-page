import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Nguồn thiết kế và báo cáo test không phải mã của site
    "docs/**",
    ".lighthouseci/**",
    "playwright-report/**",
    "test-results/**",
    // Chép nguyên văn từ skill seo-master, không sửa tại đây
    "scripts/seo-audit.mjs",
  ]),
]);

export default eslintConfig;
