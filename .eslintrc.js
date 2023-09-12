module.exports = {
  root: true,
  extends: ['@walless/eslint-config'],
  env: {
    node: true,
  },
  globals: {
    window: true,
    document: true,
    navigator: true,
    fetch: true,
    WebAssembly: true,
  },
};
