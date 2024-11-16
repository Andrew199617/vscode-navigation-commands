
const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("../BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to move to the last opening parenthesis.
 * @type {MoveToLastOpenParensType}
 * @extends {BaseCommandType}
 */
const MoveToLastOpenParens = {
  /**
   * @description Initialize an instance of MoveToLastOpenParens.
   * @returns {MoveToLastOpenParensType}
   */
  create() {
    const moveToLastOpenParens = Oloo.assign(BaseCommand.create("lgd.goToLastParenthesis", "Move To Last Open Parenthesis"), MoveToLastOpenParens);
    return moveToLastOpenParens;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;

    let openParenPosition = this.findLastChar(document, position, '(');
    if (openParenPosition) {
      editor.selection = new vscode.Selection(openParenPosition, openParenPosition);
      editor.revealRange(new vscode.Range(openParenPosition, openParenPosition));
    }
  }
};

module.exports = MoveToLastOpenParens;