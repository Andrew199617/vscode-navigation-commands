const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("../BaseCommand");
const vscode = require('vscode');
const MoveToNextStringChar = require("./MoveToNextStringChar.js");

/**
 * @description Command to highlight the inside of the next string character.
 * @type {HighlightInsideNextStringCharType}
 * @extends {BaseCommandType}
 */
const HighlightInsideNextStringChar = {
  /**
   * @description Initialize an instance of HighlightInsideNextStringChar.
   * @returns {HighlightInsideNextStringCharType}
   */
  create() {
    const highlightInsideNextStringChar = Oloo.assign(
      BaseCommand.create("lgd.highlightInsideNextStringChar", "Highlight Inside Next String Character"),
      HighlightInsideNextStringChar
    );
    return highlightInsideNextStringChar;
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
      const openingChar = document.getText(new vscode.Range(stringCharPosition, stringCharPosition.translate(0, 1)));
      if (!['"', "'", '`'].includes(openingChar)) {
        return;
      }

      let closingCharPosition = null;
      const lineCount = document.lineCount;
      for (let line = stringCharPosition.line; line < lineCount; line++) {
        const textLine = document.lineAt(line).text;
        const searchStart = line === stringCharPosition.line ? stringCharPosition.character + 1 : 0;
        const index = textLine.indexOf(openingChar, searchStart);
        if (index !== -1) {
          closingCharPosition = new vscode.Position(line, index);
          break;
        }
      }

      if (closingCharPosition) {
        const range = new vscode.Range(
          new vscode.Position(stringCharPosition.line, stringCharPosition.character + 1),
          closingCharPosition
        );
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range);
      }
    }
  }
};

module.exports = HighlightInsideNextStringChar;