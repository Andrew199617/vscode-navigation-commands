const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("../BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to highlight the inside of the last parenthesis.
 * @type {HighlightInsideLastParensType}
 * @extends {BaseCommandType}
 */
const HighlightInsideLastParens = {
  /**
   * @description Initialize an instance of HighlightInsideLastParens.
   * @returns {HighlightInsideLastParensType}
   */
  create() {
    const highlightInsideLastParens = Oloo.assign(BaseCommand.create("lgd.highlightInsideLastParenthesis", "Highlight Inside Last Parenthesis"), HighlightInsideLastParens);
    return highlightInsideLastParens;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const position = selection.isEmpty ? selection.active : selection.start;

    const openParenPosition = this.findPreviousChar(document, position, '(', 1);
    if (!openParenPosition) {
      return;
    }

    let parenCount = 1;
    for (let line = openParenPosition.line; line < document.lineCount; line++) {
      const textLine = document.lineAt(line).text;
      const searchStart = line === openParenPosition.line ? openParenPosition.character : 0;

      for (let i = searchStart; i < textLine.length; i++) {
        if (textLine[i] === '(') {
          parenCount++;
        }
        else if (textLine[i] === ')') {
          parenCount--;
          if (parenCount === 0) {
            const endPosition = new vscode.Position(line, i);
            editor.selection = new vscode.Selection(openParenPosition, endPosition);
            editor.revealRange(new vscode.Range(openParenPosition, endPosition));
            return;
          }
        }
      }
    }
  
  }
};

module.exports = HighlightInsideLastParens;