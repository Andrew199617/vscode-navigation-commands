
const { Oloo } = require('@mavega/oloo');
const BaseCommand = require('../BaseCommand.lgd.js');
const vscode = require('vscode');

/**
 * @description Command to move to the last closing parenthesis.
 * @extends {BaseCommandType}
 * @type {Object}
 */
let MoveToLastClosingParens = {
  /**
   * @description Initialize an instance of MoveToLastClosingParens.
   * @returns {MoveToLastClosingParensType}
   */
  create() {
    const moveToLastClosingParens = Oloo.assign(BaseCommand.create("lgd.moveToLastClosingParenthesis", "Move To Last Closing Parenthesis"), MoveToLastClosingParens);
    return moveToLastClosingParens;
  },

  /**
   * @description Execute the MoveToLastClosingParens command.
   */
  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    
    let closeParenPosition = this.findPreviousChar(document, position, ')');
    if (closeParenPosition) {
      editor.selection = new vscode.Selection(closeParenPosition, closeParenPosition);
      editor.revealRange(new vscode.Range(closeParenPosition, closeParenPosition));
    }
  }
};

module.exports = MoveToLastClosingParens;