const assert = require('node:assert/strict');
const { test } = require('node:test');
const manifest = require('../package.json');
const lockfile = require('../package-lock.json');

test('keeps the packaged VS Code baseline aligned with locked declaration types', () => {
  const declarationVersion = manifest.devDependencies['@types/vscode'];

  assert.equal(manifest.engines.vscode, `^${declarationVersion}`);
  assert.equal(lockfile.packages[''].engines.vscode, manifest.engines.vscode);
  assert.equal(lockfile.packages[''].devDependencies['@types/vscode'], declarationVersion);
  assert.equal(lockfile.packages['node_modules/@types/vscode'].version, declarationVersion);
});
