
const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("./BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to move to the next opening bracket.
 * @type {MoveToNextOpenBracketType}
 * @extends {BaseCommandType}
 */
const MoveToNextOpenBracket = {
  /**
   * @description Initialize an instance of MoveToNextOpenBracket.
   * @returns {MoveToNextOpenBracketType}
   */
  create() {
    const moveToNextOpenBracket = Oloo.assign(BaseCommand.create("lgd.moveToNextOpenBracket", "Move To Next Opening Bracket"), MoveToNextOpenBracket);
    return moveToNextOpenBracket;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    let openBracketPosition = MoveToNextOpenBracket.findNextOpenBracket(document, position);

    if (openBracketPosition) {
      editor.selection = new vscode.Selection(openBracketPosition, openBracketPosition);
      editor.revealRange(new vscode.Range(openBracketPosition, openBracketPosition));
    }
  },

  /**
   * @description Finds the position of the next open bracket '{' in the document starting from the given position.
   * @param {vscode.TextDocument} document - The document in which to search for the open bracket.
   * @param {vscode.Position} position - The position from which to start the search.
   * @returns {vscode.Position|null} The position of the next open bracket, or null if no open bracket is found.
   */
  findNextOpenBracket(document, position) {
    for (let line = position.line; line < document.lineCount; line++) {
      const textLine = document.lineAt(line).text;
      const searchStart = line === position.line ? position.character : 0;
      const openBracketIndex = textLine.indexOf('{', searchStart);

      if (openBracketIndex !== -1) {
        return new vscode.Position(line, openBracketIndex + 1);
      }
    }

    return null;
  }
};

module.exports = MoveToNextOpenBracket;