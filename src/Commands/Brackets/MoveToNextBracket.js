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
    let closeBracketPosition = MoveToNextBracket.getNextBracketPosition(document, position);

    if (closeBracketPosition) {
      editor.selection = new vscode.Selection(closeBracketPosition, closeBracketPosition);
      editor.revealRange(new vscode.Range(closeBracketPosition, closeBracketPosition));
    }
  },

  /**
   * @static
   * @description Helper function to get the next closing bracket position.
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @returns {vscode.Position|null}
   */
  getNextBracketPosition(document, position) {
    for (let line = position.line; line < document.lineCount; line++) {
      const textLine = document.lineAt(line).text;
      const searchStart = line === position.line ? position.character + 1 : 0;
      const closeBracketIndex = textLine.indexOf('}', searchStart);

      if (closeBracketIndex !== -1) {
        return new vscode.Position(line, closeBracketIndex);
      }
    }

    return null;
  }
};

module.exports = MoveToNextBracket;