// ESLint config explicite (eslint-config-expo) pour éviter l'auto-install d'expo lint.
module.exports = {
  extends: 'expo',
  ignorePatterns: ['/dist', '/.expo', 'node_modules'],
}
