
const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("../BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to move to the next closing parenthesis.
 * @type {MoveToNextClosingParensType}
 * @extends {BaseCommandType}
 */
const MoveToNextClosingParens = {
  /**
   * @description Initialize an instance of MoveToNextClosingParens.
   * @returns {MoveToNextClosingParensType}
   */
  create() {
    const moveToNextClosingParens = Oloo.assign(BaseCommand.create("lgd.moveToNextClosingParenthesis", "Move To Next Closing Parenthesis"), MoveToNextClosingParens);
    return moveToNextClosingParens;
  },

  /**
   * @description Execute the MoveToNextClosingParens command.
   */
  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    
    let closeParenPosition = this.findNextChar(document, position, ')');
    if (closeParenPosition) {
      editor.selection = new vscode.Selection(closeParenPosition, closeParenPosition);
      editor.revealRange(new vscode.Range(closeParenPosition, closeParenPosition));
    }
  }
};

module.exports = MoveToNextClosingParens;