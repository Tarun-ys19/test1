const { spawnSync } = require('node:child_process');
const { dirname, join, resolve } = require('node:path');
const cypressCli = join(dirname(require.resolve('cypress')), 'bin', 'cypress');
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const result = spawnSync(process.execPath, [cypressCli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
  cwd: resolve(__dirname, '..'),
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
