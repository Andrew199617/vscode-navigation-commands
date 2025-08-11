
const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("../BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to move to the next opening parenthesis.
 * @type {MoveToNextOpenParensType}
 * @extends {BaseCommandType}
 */
const MoveToNextOpenParens = {
  /**
   * @description Initialize an instance of MoveToNextOpenParens.
   * @returns {MoveToNextOpenParensType}
   */
  create() {
    const moveToNextOpenParens = Oloo.assign(BaseCommand.create("lgd.goToNextParenthesis", "Move To Next Open Parenthesis"), MoveToNextOpenParens);
    return moveToNextOpenParens;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;

    const newPosition = this.findNextChar(document, position, '(', 1);
    if(newPosition) {
      editor.selection = new vscode.Selection(newPosition, newPosition);
      editor.revealRange(new vscode.Range(newPosition, newPosition));
    }
  }
};

module.exports = MoveToNextOpenParens;