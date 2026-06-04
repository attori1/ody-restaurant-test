// Config Jest légère : on teste la logique pure (TS) en environnement node.
// Les composants React Native sont validés via TypeScript + l'app qui tourne ;
// tester le rendu RN dans un monorepo pnpm demande une config lourde (hors scope ici).
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
  // Résout les packages du workspace vers leur source TS pour qu'ils soient transformés.
  moduleNameMapper: {
    '^@ody/types$': '<rootDir>/../../packages/types/src/index.ts',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
}
