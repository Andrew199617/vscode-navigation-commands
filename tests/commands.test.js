/**
 * Dependency-free tests for the LGD-converted navigation commands.
 * Run with: node --test tests/
 * The vscode module is mocked via a Module._load hook before any command loads.
 */
'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const Module = require('module');

const repoRoot = path.join(__dirname, '..');

/** Minimal in-memory vscode mock. */
function createVscodeMock()
{
    const registered = new Map();

    class Position
    {
        constructor(line, character)
        {
            this.line = line;
            this.character = character;
        }
    }

    class Selection
    {
        constructor(anchor, active)
        {
            this.anchor = anchor;
            this.active = active;
        }
    }

    class Range
    {
        constructor(start, end)
        {
            this.start = start;
            this.end = end;
        }
    }

    const mock = {
        registered,
        window: {
            activeTextEditor: null,
            showInformationMessage: () => Promise.resolve(),
            showErrorMessage: () => Promise.resolve(),
            setStatusBarMessage: () => ({ dispose() {} }),
            onDidChangeTextEditorSelection: () => ({ dispose() {} }),
            onDidChangeActiveTextEditor: () => ({ dispose() {} }),
            visibleTextEditors: [],
            showTextDocument: async (doc) => ({ document: doc })
        },
        workspace: {
            getConfiguration: () => ({ get: () => 4 }),
            openTextDocument: async (uri) => ({ uri })
        },
        Position,
        Selection,
        Range,
        Uri: {
            file: (fsPath) => ({ fsPath, scheme: 'file' })
        },
        ViewColumn: { Beside: 2 },
        commands: {
            registerCommand: (name, handler) =>
            {
                registered.set(name, handler);
                return { dispose() {} };
            },
            executeCommand: async () => undefined
        }
    };

    return mock;
}

/** Builds a fake text editor over the given lines. */
function createEditor(mock, lines, startLine = 0, startCharacter = 0)
{
    const revealed = [];
    const editor = {
        document: {
            lineCount: lines.length,
            languageId: 'javascript',
            uri: { fsPath: '/test/file.js', scheme: 'file' },
            lineAt: (line) =>
            {
                const text = lines[line];
                return {
                    text,
                    isEmptyOrWhitespace: text.trim().length === 0,
                    firstNonWhitespaceCharacterIndex: text.search(/\S/)
                };
            }
        },
        selection: new mock.Selection(
            new mock.Position(startLine, startCharacter),
            new mock.Position(startLine, startCharacter)
        ),
        revealed,
        options: { tabSize: 4 },
        revealRange(range)
        {
            revealed.push(range);
        }
    };
    mock.window.activeTextEditor = editor;
    return editor;
}

let vscodeMock;

before(() =>
{
    vscodeMock = createVscodeMock();
    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain)
    {
        if(request === 'vscode')
        {
            return vscodeMock;
        }

        return originalLoad.call(this, request, parent, isMain);
    };
});

function requireLgd(relativePath)
{
    return require(path.join(repoRoot, relativePath));
}

function listGeneratedFiles()
{
    const files = [];
    const walk = (directory) =>
    {
        for(const entry of fs.readdirSync(directory, { withFileTypes: true }))
        {
            const full = path.join(directory, entry.name);
            if(entry.isDirectory())
            {
                walk(full);
            }
            else if(entry.name.endsWith('.lgd.js'))
            {
                files.push(full);
            }
        }
    };
    walk(path.join(repoRoot, 'src'));
    files.push(path.join(repoRoot, 'index.lgd.js'));
    return files;
}

describe('converted command modules', () =>
{
    it('loads every generated .lgd.js module', () =>
    {
        const files = listGeneratedFiles();
        assert.ok(files.length >= 24, `expected at least 24 generated files, got ${files.length}`);
        for(const file of files)
        {
            assert.doesNotThrow(() => require(file), `failed to load ${path.relative(repoRoot, file)}`);
        }
    });

    it('all runtime requires resolve to dotted .lgd.js outputs', () =>
    {
        for(const file of listGeneratedFiles())
        {
            const code = fs.readFileSync(file, 'utf8');
            const requires = [...code.matchAll(/require\(['"]([^'"]+)['"]\)/g)].map((match) => match[1]);
            for(const specifier of requires)
            {
                if(specifier.startsWith('.'))
                {
                    assert.ok(
                        specifier.endsWith('.lgd.js'),
                        `${path.relative(repoRoot, file)} has non-dotted relative require: ${specifier}`
                    );
                }
            }
        }
    });

    it('create() produces a registered command object for every command', () =>
    {
        const files = listGeneratedFiles().filter((file) => !file.endsWith('index.lgd.js'));
        for(const file of files)
        {
            const commandModule = require(file);
            // BaseCommand.create requires explicit arguments; the rest default.
            const instance = file.endsWith('BaseCommand.lgd.js')
                ? commandModule.create('test.command', 'Test')
                : commandModule.create();
            assert.ok(instance.commandName, `${path.basename(file)}: missing commandName`);
            assert.ok(instance.command, `${path.basename(file)}: missing command`);
            assert.equal(typeof instance.createCommand, 'function');
            const disposable = instance.createCommand();
            assert.ok(disposable && typeof disposable.dispose === 'function');
        }
    });
});

describe('extension activation', () =>
{
    it('registers 23 commands and 23 subscriptions', () =>
    {
        vscodeMock.registered.clear();
        const index = requireLgd('index.lgd.js');
        const context = { subscriptions: [] };
        index.activate(context);
        assert.equal(vscodeMock.registered.size, 23);
        assert.equal(context.subscriptions.length, 23);
        assert.ok(vscodeMock.registered.has('lgd.goToNextParagraph'));
        assert.ok(vscodeMock.registered.has('lgd.goToNextMethod'));
    });
});

describe('BaseCommand helpers', () =>
{
    it('findNextChar and findPreviousChar scan the document', () =>
    {
        const BaseCommand = requireLgd('src/Commands/BaseCommand.lgd.js');
        const lines = ['function foo() {', '  return 1;', '}'];
        const document = {
            lineCount: lines.length,
            lineAt: (line) => ({ text: lines[line] })
        };
        const instance = BaseCommand.create('test.command', 'Test');

        const next = instance.findNextChar(document, new vscodeMock.Position(0, 0), '}');
        assert.deepEqual({ line: next.line, character: next.character }, { line: 2, character: 0 });

        const previous = instance.findPreviousChar(document, new vscodeMock.Position(2, 1), '{');
        assert.deepEqual({ line: previous.line, character: previous.character }, { line: 0, character: 15 });
    });
});

describe('GoToNextParagraph', () =>
{
    it('moves the selection to the next paragraph and reveals it', async () =>
    {
        const GoToNextParagraph = requireLgd('src/Commands/GoToNextParagraph.lgd.js');
        const editor = createEditor(vscodeMock, ['first line', '', '   second paragraph', 'more'], 0, 0);

        await GoToNextParagraph.create().executeCommand();

        assert.equal(editor.selection.active.line, 2);
        assert.equal(editor.selection.active.character, 3);
        assert.equal(editor.revealed.length, 1);
        assert.equal(editor.revealed[0].start.line, 2);
    });

    it('does nothing when there is no active editor', async () =>
    {
        const GoToNextParagraph = requireLgd('src/Commands/GoToNextParagraph.lgd.js');
        vscodeMock.window.activeTextEditor = null;
        await assert.doesNotReject(GoToNextParagraph.create().executeCommand());
    });
});

describe('GoToNextMethod', () =>
{
    it('detects JavaScript and C# methods and rejects non-methods', () =>
    {
        const GoToNextMethod = requireLgd('src/Commands/GoToNextMethod.lgd.js');
        const instance = GoToNextMethod.create();
        createEditor(vscodeMock, ['    myFunction(arg) {']);
        const lines = [];

        assert.ok(instance.getMethodJavaScript('    myFunction(arg) {', 0, lines), 'indented JS function');
        assert.ok(instance.getMethodCSharp('    public void Foo() {', 0, lines), 'indented C# method');
        assert.ok(!instance.getMethodJavaScript('    // just a comment', 0, lines), 'comment line');
        assert.ok(!instance.getMethodJavaScript('    if (x) {', 0, lines), 'control statement');
        assert.ok(!instance.getMethodJavaScript('    return 5;', 0, lines), 'return statement');
    });

    it('create() applies default command name and title', () =>
    {
        const GoToNextMethod = requireLgd('src/Commands/GoToNextMethod.lgd.js');
        const instance = GoToNextMethod.create();
        assert.equal(instance.commandName, 'lgd.goToNextMethod');
        assert.equal(instance.command.title, 'Go To Next Method');
    });
});

describe('MoveToNextStringChar', () =>
{
    it('finds the next string character from the cursor', () =>
    {
        const MoveToNextStringChar = requireLgd('src/Commands/Strings/MoveToNextStringChar.lgd.js');
        const document = {
            lineCount: 2,
            lineAt: (line) => ({ text: ['no strings here', 'say \"hi\"'][line] })
        };

        const found = MoveToNextStringChar.findNextStringChar(
            document,
            new vscodeMock.Position(1, 0)
        );
        assert.ok(found.stringCharPosition);
        assert.equal(found.stringCharPosition.line, 1);
        assert.equal(found.stringCharPosition.character, 5);
        assert.equal(found.openingChar, '"');

        const missing = MoveToNextStringChar.findNextStringChar(
            document,
            new vscodeMock.Position(1, 8)
        );
        assert.equal(missing, null);
    });
});
