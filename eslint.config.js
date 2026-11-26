const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      curly: ["error", "multi-line", "consistent"],
      "max-nested-callbacks": ["error", { max: 4 }],
      "no-console": "off",
      "no-empty-function": "error",
      "no-shadow": ["error", { allow: ["err", "resolve", "reject"] }],
      "no-var": "error",
      "prefer-const": "error",
      yoda: "error",
    },
  },
];
