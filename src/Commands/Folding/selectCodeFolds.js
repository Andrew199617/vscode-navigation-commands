const { parse } = require('@babel/parser');

/**
 * Find real JS/TS comments when indentation folding supplies no range kinds.
 * Parsing in the document's syntax mode distinguishes comments from strings,
 * regex literals, template text and JSX text (including JSX attribute values).
 * Do not use parser recovery: malformed syntax can make a slash or JSX boundary
 * ambiguous. Return null in that case so untyped ranges remain expanded; only
 * explicit non-comment provider kinds are safe to fold without classification.
 */
function javascriptComments(text, languageId) {
  let plugins;
  switch (languageId) {
    case 'javascript': plugins = []; break;
    case 'javascriptreact': plugins = ['jsx']; break;
    case 'typescript': plugins = ['typescript', 'decorators-legacy']; break;
    case 'typescriptreact': plugins = ['typescript', 'jsx', 'decorators-legacy']; break;
    default: return [];
  }
  try {
    return parse(text, {
      sourceType: 'unambiguous',
      plugins,
      // We only need File.comments, not copies attached to every AST node.
      attachComment: false
    }).comments;
  } catch {
    return null;
  }
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
  // Level 0 is an explicit outermost alias; levels 1–7 keep VS Code numbering.
  const requestedDepth = level === 0 ? 1 : level;
  const lines = text.split(/\r\n|\r|\n/);
  const comments = javascriptComments(text, languageId);
  const nonCommentLines = comments?.length ? nonCommentLineCounts(text, comments) : null;
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
    if (depth !== requestedDepth || blockedLines.some(line => line >= range.start && line <= range.end)) continue;
    if (range.kind === 1 || range.kind === 'comment' || range.kind?.value === 'comment') continue;
    if (comments === null && range.kind == null) continue;
    if (nonCommentLines && nonCommentLines[range.end + 1] === nonCommentLines[range.start]) continue;
    selected.push(range.start);
  }
  return selected;
}

module.exports = { selectCodeFolds };
