'use strict';

// This entry point deliberately is not named *.test.js: it requires the real
// extension-host `vscode` module and must not be imported by node --test.
const assert = require('node:assert/strict');
const vscode = require('vscode');

const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const POLL_INTERVAL = 100;
const STABLE_FOR = 400;

async function pollUntilStable(description, read, matches, timeout = 15000) {
    const deadline = Date.now() + timeout;
    let previous;
    let stableSince;
    let last;
    while (Date.now() < deadline) {
        last = await read();
        const serialized = JSON.stringify(last);
        if (matches(last)) {
            if (serialized !== previous || stableSince === undefined) stableSince = Date.now();
            if (Date.now() - stableSince >= STABLE_FOR) return last;
        } else {
            stableSince = undefined;
        }
        previous = serialized;
        await pause(POLL_INTERVAL);
    }
    assert.fail(`${description} did not reach a stable expected state. Last state: ${JSON.stringify(last)}`);
}

function editorState(editor) {
    const ranges = editor.visibleRanges.map(range => [range.start.line, range.end.line]);
    return {
        ranges,
        visible: Array.from({ length: editor.document.lineCount }, (_, line) =>
            ranges.some(([start, end]) => line >= start && line <= end)),
        selection: editor.selections.map(selection => [
            selection.anchor.line, selection.anchor.character,
            selection.active.line, selection.active.character
        ]),
        active: vscode.window.activeTextEditor === editor
    };
}

function visibleAfterFolding(document, providerRanges, foldStarts) {
    const visible = Array(document.lineCount).fill(true);
    // The expected headers are fixture-specific, not calculated by the runtime
    // selector under test. Only provider end boundaries come from the real host.
    for (const start of foldStarts) {
        const range = providerRanges.find(range => range.start === start);
        assert.ok(range, `Missing expected provider range at line ${start}`);
        for (let line = start + 1; line <= range.end; line++) visible[line] = false;
    }
    return visible;
}

async function expectVisible(fixture, expected, description) {
    const state = await pollUntilStable(description, () => editorState(fixture.editor), state =>
        state.active && state.visible[0] && state.visible.at(-1) &&
        state.visible.every((visible, line) => visible === expected[line]) &&
        JSON.stringify(state.selection) === JSON.stringify(fixture.selection));
    // Requiring both first and last lines on screen prevents treating scrolling
    // or an undersized viewport as folding. All fixtures are at most 28 lines.
    assert.equal(fixture.document.getText(), fixture.source, `${description}: changed source`);
    assert.equal(fixture.document.version, fixture.version, `${description}: changed document version`);
    assert.equal(fixture.document.isDirty, false, `${description}: dirtied the document`);
    return state;
}

async function openFixture(filename, languageId = 'javascript', strategy = 'auto') {
    const folder = vscode.workspace.workspaceFolders?.[0];
    assert.ok(folder, 'The launcher must provide an isolated fixture workspace');
    let document = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(folder.uri, filename));
    if (document.languageId !== languageId) {
        document = await vscode.languages.setTextDocumentLanguage(document, languageId);
    }
    await vscode.workspace.getConfiguration('editor', document.uri)
        .update('foldingStrategy', strategy, vscode.ConfigurationTarget.Workspace);
    const editor = await vscode.window.showTextDocument(document, { preview: false });
    await vscode.commands.executeCommand('workbench.action.closePanel');
    await vscode.commands.executeCommand('workbench.action.closeSidebar');
    // The first line is a viewport anchor outside every provider folding range.
    editor.selection = new vscode.Selection(0, 0, 0, 0);
    const fixture = {
        document, editor, source: document.getText(), version: document.version,
        selection: [[0, 0, 0, 0]]
    };
    await reset(fixture);
    return fixture;
}

async function reset(fixture) {
    await vscode.commands.executeCommand('editor.unfoldAll');
    fixture.editor.revealRange(new vscode.Range(0, 0, 0, 0), vscode.TextEditorRevealType.AtTop);
    await expectVisible(fixture, Array(fixture.document.lineCount).fill(true), 'fully unfolded fixture');
}

async function providerRanges(fixture, expectedStarts, optionalStarts = []) {
    return pollUntilStable('real JavaScript/TypeScript provider ranges', async () => {
        const ranges = await vscode.commands.executeCommand('vscode.executeFoldingRangeProvider', fixture.document.uri);
        return (ranges || []).map(range => ({ start: range.start, end: range.end }))
            .sort((a, b) => a.start - b.start || b.end - a.end);
    }, ranges =>
        JSON.stringify(ranges.map(range => range.start).filter(start => !optionalStarts.includes(start))) ===
            JSON.stringify(expectedStarts) &&
        optionalStarts.every(start => ranges.filter(range => range.start === start).length <= 1), 30000);
}

function assertNested(ranges, parentStart, childStart) {
    const parent = ranges.find(range => range.start === parentStart);
    const child = ranges.find(range => range.start === childStart);
    assert.ok(parent && child && parent.start < child.start && child.end <= parent.end,
        `Expected actual provider range ${childStart} inside ${parentStart}: ${JSON.stringify(ranges)}`);
}

async function foldAndCheck(fixture, command, ranges, foldStarts) {
    const expected = visibleAfterFolding(fixture.document, ranges, foldStarts);
    await vscode.commands.executeCommand(command);
    return expectVisible(fixture, expected, command);
}

async function compareNativeAndCustom(fixture, ranges, level, nativeStarts, customStarts) {
    await reset(fixture);
    const native = await foldAndCheck(fixture, `editor.foldLevel${level}`, ranges, nativeStarts);
    await reset(fixture);
    const command = `lgd.foldLevel${level}KeepComments`;
    const custom = await foldAndCheck(fixture, command, ranges, customStarts);
    assert.notDeepEqual(custom.visible, native.visible, 'The native/custom comparison must expose documentation differences');
    // The exact visibility mask detects folding a containing class/object on a
    // repeated invocation, even when the intended method was already collapsed.
    for (let repetition = 0; repetition < 2; repetition++) {
        const repeated = await foldAndCheck(fixture, command, ranges, customStarts);
        assert.deepEqual(repeated, custom, `${command}: repeated invocation changed folding/selection`);
    }
    return custom;
}

async function nestedDeclarations(languageId, strategy) {
    const fixture = await openFixture('nested.js', languageId, strategy);
    const ranges = await providerRanges(fixture, [1, 4, 5, 8, 9, 14, 17]);
    assertNested(ranges, 4, 5); // Member documentation is a real level-2 range.
    assertNested(ranges, 4, 8); // Method body is also level 2.
    assertNested(ranges, 8, 9); // Control flow is level 3, not another method.
    const level1 = await compareNativeAndCustom(fixture, ranges, 1, [1, 4, 14, 17], [4, 17]);
    assert.ok(level1.visible[2] && level1.visible[15], 'Outermost documentation must remain readable');
    assert.equal(level1.visible[18], false, 'Top-level function code must collapse');
    const level2 = await compareNativeAndCustom(fixture, ranges, 2, [5, 8], [8]);
    assert.ok(level2.visible[6], 'Member documentation must remain readable');
    assert.ok(level2.visible[5] && level2.visible[12], 'The containing class must remain expanded');
    assert.equal(level2.visible[10], false, 'Nested method code must collapse');
    assert.ok(level2.visible[18], 'A top-level function is not a level-2 fold');
}

async function exportedDeclarations() {
    const fixture = await openFixture('exports.js');
    // Some TypeScript provider versions omit only the documentation range just
    // before an anonymous default export. Code headers and all other comments
    // remain mandatory; never invent a native fold the provider did not return.
    const ranges = await providerRanges(fixture, [1, 4, 5, 9, 12, 18, 19, 22], [15]);
    assertNested(ranges, 4, 5);
    assertNested(ranges, 18, 19);
    assertNested(ranges, 18, 22);
    assert.ok(ranges.find(range => range.start === 4).end < 12, 'Exports must have distinct outermost ranges');
    assert.ok(ranges.find(range => range.start === 12).end < 18, 'Exported function must not contain the default export');
    const nativeStarts = [1, 4, 9, 12, 15, 18].filter(start =>
        start !== 15 || ranges.some(range => range.start === 15));
    const level1 = await compareNativeAndCustom(fixture, ranges, 1, nativeStarts, [4, 12, 18]);
    await reset(fixture);
    const level0 = await foldAndCheck(fixture, 'lgd.foldLevel0KeepComments', ranges, [4, 12, 18]);
    assert.deepEqual(level0, level1, 'Level 0 must be exactly the outermost Level 1 alias');
    for (let repetition = 0; repetition < 2; repetition++) {
        assert.deepEqual(await foldAndCheck(fixture, 'lgd.foldLevel0KeepComments', ranges, [4, 12, 18]), level0);
    }
    assert.ok(level0.visible[2] && level0.visible[10] && level0.visible[16], 'All exported declaration documentation must remain readable');
    for (const line of [6, 13, 23]) assert.equal(level0.visible[line], false, `Exported code line ${line} must collapse`);
    await reset(fixture);
    await foldAndCheck(fixture, 'lgd.foldLevel2KeepComments', ranges, [5, 22]);
}

async function sameLineDeclarations() {
    const fixture = await openFixture('same-line.js');
    // VS Code permits one folding header per line. The outer/inner functions
    // share line 1, so the nested if at line 2 is native Level 2, not Level 3.
    const ranges = await providerRanges(fixture, [1, 2]);
    assertNested(ranges, 1, 2);
    await foldAndCheck(fixture, 'editor.foldLevel2', ranges, [2]);
    const native = editorState(fixture.editor);
    await reset(fixture);
    const custom = await foldAndCheck(fixture, 'lgd.foldLevel2KeepComments', ranges, [2]);
    assert.deepEqual(custom, native, 'Same-line declarations must preserve real native nesting levels');
    for (let repetition = 0; repetition < 2; repetition++) {
        assert.deepEqual(await foldAndCheck(fixture, 'lgd.foldLevel2KeepComments', ranges, [2]), custom);
    }
    assert.ok(custom.visible[5] && custom.visible[7], 'Repeating Level 2 must not collapse either parent function');
    assert.equal(custom.visible[3], false, 'The actual Level-2 if body must be collapsed');
}

exports.run = async function run() {
    const extension = vscode.extensions.getExtension('learn-game-development.vscode-navigation-commands');
    assert.ok(extension, 'The extension under development is missing from this real VS Code host');
    await extension.activate();
    const typescript = vscode.extensions.getExtension('vscode.typescript-language-features');
    assert.ok(typescript, 'The built-in TypeScript/JavaScript folding provider is required');
    await typescript.activate();
    const commands = await vscode.commands.getCommands(true);
    for (let level = 0; level <= 7; level++) {
        assert.ok(commands.includes(`lgd.foldLevel${level}KeepComments`), `Level ${level} was not registered in the real host`);
    }
    console.log(`Running real folding tests in VS Code ${vscode.version}`);
    const cases = [];
    for (const languageId of ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']) {
        for (const strategy of ['auto', 'indentation']) {
            cases.push([`${languageId}/${strategy}: native vs keep-comments levels 1 and 2, repeated invocation`,
                () => nestedDeclarations(languageId, strategy)]);
        }
    }
    cases.push(['exports: native comparison, outermost Level 0 alias, and nested members', exportedDeclarations]);
    cases.push(['same-line declarations: actual sanitized provider nesting and idempotence', sameLineDeclarations]);
    for (const [name, test] of cases) {
        try {
            await test();
            console.log(`PASS ${name}`);
        } catch (error) {
            console.error(`FAIL ${name}`);
            throw error;
        } finally {
            await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        }
    }
    console.log(`Passed ${cases.length} real VS Code host folding scenarios`);
};
