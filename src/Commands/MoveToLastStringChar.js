const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("./BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to move to the last string character (" or ' or `).
 * @type {MoveToLastStringCharType}
 * @extends {BaseCommandType}
 */
const MoveToLastStringChar = {
  /**
   * @description Initialize an instance of MoveToLastStringChar.
   * @returns {MoveToLastStringCharType}
   */
  create() {
    const moveToLastStringChar = Oloo.assign(
      BaseCommand.create("lgd.moveToLastStringChar", "Move To Last String Character"),
      MoveToLastStringChar
    );
    return moveToLastStringChar;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    let stringCharPosition = MoveToLastStringChar.findLastStringChar(document, position);

    if (stringCharPosition) {
      editor.selection = new vscode.Selection(stringCharPosition, stringCharPosition);
      editor.revealRange(new vscode.Range(stringCharPosition, stringCharPosition));
    }
  },

  /**
   * @description Finds the position of the last string character ('"', "'", "`") in the document starting from the given position.
   * @param {vscode.TextDocument} document - The document in which to search for the string character.
   * @param {vscode.Position} position - The position from which to start the search.
   * @returns {vscode.Position|null} The position of the last string character, or null if no string character is found.
   */
  findLastStringChar(document, position) {
    // 34 = ", 39 = ', 96 = `
    const chars = { 34: true, 39: true, 96: true };
    for (let line = position.line; line >= 0; line--) {
      const textLine = document.lineAt(line).text;
      const searchEnd = line === position.line ? position.character : textLine.length;

      for (let i = searchEnd - 1; i >= 0; i--) {
        if (chars[textLine.charCodeAt(i)]) {
          return new vscode.Position(line, i);
        }
      }
    }

    return null;
  }
};

module.exports = MoveToLastStringChar;