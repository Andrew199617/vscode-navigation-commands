const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("./BaseCommand");
const vscode = require('vscode');
const MoveToLastStringChar = require("./MoveToLastStringChar.js");

/**
 * @description Command to highlight the inside of the last string character.
 * @type {HighlightInsideLastStringCharType}
 * @extends {BaseCommandType}
 */
const HighlightInsideLastStringChar = {
  /**
   * @description Initialize an instance of HighlightInsideLastStringChar.
   * @returns {HighlightInsideLastStringCharType}
   */
  create() {
    const highlightInsideLastStringChar = Oloo.assign(
      BaseCommand.create("lgd.highlightInsideLastStringChar", "Highlight Inside Last String Character"),
      HighlightInsideLastStringChar
    );
    return highlightInsideLastStringChar;
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
      const openingChar = document.getText(new vscode.Range(stringCharPosition, stringCharPosition.translate(0, 1)));
      if (!['"', "'", '`'].includes(openingChar)) {
        return;
      }

      let openingCharPosition = stringCharPosition;
      let closingCharPosition = null;

      for (let line = openingCharPosition.line; line < document.lineCount; line++) {
        const textLine = document.lineAt(line).text;
        const searchStart = line === openingCharPosition.line ? openingCharPosition.character + 1 : 0;
        const index = textLine.indexOf(openingChar, searchStart);
        if (index !== -1) {
          closingCharPosition = new vscode.Position(line, index);
          break;
        }
      }

      if (closingCharPosition) {
        const range = new vscode.Range(
          new vscode.Position(openingCharPosition.line, openingCharPosition.character + 1),
          closingCharPosition
        );
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range);
      }
    }
  }
};

// ...existing code...

module.exports = HighlightInsideLastStringChar;