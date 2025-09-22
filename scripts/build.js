/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
const path = require('path');

const buildOptions = {
  entryPoints: [path.resolve(__dirname, '../src/extension.ts')],
  bundle: true,
  outfile: path.resolve(__dirname, '../out/extension.js'),
  external: ['vscode'],
  platform: 'node',
  format: 'cjs',
  sourcemap: true,
  minify: false,
  target: ['node18'],
  logLevel: 'info',
};

async function runBuild() {
  await esbuild.build(buildOptions);
}

runBuild().catch((error) => {
  console.error(error);
  process.exit(1);
});
