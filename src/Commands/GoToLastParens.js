const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("./BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to navigate to the last parenthesis.
 * @type {GoToLastParensType}
 * @extends {BaseCommandType}
 */
const GoToLastParens = {
  /**
   * @description Initialize an instance of GoToLastParens.
   * @returns {GoToLastParensType}
   */
  create() {
    const goToLastParens = Oloo.assign(BaseCommand.create("lgd.goToLastParenthesis", "Go To Last Parenthesis"), GoToLastParens);
    return goToLastParens;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;

    for (let line = position.line; line >= 0; line--) {
      const textLine = document.lineAt(line).text;
      const searchStart = line === position.line ? position.character - 2 : textLine.length;
      const parenIndex = textLine.lastIndexOf('(', searchStart);
      if (parenIndex !== -1) {
        const newPosition = new vscode.Position(line, parenIndex + 1);
        editor.selection = new vscode.Selection(newPosition, newPosition);
        editor.revealRange(new vscode.Range(newPosition, newPosition));
        return;
      }
    }
  }
};

module.exports = GoToLastParens;