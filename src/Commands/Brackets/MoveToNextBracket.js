const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("../BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to move to the next closing bracket.
 * @type {MoveToNextBracketType}
 * @extends {BaseCommandType}
 */
const MoveToNextBracket = {
  /**
   * @description Initialize an instance of MoveToNextBracket.
   * @returns {MoveToNextBracketType}
   */
  create() {
    const moveToNextBracket = Oloo.assign(BaseCommand.create("lgd.goToNextBracket", "Go To Next Closing Bracket"), MoveToNextBracket);
    return moveToNextBracket;
  },

  /**
   * @description Execute the MoveToNextBracket command.
   */
  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    
    let closeBracketPosition = this.findNextChar(document, position, '}');
    if (closeBracketPosition) {
      editor.selection = new vscode.Selection(closeBracketPosition, closeBracketPosition);
      editor.revealRange(new vscode.Range(closeBracketPosition, closeBracketPosition));
    }
  }
};

module.exports = MoveToNextBracket;