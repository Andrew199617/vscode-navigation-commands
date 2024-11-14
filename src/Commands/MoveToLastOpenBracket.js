
const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("./BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to move to the previous opening bracket.
 * @type {MoveToLastOpenBracketType}
 * @extends {BaseCommandType}
 */
const MoveToLastOpenBracket = {
  /**
   * @description Initialize an instance of MoveToLastOpenBracket.
   * @returns {MoveToLastOpenBracketType}
   */
  create() {
    const moveToLastOpenBracket = Oloo.assign(BaseCommand.create("lgd.moveToLastOpenBracket", "Move To Last Opening Bracket"), MoveToLastOpenBracket);
    return moveToLastOpenBracket;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    let openBracketPosition = MoveToLastOpenBracket.findLastOpenBracket(document, position);

    if (openBracketPosition) {
      editor.selection = new vscode.Selection(openBracketPosition, openBracketPosition);
      editor.revealRange(new vscode.Range(openBracketPosition, openBracketPosition));
    }
  },
  
  /**
   * @description Finds the position of the last open bracket '{' before the given position.
   * @param {vscode.TextDocument} document - The document in which to search for the open bracket.
   * @param {vscode.Position} position - The position from which to start searching backwards.
   * @returns {vscode.Position|null} The position of the last open bracket, or null if not found.
   */
  findLastOpenBracket(document, position) {
    for (let line = position.line; line >= 0; line--) {
      const textLine = document.lineAt(line).text;
      const searchEnd = line === position.line ? position.character - 2 : textLine.length;
      const openBracketIndex = textLine.lastIndexOf('{', searchEnd);

      if (openBracketIndex !== -1) {
        return new vscode.Position(line, openBracketIndex + 1);
      }
    }

    return null;
  }
};

module.exports = MoveToLastOpenBracket;