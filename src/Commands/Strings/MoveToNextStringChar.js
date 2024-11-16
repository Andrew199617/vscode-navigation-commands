const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("../BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to move to the next string character (" or ' or `).
 * @type {MoveToNextStringCharType}
 * @extends {BaseCommandType}
 */
const MoveToNextStringChar = {
  /**
   * @description Initialize an instance of MoveToNextStringChar.
   * @returns {MoveToNextStringCharType}
   */
  create() {
    const moveToNextStringChar = Oloo.assign(
      BaseCommand.create("lgd.moveToNextStringChar", "Move To Next String Character"),
      MoveToNextStringChar
    );
    return moveToNextStringChar;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    let stringCharPosition = MoveToNextStringChar.findNextStringChar(document, position);

    if (stringCharPosition) {
      editor.selection = new vscode.Selection(stringCharPosition, stringCharPosition);
      editor.revealRange(new vscode.Range(stringCharPosition, stringCharPosition));
    }
  },

  /**
   * @description Finds the position of the next string character ('"', "'", "`") in the document starting from the given position.
   * @param {vscode.TextDocument} document - The document in which to search for the string character.
   * @param {vscode.Position} position - The position from which to start the search.
   * @returns {vscode.Position|null} The position of the next string character, or null if no string character is found.
   */
  findNextStringChar(document, position) {
    // 34 = ", 39 = ', 96 = `
    const chars = { 34: true, 39: true, 96: true };
    for (let line = position.line; line < document.lineCount; line++) {
      const textLine = document.lineAt(line).text;
      const searchStart = line === position.line ? position.character : 0;

      for (let i = searchStart; i < textLine.length; i++) {
        if (chars[textLine.charCodeAt(i)]) {
          return new vscode.Position(line, i + 1);
        }
      }
    }

    return null;
  }
};

module.exports = MoveToNextStringChar;