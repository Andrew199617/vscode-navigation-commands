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
test('malformed JavaScript leaves untyped ranges expanded', () => {
 const text='"unterminated\n/** could be text\nvalue\n';
 assert.deepEqual(selectCodeFolds([{start:1,end:2}],{level:1,text,languageId:'javascript'}),[]);
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

test('level 0 aliases outermost without shifting levels 1–7', () => {
 assert.deepEqual(choose(0),[3,16,21]); assert.deepEqual(choose(0),choose(1));
 assert.deepEqual(choose(2),[7,12,17]); assert.deepEqual(choose(3),[8]);
});
test('level 0 preserves export wrappers and their documentation', () => {
 const text='/** Export docs\n * Keep readable\n */\nexport default {\n  run() {\n    work();\n  }\n};\n';
 const ranges=[{start:0,end:2,kind:1},{start:3,end:6},{start:4,end:5}];
 assert.deepEqual(selectCodeFolds(ranges,{level:0,text,languageId:'javascript'}),[3]);
 assert.deepEqual(selectCodeFolds(ranges,{level:1,text,languageId:'javascript'}),[3]);
 assert.deepEqual(selectCodeFolds(ranges,{level:2,text,languageId:'javascript'}),[4]);
});

test('adjacent inclusive siblings stay at the same nesting depth', () => {
 const ranges=[{start:0,end:2},{start:3,end:5},{start:6,end:8}];
 assert.deepEqual(choose(1,{languageId:'plaintext'},ranges),[0,3,6]);
 assert.deepEqual(choose(2,{languageId:'plaintext'},ranges),[]);
});
test('a shared inclusive boundary is overlapping, not an adjacent sibling', () => {
 const ranges=[{start:0,end:3},{start:3,end:5},{start:6,end:8}];
 assert.deepEqual(choose(1,{languageId:'plaintext'},ranges),[0,6]);
});
test('nested regions sharing an end line keep their correct depth', () => {
 const ranges=[{start:0,end:8},{start:2,end:8},{start:4,end:8},{start:9,end:11}];
 assert.deepEqual(choose(1,{languageId:'plaintext'},ranges),[0,9]);
 assert.deepEqual(choose(2,{languageId:'plaintext'},ranges),[2]);
 assert.deepEqual(choose(3,{languageId:'plaintext'},ranges),[4]);
});

for (const languageId of ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']) {
 test(`${languageId}: untyped documentation stays expanded at levels 0–7`, () => {
  const untypedRanges = ranges.map(({start, end}) => ({start, end}));
  const expected = [[3,16,21], [3,16,21], [7,12,17], [8], [], [], [], []];
  expected.forEach((starts, level) => {
   assert.deepEqual(choose(level, {languageId}, untypedRanges), starts);
  });
 });
 test(`${languageId}: syntax errors do not guess untyped folds are code`, () => {
  const text = [
   '/** docs before the error', ' * keep readable', ' */',
   'const broken = ;',
   '/** docs after the error', ' * keep readable', ' */',
   '// #region labeled code', 'work();', '// #endregion'
  ].join('\n');
  const input = [
   {start:0, end:2}, {start:4, end:6},
   {start:7, end:9, kind:{value:'region'}}
  ];
  assert.deepEqual(selectCodeFolds(input, {level:1, text, languageId}), [7]);
  input[0].kind = comment;
  assert.deepEqual(selectCodeFolds(input, {level:1, text, languageId}), [7]);
 });
}

test('TypeScript annotations, generics, assertions and decorators preserve real comments', () => {
 const text = [
  'type Result<T> = { value: T };',
  'const number = <number>1;',
  '@sealed',
  'class Example<T> {',
  '  /** Method documentation', '   * Keep readable', '   */',
  '  run(value: T): Result<T> {', '    return { value };', '  }', '}'
 ].join('\n');
 const input = [{start:3, end:9}, {start:4, end:6}, {start:7, end:8}];
 assert.deepEqual(selectCodeFolds(input, {level:1, text, languageId:'typescript'}), [3]);
 assert.deepEqual(selectCodeFolds(input, {level:2, text, languageId:'typescript'}), [7]);
});

for (const languageId of ['typescript', 'typescriptreact']) {
 test(`${languageId}: strings, regex and template text do not hide later real comments`, () => {
  const text = [
   'const quoted: string = "/* not a comment */ // neither";',
   'const pattern: RegExp = /[/*]+/;',
   'const value: string = `',
   '/** template text', ' * not a comment', ' */', '`;',
   '/** Real documentation', ' * Keep readable', ' */',
   'function run(input: string): string {', '  return input;', '}'
  ].join('\n');
  const input = [{start:3, end:5}, {start:7, end:9}, {start:10, end:11}];
  assert.deepEqual(selectCodeFolds(input, {level:1, text, languageId}), [3,10]);
 });
 test(`${languageId}: comments inside typed template expressions are recognized`, () => {
  const text = [
   'const value: string = `${',
   '/** Real comment', ' * inside expression', ' */',
   '(input as string)', '}`;'
  ].join('\n');
  assert.deepEqual(selectCodeFolds([{start:1, end:3}], {level:1, text, languageId}), []);
 });
}

for (const languageId of ['javascriptreact', 'typescriptreact']) {
 test(`${languageId}: JSX text and attributes remain foldable beside expression comments`, () => {
  const text = [
   languageId === 'typescriptreact' ? 'const value: string = "text";' : 'const value = "text";',
   'const view = <Panel label="',
   '/** attribute text', ' * not a comment', ' */', '">',
   '/** raw JSX text', ' * not a comment', ' */',
   '// raw JSX line text', '// still not a comment',
   '{', '/** Real expression comment', ' * Keep readable', ' */', 'value', '}',
   '</Panel>;',
   '// Real line comment', '// Keep readable'
  ].join('\n');
  const input = [
   {start:2, end:4}, {start:6, end:8}, {start:9, end:10},
   {start:12, end:14}, {start:18, end:19}
  ];
  assert.deepEqual(selectCodeFolds(input, {level:1, text, languageId}), [2,6,9]);
 });
 test(`${languageId}: malformed JSX never guesses comment-like text is code`, () => {
  const text = [
   'const view = <Panel>', '/** ambiguous JSX text', ' * incomplete element', ' */'
  ].join('\n');
  assert.deepEqual(selectCodeFolds([{start:1, end:3}], {level:1, text, languageId}), []);
 });
}
test('same-line nested declarations retain native sanitized level numbering', () => {
 const text='function outer() { function inner() {\n  if (ready) {\n    work();\n  }\n  return 1;\n}\nreturn inner;\n}\n';
 // Real VS Code returns [0,6] and [1,2]: only one folding header per line.
 const nativeRanges=[{start:0,end:6},{start:1,end:2}];
 assert.deepEqual(selectCodeFolds(nativeRanges,{level:2,text,languageId:'javascript'}),[1]);
 // Defensive duplicate inputs must not create an extra, unrepresentable level.
 const duplicated=[{start:0,end:6},{start:0,end:4},{start:1,end:2}];
 assert.deepEqual(selectCodeFolds(duplicated,{level:2,text,languageId:'javascript'}),[1]);
 assert.deepEqual(selectCodeFolds(duplicated,{level:3,text,languageId:'javascript'}),[]);
});
