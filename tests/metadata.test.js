'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const manifest = require('../package.json');
const lockfile = require('../package-lock.json');

// This branch ships JavaScript directly. Keep its manifest/lock/runtime contract
// covered without asserting the conversion branch's compiler or declaration setup.
test('keeps package identity and supported engines aligned with the lockfile', () => {
    const root = lockfile.packages[''];
    assert.equal(lockfile.name, manifest.name);
    assert.equal(lockfile.version, manifest.version);
    assert.equal(root.name, manifest.name);
    assert.equal(root.version, manifest.version);
    assert.equal(root.license, manifest.license);
    assert.deepEqual(root.engines, manifest.engines);
});

test('keeps declared runtime and development dependencies aligned with the lockfile', () => {
    const root = lockfile.packages[''];
    for (const group of ['dependencies', 'devDependencies']) {
        assert.deepEqual(root[group], manifest[group]);
        for (const name of Object.keys(manifest[group])) {
            const locked = lockfile.packages[`node_modules/${name}`];
            assert.ok(locked, `${name} has no locked package`);
            assert.equal(typeof locked.version, 'string', `${name} has no locked version`);
        }
    }
});

test('declares the checked-in JavaScript entry point and unique command IDs', () => {
    assert.equal(manifest.main, 'index.js');
    const entry = path.resolve(__dirname, '..', manifest.main);
    assert.equal(require.resolve(entry), entry);
    assert.ok(fs.statSync(entry).isFile());
    const commands = manifest.contributes.commands;
    assert.equal(new Set(commands.map(({ command }) => command)).size, commands.length);
    for (const { command, title, category } of commands) {
        assert.match(command, /^lgd\./);
        assert.equal(typeof title, 'string');
        assert.ok(title.trim());
        assert.equal(category, 'LGD');
    }
});
