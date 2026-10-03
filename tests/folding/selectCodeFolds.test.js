const { test } = require('node:test');
const assert = require('node:assert/strict');
const { selectCodeFolds } = require('../../src/Commands/Folding/selectCodeFolds');
const comment = 1;
const source = [
  '/** Module documentation', ' * Keep this visible.', ' */',
  'class Example {',
  '  /** Method documentation', '   * Keep this visible at level 2.', '   */',
  '  run() {', '    if (true) {', '      action();', '    }', '  }',
  '  other() {', '    action();', '  }', '}',
  'const object = {', '  run() {', '    action();', '  }', '};',
  'function topLevel() {', '  action();', '}', ''
].join('\n');
const ranges = [
  {start: 0,end: 2,kind: comment}, {start: 3,end: 14},
  {start: 4,end: 6,kind: comment}, {start: 7,end: 10},
  {start: 8,end: 9}, {start: 12,end: 13},
  {start: 16,end: 19}, {start: 17,end: 18}, {start: 21,end: 22}
];
const choose = (level, more = {}, input = ranges) => selectCodeFolds(input, {level,text:source,languageId:'javascript',...more});
test('level 1 preserves classes, functions, objects while excluding comments', () => assert.deepEqual(choose(1), [3,16,21]));
test('level 2 preserves nested methods but not their JSDoc', () => assert.deepEqual(choose(2), [7,12,17]));
test('level 3 includes nested control flow instead of assuming method depth', () => assert.deepEqual(choose(3), [8]));
test('cursor-containing folds are excluded, including range header/end', () => assert.deepEqual(choose(2,{blockedLines:[7,13]}), [17]));
test('unsorted provider ranges are handled without changing input', () => {
 const copy=ranges.slice().reverse(); const before=copy.slice(); assert.deepEqual(choose(2,{},copy),[7,12,17]); assert.deepEqual(copy,before);
});
test('indentation ranges with no kind still preserve JavaScript JSDoc', () => assert.deepEqual(choose(2,{},ranges.map(({start,end})=>({start,end}))),[7,12,17]));
test('comment regions still count toward native nesting depth', () => {
 const nested=[{start:0,end:10,kind:comment},{start:3,end:8},{start:5,end:7}];
 assert.deepEqual(choose(1,{},nested),[]); assert.deepEqual(choose(2,{},nested),[3]); assert.deepEqual(choose(3,{},nested),[5]);
});
test('comment-like text in strings, templates and regex is not filtered', () => {
 const text='const pattern = /[/*]+/;\nconst value = `\n/** not a comment\n * template text\n */\n`;\n';
 assert.deepEqual(selectCodeFolds([{start:2,end:4}],{level:1,text,languageId:'javascript'}),[2]);
});
test('template expression comments are distinguished from template text', () => {
 const text='const value = `${\n/** real comment\n * inside expression\n */\nmakeValue()\n}`;\n';
 assert.deepEqual(selectCodeFolds([{start:1,end:3}],{level:1,text,languageId:'javascript'}),[]);
});
test('consecutive line comments are skipped but region containing code remains', () => {
 const text='// one\n// two\n// three\n// #region code\nrun();\n// #endregion\n';
 assert.deepEqual(selectCodeFolds([{start:0,end:2},{start:3,end:5,kind:{value:'region'}}],{level:1,text,languageId:'javascript'}),[3]);
});
test('inline comment at code start does not remove a valid code region', () => {
 const text='/* note */ function run() {\n  action();\n}\n';
 assert.deepEqual(selectCodeFolds([{start:0,end:1}],{level:1,text,languageId:'javascript'}),[0]);
});
test('typed comments in other languages are preserved without JS parsing', () => assert.deepEqual(choose(1,{languageId:'csharp'}),[3,16,21]));
test('malformed JavaScript never classifies unscanned remainder as comments', () => {
 const text='"unterminated\n/** could be text\nvalue\n';
 assert.deepEqual(selectCodeFolds([{start:1,end:2}],{level:1,text,languageId:'javascript'}),[1]);
});
test('undefined provider result does nothing', () => assert.deepEqual(selectCodeFolds(undefined,{level:1,text:source,languageId:'javascript'}),[]));
test('null or empty provider result does nothing', () => {assert.deepEqual(choose(1,{},null),[]);assert.deepEqual(choose(1,{},[]),[]);});
test('invalid and crossing ranges do not create accidental parent folding', () => {
 const input=[{start:-1,end:2},{start:1,end:3},{start:2,end:4},{start:1,end:3},{start:5,end:5},{start:9,end:999}];
 assert.deepEqual(choose(1,{languageId:'plaintext'},input),[1]);
});
test('CRLF and bare CR line endings keep provider line numbering', () => {
 for (const separator of ['\r\n','\r']) {
  const text=['/** docs',' * readable',' */','function run() {','  work();','}'].join(separator);
  assert.deepEqual(selectCodeFolds([{start:0,end:2},{start:3,end:4}],{level:1,text,languageId:'javascript'}),[3]);
 }
});
test('Unicode JavaScript line separators do not shift editor comment lines', () => {
 const text='/** docs\u2028still same editor line\n * readable\n */\nfunction run() {\n  work();\n}\n';
 assert.deepEqual(selectCodeFolds([{start:0,end:2},{start:3,end:4}],{level:1,text,languageId:'javascript'}),[3]);
});
