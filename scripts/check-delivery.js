// Read-only check of tracked and non-ignored files. Never print matched secret values.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
    if (result.status !== 0) throw Error('Git inspection failed.');
    return result.stdout;
};
const failures = [];
try {
    const files = [...new Set(git('ls-files', '-z', '--cached', '--others', '--exclude-standard').split('\0').filter(Boolean))];
    const patterns = [
        /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
        /gh[pousr]_[A-Za-z0-9]{30,}/,
        /github_pat_[A-Za-z0-9_]{50,}/,
        /AKIA[0-9A-Z]{16}/,
    ];
    let checked = 0;
    for (const file of files) {
        const full = path.join(root, file);
        if (!fs.existsSync(full) || !fs.statSync(full).isFile()) continue;
        if (/(^|\/)\.env(?:\.|$)/.test(file) && !file.endsWith('.env.example')) failures.push(file + ': environment file would be delivered');
        if (/\.(db(?:-wal|-shm|-journal)?|sql\.gz|dump|pem|p12|pfx)$/i.test(file) || (/\.sql$/i.test(file) && !file.startsWith('server/prisma/migrations/'))) failures.push(file + ': private database/key artifact');
        if (/(^|\/)(node_modules|dist|\.ui-artifacts|\.git-backups)\//.test(file)) failures.push(file + ': generated/private directory');
        const buffer = fs.readFileSync(full);
        if (buffer.includes(0) || buffer.length > 2 * 1024 * 1024) continue;
        if (patterns.some(pattern => pattern.test(buffer.toString('utf8')))) failures.push(file + ': possible secret (value hidden)');
        checked++;
    }
    for (const directory of ['', 'server', 'client']) {
        const folder = path.join(root, directory), manifest = JSON.parse(fs.readFileSync(path.join(folder, 'package.json')));
        const lock = JSON.parse(fs.readFileSync(path.join(folder, 'package-lock.json')));
        for (const group of ['dependencies', 'devDependencies']) {
            const expected = manifest[group] || {}, actual = lock.packages?.['']?.[group] || {};
            if ([...new Set([...Object.keys(expected), ...Object.keys(actual)])].some(name => expected[name] !== actual[name])) failures.push((directory || 'root') + ': manifest/lockfile dependencies differ');
        }
    }
    const ignored = spawnSync('git', ['check-ignore', '.env', 'server/.env', 'client/.env', 'client/.ui-artifacts/private-check.txt'], { cwd: root, encoding: 'utf8', windowsHide: true });
    if (ignored.status !== 0 || ignored.stdout.trim().split(/\r?\n/).length !== 4) failures.push('Environment/artifact ignore rules need inspection');
    if (failures.length) { failures.forEach(line => console.error(line)); process.exitCode = 1; }
    else console.log(`Delivery checks passed: ${checked} text files; 3 lockfiles; environment/artifact ignore rules. No files changed.`);
    console.log('This check does not inspect Git history, verify every secret type, test a different computer, or publish anything.');
} catch { console.error('Delivery check could not finish. Inspect Git access and manifest/lockfiles.'); process.exitCode = 1; }
