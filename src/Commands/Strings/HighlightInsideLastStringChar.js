const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("../BaseCommand");
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

    let { stringCharPosition, openingChar } = MoveToLastStringChar.findLastStringChar(document, position);
    if (!stringCharPosition) {
      return;
    }

    stringCharPosition = this.findPreviousChar(document, stringCharPosition, openingChar, 1);
    if(!stringCharPosition) {
      return;
    }

    let closingCharPosition = this.findNextChar(document, stringCharPosition, openingChar);
    if (!closingCharPosition) {
      return;
    }

    const range = new vscode.Range(
      new vscode.Position(stringCharPosition.line, stringCharPosition.character),
      closingCharPosition
    );
    editor.selection = new vscode.Selection(range.start, range.end);
    editor.revealRange(range);
  
  
  }
};

// ...existing code...

module.exports = HighlightInsideLastStringChar;