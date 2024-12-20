import { build, emptyDir } from '@deno/dnt';

await emptyDir('./npm');

await build({
  entryPoints: [
    './src/mod.ts',
    {
      name: './middleware',
      path: './src/middleware/mod.ts',
    },
    {
      name: './response',
      path: './src/response/mod.ts',
    },
    {
      name: './server',
      path: './src/server/mod.ts',
    },
    {
      name: './url',
      path: './src/url/mod.ts',
    },
  ],
  importMap: 'deno.json',
  outDir: './npm',
  shims: {
    deno: 'dev',
  },
  test: false,
  package: {
    name: '@krutoo/fetch-tools',
    version: Deno.args[0] ?? '0.0.0',
    description: 'Set of utilities for JS fetch function',
    author: 'Dmitry Petrov',
    license: 'Apache-2.0',
    repository: {
      type: 'git',
      url: 'git+https://github.com/krutoo/fetch-tools.git',
    },
    bugs: {
      url: 'https://github.com/krutoo/fetch-tools/issues',
    },
  },
  compilerOptions: {
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
  },
});

await Deno.copyFile('README.md', './npm/README.md');
await Deno.copyFile('LICENSE', './npm/LICENSE');
