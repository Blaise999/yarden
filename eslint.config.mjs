import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat({baseDirectory: process.cwd()});
export default [...compat.extends("next/core-web-vitals"), {ignores:[".next/**","node_modules/**"]}, {rules:{"@next/next/no-img-element":"off","react/no-unescaped-entities":"off"}}];
