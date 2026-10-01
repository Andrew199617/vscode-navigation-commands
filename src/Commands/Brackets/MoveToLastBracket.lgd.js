const { Oloo } = require('@mavega/oloo');
const BaseCommand = require('../BaseCommand.lgd.js');
const vscode = require('vscode');

/**
 * @description Command to move to the previous closing bracket.
 * @extends {BaseCommandType}
 * @type {Object}
 */
let MoveToLastBracket = {
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
    
    let closeBracketPosition = this.findPreviousChar(document, position, '}');
    if (closeBracketPosition) {
      editor.selection = new vscode.Selection(closeBracketPosition, closeBracketPosition);
      editor.revealRange(new vscode.Range(closeBracketPosition, closeBracketPosition));
    }
  }
};

module.exports = MoveToLastBracket;