import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["labbench/**", "out/**", ".next/**"],
  },
];

export default eslintConfig;
