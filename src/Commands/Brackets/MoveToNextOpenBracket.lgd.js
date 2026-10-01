
const { Oloo } = require('@mavega/oloo');
const BaseCommand = require('../BaseCommand.lgd.js');
const vscode = require('vscode');

/**
 * @description Command to move to the next opening bracket.
 * @extends {BaseCommandType}
 * @type {Object}
 */
let MoveToNextOpenBracket = {
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
    
    let openBracketPosition = this.findNextChar(document, position, '{', 1);
    if (openBracketPosition) {
      editor.selection = new vscode.Selection(openBracketPosition, openBracketPosition);
      editor.revealRange(new vscode.Range(openBracketPosition, openBracketPosition));
    }
  }
};

module.exports = MoveToNextOpenBracket;