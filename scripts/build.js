/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
const path = require('path');

const watch = process.argv.includes('--watch');

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
  logLevel: 'info'
};

async function runBuild() {
  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    // eslint-disable-next-line no-console
    console.log('🛠️ esbuild 正在监听源码变更...');
  } else {
    await esbuild.build(buildOptions);
  }
}

runBuild().catch((error) => {
  console.error(error);
  process.exit(1);
});
