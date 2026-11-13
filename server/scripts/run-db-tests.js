const path = require('node:path');
const { spawnSync } = require('node:child_process');
const server = path.resolve(__dirname, '..');
const mode = process.argv[2];
const args = mode === 'api' ? ['--test', path.join(server, 'test/phase0.test.js')]
    : mode === 'ui' ? [path.resolve(server, '../client/scripts/ui-smoke.mjs')] : null;
if (!args) {
    console.error('Choose api or ui.');
    process.exitCode = 1;
} else {
    const result = spawnSync(process.execPath, args, {
        cwd: server, env: { ...process.env, DORMIFY_DB_TESTS: '1' },
        stdio: 'inherit', windowsHide: true,
    });
    if (result.error) console.error('Unable to start database tests.');
    process.exitCode = result.status ?? 1;
}
