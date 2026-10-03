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
      onComment: comments
    });
    while (tokens.getToken().type.label !== 'eof') { /* Scan through the file. */ }
  } catch {
    // Never guess that the remainder of an incomplete document is a comment.
  }
  return comments;
}

/** Prefix counts make each comment-only range check constant-time. */
function nonCommentLineCounts(text, comments) {
  const chunks = [];
  let offset = 0;
  for (const comment of comments) {
    chunks.push(text.slice(offset, comment.start));
    // Offset-based masking preserves VS Code's CR/LF line numbering. JavaScript
    // token locations also count U+2028/U+2029 as newlines, but the editor does not.
    chunks.push(text.slice(comment.start, comment.end).replace(/[^\r\n]/g, ''));
    offset = comment.end;
  }
  chunks.push(text.slice(offset));
  const counts = [0];
  for (const line of chunks.join('').split(/\r\n|\r|\n/)) {
    counts.push(counts[counts.length - 1] + (line.trim() ? 1 : 0));
  }
  return counts;
}

/**
 * Keep the provider's complete nesting hierarchy, then exclude comments. Removing
 * comments before calculating depth would renumber regions unlike Fold Level N.
 * Range kinds use VS Code's public enum values (Comment = 1), keeping this
 * selector independent of the extension host for unit tests.
 */
function selectCodeFolds(ranges, { level, text, languageId, blockedLines = [] }) {
  const lines = text.split(/\r\n|\r|\n/);
  const comments = javascriptComments(text, languageId);
  const nonCommentLines = comments.length ? nonCommentLineCounts(text, comments) : null;
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
    if (range.kind === 1 || range.kind === 'comment' || range.kind?.value === 'comment') continue;
    if (nonCommentLines && nonCommentLines[range.end + 1] === nonCommentLines[range.start]) continue;
    selected.push(range.start);
  }
  return selected;
}

module.exports = { selectCodeFolds };
