const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("./BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to move to the previous closing bracket.
 * @type {MoveToLastBracketType}
 * @extends {BaseCommandType}
 */
const MoveToLastBracket = {
  /**
   * @description Initialize an instance of MoveToLastBracket.
   * @returns {MoveToLastBracketType}
   */
  create() {
    const moveToLastBracket = Oloo.assign(BaseCommand.create("lgd.goToLastBracket", "Go To Last Closing Bracket"), MoveToLastBracket);
    return moveToLastBracket;
  },

  /**
   * @description Execute the MoveToLastBracket command.
   */
  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    let closeBracketPosition = MoveToLastBracket.getLastBracketPosition(document, position);

    if (closeBracketPosition) {
      editor.selection = new vscode.Selection(closeBracketPosition, closeBracketPosition);
      editor.revealRange(new vscode.Range(closeBracketPosition, closeBracketPosition));
    }
  },

  /**
   * @static
   * @description Helper function to get the last closing bracket position.
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @returns {vscode.Position|null}
   */
  getLastBracketPosition(document, position) {
    for (let line = position.line; line >= 0; line--) {
      const textLine = document.lineAt(line).text;
      const searchEnd = line === position.line ? position.character - 1 : textLine.length;
      const closeBracketIndex = textLine.lastIndexOf('}', searchEnd);

      if (closeBracketIndex !== -1) {
        return new vscode.Position(line, closeBracketIndex);
      }
    }

    return null;
  }
};

module.exports = MoveToLastBracket;