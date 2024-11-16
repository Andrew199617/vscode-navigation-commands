
const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("../BaseCommand");
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

    let openBracketPosition = this.findPreviousChar(document, position, '{', 1);
    if (openBracketPosition) {
      editor.selection = new vscode.Selection(openBracketPosition, openBracketPosition);
      editor.revealRange(new vscode.Range(openBracketPosition, openBracketPosition));
    }
  }
};

module.exports = MoveToLastOpenBracket;