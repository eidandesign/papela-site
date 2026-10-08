import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts", ".design-sync/**", ".ds-sync/**", "ds-bundle/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
