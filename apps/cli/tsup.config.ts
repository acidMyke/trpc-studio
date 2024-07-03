import { defineConfig } from 'tsup';

export default defineConfig({
  target: 'es2022',
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['cjs'],
  sourcemap: true,
  clean: true,
  external: ['esbuild', 'esbuild-register', 'tsup'],
});
