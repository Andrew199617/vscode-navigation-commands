const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("../BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to highlight the inside of the last opening bracket.
 * @type {HighlightInsideLastBracketType}
 * @extends {BaseCommandType}
 */
const HighlightInsideLastBracket = {
  /**
   * @description Initialize an instance of HighlightInsideLastBracket.
   * @returns {HighlightInsideLastBracketType}
   */
  create() {
    const highlightInsideLastBracket = Oloo.assign(BaseCommand.create("lgd.highlightInsideLastBracket", "Highlight Inside Last Bracket"), HighlightInsideLastBracket);
    return highlightInsideLastBracket;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const position = selection.isEmpty ? selection.active : selection.start;

    let openBracketPosition = this.findPreviousChar(document, position, '{', 1);
    if (!openBracketPosition) {
      return;
    }

    let bracketCount = 1;
    for (let line = openBracketPosition.line; line < document.lineCount; line++) {
      const textLine = document.lineAt(line).text;
      const searchStart = line === openBracketPosition.line ? openBracketPosition.character : 0;

      for (let i = searchStart; i < textLine.length; i++) {
        if (textLine[i] === '{') {
          bracketCount++;
        }
        else if (textLine[i] === '}') {
          bracketCount--;
          if (bracketCount === 0) {
            const endPosition = new vscode.Position(line, i);
            editor.selection = new vscode.Selection(openBracketPosition, endPosition);
            editor.revealRange(new vscode.Range(openBracketPosition, endPosition));
            return;
          }
        }
      }
    }
  }
};

module.exports = HighlightInsideLastBracket;