/**
 * Shared navigation regressions ported from feature/lgd-conversion@cb3c93f.
 * These exercise the current JavaScript runtime, not the LGD compiler/build.
 * Run together with every other project test using npm test.
 */
'use strict';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

const repoRoot = path.join(__dirname, '..');
const manifest = require('../package.json');

function listRuntimeFiles() {
    const files = [];
    function walk(directory) {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const full = path.join(directory, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.name.endsWith('.js')) files.push(full);
        }
    }
    walk(path.join(repoRoot, 'src'));
    files.push(path.join(repoRoot, manifest.main));
    return files;
}

function createVscodeMock() {
    const registered = new Map();
    const registrations = [];
    class Position {
        constructor(line, character) {
            this.line = line;
            this.character = character;
        }
    }
    class Selection {
        constructor(anchor, active) {
            this.anchor = anchor;
            this.active = active;
        }
    }
    class Range {
        constructor(start, end) {
            this.start = start;
            this.end = end;
        }
    }
    return {
        registered,
        registrations,
        window: {
            activeTextEditor: null,
            showInformationMessage: async () => undefined,
            showErrorMessage: async () => undefined,
            showWarningMessage: async () => undefined,
            setStatusBarMessage: () => ({ dispose() {} }),
            onDidChangeTextEditorSelection: () => ({ dispose() {} }),
            onDidChangeActiveTextEditor: () => ({ dispose() {} }),
            visibleTextEditors: [],
            showTextDocument: async (document) => ({ document })
        },
        workspace: {
            getConfiguration: () => ({ get: () => 4 }),
            openTextDocument: async (uri) => ({ uri })
        },
        Position,
        Selection,
        Range,
        Uri: { file: (fsPath) => ({ fsPath, scheme: 'file' }) },
        ViewColumn: { Beside: 2 },
        commands: {
            registerCommand(name, handler, thisArg) {
                const disposable = { dispose() {} };
                const registration = { name, handler, thisArg, disposable };
                registered.set(name, registration);
                registrations.push(registration);
                return disposable;
            },
            executeCommand: async () => undefined
        }
    };
}

function createEditor(lines, startLine = 0, startCharacter = 0) {
    const revealed = [];
    const editor = {
        document: {
            lineCount: lines.length,
            languageId: 'javascript',
            uri: { fsPath: '/test/file.js', scheme: 'file' },
            getText: () => lines.join('\n'),
            lineAt(line) {
                assert.ok(Number.isInteger(line) && line >= 0 && line < lines.length,
                    `lineAt(${line}) is outside the document`);
                const text = lines[line];
                return {
                    text,
                    isEmptyOrWhitespace: text.trim().length === 0,
                    firstNonWhitespaceCharacterIndex: text.search(/\S/) === -1
                        ? text.length : text.search(/\S/)
                };
            }
        },
        selection: new vscodeMock.Selection(
            new vscodeMock.Position(startLine, startCharacter),
            new vscodeMock.Position(startLine, startCharacter)
        ),
        revealed,
        options: { tabSize: 4 },
        revealRange(range) { revealed.push(range); }
    };
    vscodeMock.window.activeTextEditor = editor;
    return editor;
}

const vscodeMock = createVscodeMock();
const runtimeFiles = listRuntimeFiles();
const runtimeModules = new Map();
const originalLoad = Module._load;
const previousCache = new Map(Object.entries(require.cache));

// Load eagerly while the hook is installed. Commands retain this mock through
// their module closure, but neither the hook nor mocked modules leak to others.
try {
    for (const file of runtimeFiles) delete require.cache[file];
    Module._load = function (request, parent, isMain) {
        return request === 'vscode'
            ? vscodeMock : originalLoad.call(this, request, parent, isMain);
    };
    for (const file of runtimeFiles) runtimeModules.set(file, require(file));
} finally {
    Module._load = originalLoad;
    for (const file of Object.keys(require.cache)) {
        if (!previousCache.has(file)) delete require.cache[file];
    }
    for (const [file, cached] of previousCache) require.cache[file] = cached;
}
// Another test file may legitimately import a runtime helper before these tests
// execute when process isolation is disabled. Inspect restoration at its boundary.
const cacheAfterLoading = new Map(runtimeFiles.map(file => [file, require.cache[file]]));

function requireRuntime(relativePath) {
    const absolutePath = path.join(repoRoot, relativePath);
    assert.ok(runtimeModules.has(absolutePath), `runtime module was not loaded: ${relativePath}`);
    return runtimeModules.get(absolutePath);
}

beforeEach(() => {
    vscodeMock.window.activeTextEditor = null;
    vscodeMock.registered.clear();
    vscodeMock.registrations.length = 0;
});

describe('current JavaScript command modules', () => {
    it('loads every runtime module', () => {
        assert.ok(runtimeFiles.length >= 27, `expected at least 27 runtime files, got ${runtimeFiles.length}`);
        for (const file of runtimeFiles) assert.ok(runtimeModules.has(file), path.relative(repoRoot, file));
    });

    it('resolves every relative runtime require to an existing JavaScript module', () => {
        let checked = 0;
        for (const file of runtimeFiles) {
            const code = fs.readFileSync(file, 'utf8');
            const localRequire = Module.createRequire(file);
            for (const [, specifier] of code.matchAll(/require\(['"]([^'"]+)['"]\)/g)) {
                if (!specifier.startsWith('.')) continue;
                const resolved = localRequire.resolve(specifier);
                assert.equal(path.extname(resolved), '.js', `${file}: ${specifier}`);
                assert.ok(runtimeModules.has(resolved), `${file}: ${specifier} is not a current runtime module`);
                checked++;
            }
        }
        assert.ok(checked > 0, 'no relative runtime requires were checked');
    });

    it('creates and registers every command factory, including all folding levels', () => {
        const helpers = new Set([path.join(repoRoot, 'src/Commands/Folding/selectCodeFolds.js')]);
        const commands = runtimeFiles.filter(file => file !== path.join(repoRoot, manifest.main) && !helpers.has(file));
        assert.ok(commands.length >= 25);
        for (const file of commands) {
            const commandModule = runtimeModules.get(file);
            assert.equal(typeof commandModule.create, 'function', `${path.basename(file)}: missing factory`);
            const argumentsByInstance = file.endsWith(`${path.sep}BaseCommand.js`)
                ? [['test.command', 'Test']]
                : file.endsWith(`${path.sep}FoldLevelKeepComments.js`)
                    ? Array.from({ length: 8 }, (_, level) => [level]) : [[]];
            for (const args of argumentsByInstance) {
                const instance = commandModule.create(...args);
                assert.ok(instance.commandName, `${path.basename(file)}: missing commandName`);
                assert.equal(instance.command.command, instance.commandName);
                assert.ok(instance.command.title, `${path.basename(file)}: missing title`);
                assert.equal(typeof instance.createCommand, 'function');
                const disposable = instance.createCommand();
                assert.equal(typeof disposable.dispose, 'function');
                const registration = vscodeMock.registered.get(instance.commandName);
                assert.equal(registration.handler, instance.executeCommand);
                assert.equal(registration.thisArg, instance);
                assert.equal(registration.disposable, disposable);
            }
        }
    });

    it('restores the module loader and cache after loading mocks', () => {
        assert.equal(Module._load, originalLoad);
        for (const file of runtimeFiles) assert.equal(cacheAfterLoading.get(file), previousCache.get(file));
    });
});

describe('extension activation', () => {
    it('registers all 31 manifest commands exactly once with matching subscriptions', () => {
        const index = requireRuntime('index.js');
        const context = { subscriptions: [] };
        index.activate(context);
        const manifestIds = manifest.contributes.commands.map(({ command }) => command);
        assert.equal(manifestIds.length, 31);
        assert.equal(manifestIds.filter(id => /^lgd\.foldLevel[0-7]KeepComments$/.test(id)).length, 8);
        assert.equal(manifestIds.filter(id => !/^lgd\.foldLevel[0-7]KeepComments$/.test(id)).length, 23);
        assert.deepEqual([...vscodeMock.registered.keys()].sort(), [...manifestIds].sort());
        assert.equal(vscodeMock.registrations.length, 31, 'a command was registered more than once');
        assert.equal(context.subscriptions.length, 31);
        assert.equal(new Set(context.subscriptions).size, 31);
        for (const { handler, disposable } of vscodeMock.registrations) {
            assert.equal(typeof handler, 'function');
            assert.ok(context.subscriptions.includes(disposable));
        }
    });
});

describe('BaseCommand helpers', () => {
    it('findNextChar and findPreviousChar scan the document', () => {
        const BaseCommand = requireRuntime('src/Commands/BaseCommand.js');
        const { document } = createEditor(['function foo() {', '  return 1;', '}']);
        const instance = BaseCommand.create('test.command', 'Test');
        const next = instance.findNextChar(document, new vscodeMock.Position(0, 0), '}');
        assert.deepEqual({ line: next.line, character: next.character }, { line: 2, character: 0 });
        const previous = instance.findPreviousChar(document, new vscodeMock.Position(2, 1), '{');
        assert.deepEqual({ line: previous.line, character: previous.character }, { line: 0, character: 15 });
    });
});

describe('GoToNextParagraph', () => {
    it('moves the selection to the next paragraph and reveals it', async () => {
        const GoToNextParagraph = requireRuntime('src/Commands/GoToNextParagraph.js');
        const editor = createEditor(['first line', '', '   second paragraph', 'more']);
        await GoToNextParagraph.create().executeCommand();
        assert.equal(editor.selection.active.line, 2);
        assert.equal(editor.selection.active.character, 3);
        assert.equal(editor.revealed.length, 1);
        assert.equal(editor.revealed[0].start.line, 2);
    });

    it('does nothing when there is no active editor', async () => {
        const GoToNextParagraph = requireRuntime('src/Commands/GoToNextParagraph.js');
        await assert.doesNotReject(GoToNextParagraph.create().executeCommand());
    });
});

describe('GoToNextMethod', () => {
    it('detects JavaScript and C# methods and rejects non-methods', () => {
        const GoToNextMethod = requireRuntime('src/Commands/GoToNextMethod.js');
        const instance = GoToNextMethod.create();
        createEditor(['    myFunction(arg) {']);
        const lines = [];
        assert.ok(instance.getMethodJavaScript('    myFunction(arg) {', 0, lines), 'indented JS function');
        assert.ok(instance.getMethodCSharp('    public void Foo() {', 0, lines), 'indented C# method');
        assert.ok(!instance.getMethodJavaScript('    // just a comment', 0, lines), 'comment line');
        assert.ok(!instance.getMethodJavaScript('    if (x) {', 0, lines), 'control statement');
        assert.ok(!instance.getMethodJavaScript('    return 5;', 0, lines), 'return statement');
    });

    it('create() applies default command name and title', () => {
        const GoToNextMethod = requireRuntime('src/Commands/GoToNextMethod.js');
        const instance = GoToNextMethod.create();
        assert.equal(instance.commandName, 'lgd.goToNextMethod');
        assert.equal(instance.command.title, 'Go To Next Method');
    });
});

describe('MoveToNextStringChar', () => {
    it('finds the next string character from the cursor', () => {
        const MoveToNextStringChar = requireRuntime('src/Commands/Strings/MoveToNextStringChar.js');
        const { document } = createEditor(['no strings here', 'say "hi"']);
        const found = MoveToNextStringChar.findNextStringChar(document, new vscodeMock.Position(1, 0));
        assert.ok(found.stringCharPosition);
        assert.equal(found.stringCharPosition.line, 1);
        assert.equal(found.stringCharPosition.character, 5);
        assert.equal(found.openingChar, '"');
        const missing = MoveToNextStringChar.findNextStringChar(document, new vscodeMock.Position(1, 8));
        assert.equal(missing, null);
    });
});
