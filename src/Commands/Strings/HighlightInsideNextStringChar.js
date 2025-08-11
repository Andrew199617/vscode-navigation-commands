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

    const { stringCharPosition, openingChar } = MoveToNextStringChar.findNextStringChar(document, position);
    if (!stringCharPosition) {
      return;
    }

    let closingCharPosition = this.findNextChar(document, stringCharPosition, openingChar);
    if (!closingCharPosition) {
      return;
    }

    const range = new vscode.Range(
      stringCharPosition,
      closingCharPosition
    );
    editor.selection = new vscode.Selection(range.start, range.end);
    editor.revealRange(range);
  
  
  }
};

module.exports = HighlightInsideNextStringChar;