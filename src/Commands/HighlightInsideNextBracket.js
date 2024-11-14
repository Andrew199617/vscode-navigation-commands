const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("./BaseCommand");
const vscode = require('vscode');
const MoveToNextOpenBracket = require("./MoveToNextOpenBracket.js");

/**
 * @description Command to highlight the inside of the next opening bracket.
 * @type {HighlightInsideNextBracketType}
 * @extends {BaseCommandType}
 */
const HighlightInsideNextBracket = {
  /**
   * @description Initialize an instance of HighlightInsideNextBracket.
   * @returns {HighlightInsideNextBracketType}
   */
  create() {
    const highlightInsideNextBracket = Oloo.assign(BaseCommand.create("lgd.highlightInsideNextBracket", "Highlight Inside Next Bracket"), HighlightInsideNextBracket);
    return highlightInsideNextBracket;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const position = selection.isEmpty ? selection.active : selection.start;
    let openBracketPosition = MoveToNextOpenBracket.findNextOpenBracket(document, position);

    if (openBracketPosition) {
      let bracketCount = 1;
      for (let line = openBracketPosition.line; line < document.lineCount; line++) {
        const textLine = document.lineAt(line).text;
        const searchStart = line === openBracketPosition.line ? openBracketPosition.character : 0;

        for (let i = searchStart; i < textLine.length; i++) {
          if (textLine[i] === '{') {
            bracketCount++;
          }
          else if (textLine[i] === '}') {
            bracketCount--;
            if (bracketCount === 0) {
              const endPosition = new vscode.Position(line, i);
              editor.selection = new vscode.Selection(openBracketPosition, endPosition);
              editor.revealRange(new vscode.Range(openBracketPosition, endPosition));
              return;
            }
          }
        }
      }
    }
  }
};

module.exports = HighlightInsideNextBracket;