const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const originalLoad = Module._load;
const calls = [];
const warnings = [];
const information = [];
const vscode = {window:{},commands:{}};
const commandPath = require.resolve('../../src/Commands/Folding/FoldLevelKeepComments');
const basePath = require.resolve('../../src/Commands/BaseCommand');
const previousCache = new Map([commandPath, basePath].map(path => [path, require.cache[path]]));
let FoldLevel;
try {
 for (const path of previousCache.keys()) delete require.cache[path];
 Module._load = function(name, ...rest) {return name === 'vscode' ? vscode : originalLoad.call(this, name, ...rest);};
 FoldLevel = require(commandPath);
} finally {
 Module._load = originalLoad;
 for (const [path, cached] of previousCache) {
  if (cached) require.cache[path] = cached;
  else delete require.cache[path];
 }
}
let editor;
beforeEach(() => {
 calls.length=0; warnings.length=0; information.length=0;
 editor={document:{uri:'file:///example.js',version:1,isClosed:false,languageId:'javascript',getText:()=> '/** docs\n */\nfunction run() {\n  work();\n}\n'},selections:[{start:{line:5}}]};
 vscode.window.activeTextEditor=editor;
 vscode.window.showWarningMessage=message=>warnings.push(message);
 vscode.window.showInformationMessage=message=>information.push(message);
 vscode.commands.executeCommand=async (id,args)=>{calls.push([id,args]);if(id==='vscode.executeFoldingRangeProvider')return [{start:0,end:1,kind:1},{start:2,end:3}];};
});
test('folds exact code lines idempotently without moving selection or unfolding', async()=> {
 const cmd=FoldLevel.create(1); await cmd.executeCommand(); await cmd.executeCommand();
 assert.deepEqual(calls.filter(([id])=>id==='editor.fold'),[['editor.fold',{selectionLines:[2],levels:1,direction:'down'}],['editor.fold',{selectionLines:[2],levels:1,direction:'down'}]]);
 assert.equal(editor.selections[0].start.line,5);
});
test('no active editor is a no-op',async()=>{vscode.window.activeTextEditor=undefined;await FoldLevel.create(1).executeCommand();assert.deepEqual(calls,[]);});
test('empty/undefined provider results never fold cursor parent',async()=>{vscode.commands.executeCommand=async()=>undefined;await FoldLevel.create(1).executeCommand();assert.deepEqual(calls,[]);});
test('typing during provider request discards stale ranges',async()=>{const original=vscode.commands.executeCommand;vscode.commands.executeCommand=async(...args)=>{const ranges=await original(...args);editor.document.version++;return ranges;};await FoldLevel.create(1).executeCommand();assert.equal(calls.length,1);});
test('switching editor during provider request does not fold new editor',async()=>{const original=vscode.commands.executeCommand;vscode.commands.executeCommand=async(...args)=>{const ranges=await original(...args);vscode.window.activeTextEditor={};return ranges;};await FoldLevel.create(1).executeCommand();assert.equal(calls.length,1);});
test('closed documents do not fold',async()=>{editor.document.isClosed=true;await FoldLevel.create(1).executeCommand();assert.equal(calls.length,1);});
test('cursor inside selected fold is excluded like native fold level',async()=>{editor.selections=[{start:{line:3}}];await FoldLevel.create(1).executeCommand();assert.equal(calls.length,1);});
test('provider failures are reported without fallback folding',async()=>{vscode.commands.executeCommand=async()=>{throw new Error('provider failed');};await FoldLevel.create(1).executeCommand();assert.deepEqual(warnings,['Could not fold level 1: provider failed']);});
test('all eight commands are contributed and activated with no default shortcuts',()=>{
 const manifest=require('../../package.json');
 for(let level=0;level<=7;level++){const command=FoldLevel.create(level);assert.ok(manifest.contributes.commands.some(({command:id})=>id===command.commandName));assert.ok(manifest.activationEvents.includes('onCommand:'+command.commandName));}
 assert.equal(manifest.contributes.keybindings,undefined);
});

test('level 0 invokes the same outermost code folds as level 1', async()=> {
 await FoldLevel.create(0).executeCommand(); await FoldLevel.create(1).executeCommand();
 assert.deepEqual(calls.filter(([id])=>id==='editor.fold'),[['editor.fold',{selectionLines:[2],levels:1,direction:'down'}],['editor.fold',{selectionLines:[2],levels:1,direction:'down'}]]);
});

test('loading command mocks restores the module loader and original cache',()=> {
 assert.equal(Module._load,originalLoad);
 for (const [path,cached] of previousCache) assert.equal(require.cache[path],cached);
});

test('unsupported languages are explicitly disabled rather than folding untyped docs',async()=> {
 for(const language of ['csharp','c','cpp','python','plaintext']) {
  editor.document.languageId=language;
  await FoldLevel.create(1).executeCommand();
 }
 assert.deepEqual(calls,[]);
 assert.equal(information.length,5);
});
test('normalized selection start governs exclusions regardless of active endpoint',async()=> {
 for (const activeLine of [0,3]) {
  calls.length=0;
  editor.selections=[{start:{line:0},active:{line:activeLine}}];
  await FoldLevel.create(1).executeCommand();
  assert.deepEqual(calls.filter(([id])=>id==='editor.fold'),[['editor.fold',{selectionLines:[2],levels:1,direction:'down'}]]);
 }
 editor.selections=[{start:{line:3},active:{line:5}}];
 calls.length=0;
 await FoldLevel.create(1).executeCommand();
 assert.equal(calls.length,1);
});
test('folding commands are enabled only for supported JavaScript-family editors',()=> {
 const commands=require('../../package.json').contributes.commands.filter(c=>c.command.startsWith('lgd.foldLevel'));
 assert.equal(commands.length,8);
 for(const command of commands)assert.equal(command.enablement,'editorLangId =~ /^(javascript|javascriptreact|typescript|typescriptreact)$/');
});

test('language-mode changes during provider request discard stale ranges',async()=> {
 const original=vscode.commands.executeCommand;
 vscode.commands.executeCommand=async(...args)=> {
  const ranges=await original(...args);
  editor.document.languageId='typescript';
  return ranges;
 };
 await FoldLevel.create(1).executeCommand();
 assert.equal(editor.document.version,1);
 assert.equal(calls.length,1);
});
