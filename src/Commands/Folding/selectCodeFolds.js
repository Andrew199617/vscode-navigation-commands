const acorn = require('acorn');

/**
 * Find real JavaScript comments, including when indentation folding supplies no
 * range kinds. A tokenizer distinguishes comments from strings, regex literals,
 * and template text. On incomplete syntax, retain only comments already read.
 */
function javascriptComments(text, languageId) {
  if (languageId !== 'javascript') return [];
  const comments = [];
  try {
    const tokens = acorn.tokenizer(text, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      allowHashBang: true,
      locations: true,
      onComment: comments
    });
    while (tokens.getToken().type.label !== 'eof') { /* Scan through the file. */ }
  } catch {
    // Never guess that the remainder of an incomplete document is a comment.
  }
  return comments;
}

/** Prefix counts make each comment-only range check constant-time. */
function nonCommentLineCounts(lines, comments) {
  const spansByLine = new Map();
  for (const comment of comments) {
    for (let line = comment.loc.start.line - 1; line < comment.loc.end.line; line++) {
      const spans = spansByLine.get(line) || [];
      spans.push([
        comment.loc.start.line - 1 === line ? comment.loc.start.column : 0,
        comment.loc.end.line - 1 === line ? comment.loc.end.column : lines[line].length
      ]);
      spansByLine.set(line, spans);
    }
  }
  const counts = [0];
  for (let line = 0; line < lines.length; line++) {
    let uncovered = lines[line];
    const spans = (spansByLine.get(line) || []).sort((a, b) => b[0] - a[0]);
    for (const [start, end] of spans) {
      uncovered = uncovered.slice(0, start) + uncovered.slice(end);
    }
    counts.push(counts[line] + (uncovered.trim() ? 1 : 0));
  }
  return counts;
}

/**
 * Keep the provider's complete nesting hierarchy, then exclude comments. Removing
 * comments before calculating depth would renumber regions unlike Fold Level N.
 * Range kinds use VS Code's string values, avoiding a VS Code dependency in tests.
 */
function selectCodeFolds(ranges, { level, text, languageId, blockedLines = [] }) {
  const lines = text.split(/\r?\n/);
  const comments = javascriptComments(text, languageId);
  const nonCommentLines = comments.length ? nonCommentLineCounts(lines, comments) : null;
  const sorted = (ranges || []).filter(range =>
    Number.isInteger(range.start) && Number.isInteger(range.end) &&
    range.start >= 0 && range.end > range.start && range.end < lines.length
  ).slice().sort((a, b) => a.start - b.start || b.end - a.end);
  const parents = [];
  const selected = [];
  let previousStart = -1;
  for (const range of sorted) {
    // Provider results are normally sanitized by VS Code. Be defensive about
    // duplicate starts/crossing ranges instead of folding an unrelated parent.
    if (range.start === previousStart) continue;
    previousStart = range.start;
    while (parents.length && range.start > parents[parents.length - 1].end) parents.pop();
    if (parents.length && range.end > parents[parents.length - 1].end) continue;
    const depth = parents.length + 1;
    parents.push(range);
    if (depth !== level || blockedLines.some(line => line >= range.start && line <= range.end)) continue;
    if (range.kind?.value === 'comment' || range.kind === 'comment') continue;
    if (nonCommentLines && nonCommentLines[range.end + 1] === nonCommentLines[range.start]) continue;
    selected.push(range.start);
  }
  return selected;
}

module.exports = { selectCodeFolds };
