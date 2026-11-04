import { build } from 'esbuild';

await build({
  entryPoints: ['dist/serverless.js'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  outfile: 'dist/serverless.cjs',
  logLevel: 'info',
  define: {
    'import.meta.url': 'import_meta_url',
  },
  banner: {
    js: 'const import_meta_url = require("node:url").pathToFileURL(__filename).href;',
  },
  external: [
    '@nestjs/microservices',
    '@nestjs/websockets',
    '@nestjs/platform-socket.io',
    '@apollo/subgraph',
    '@apollo/gateway',
    '@as-integrations/fastify',
    'class-transformer',
    'class-validator',
    'pg-native',
    'ts-morph',
  ],
});
