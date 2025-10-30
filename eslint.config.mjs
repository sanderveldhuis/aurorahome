// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { files: ['**/*.{ts,tsx,cts,mts,js,cjs,mjs}'] },
  { ignores: ['output', 'node_modules'] },
  {
    extends: [eslint.configs.recommended, ...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    files: ['backend/workers/**'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['./backend/workers/tsconfig-eslint.json']
      }
    }
  }
);
