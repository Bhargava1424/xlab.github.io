import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      "labbench/**",
      "out/**",
      ".next/**",
      "Polo Club Website Inspiration/**",
    ],
  },
];

export default eslintConfig;
