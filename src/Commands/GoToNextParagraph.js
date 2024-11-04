const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("./BaseCommand");
const vscode = require('vscode');

/**
* @description Command to help navigate in a window.
* @type {GoToNextParagraphType}
* @extends {BaseCommandType}
*/
const GoToNextParagraph = {
  /**
  * @description Initialize an instance of GoNextParagraph.
  * @returns {GoToNextParagraphType}
  */
  create() {
    const goNextParagraph = Oloo.assign(BaseCommand.create("lgd.goToNextParagraph", "Go Next Paragraph"), GoToNextParagraph);
    return goNextParagraph;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;

    for (let line = position.line + 1; line < document.lineCount; line++) {
      const textLine = document.lineAt(line);
      if (textLine.isEmptyOrWhitespace) {
        for (let nextLine = line + 1; nextLine < document.lineCount; nextLine++) {
          const nextTextLine = document.lineAt(nextLine);
          if (!nextTextLine.isEmptyOrWhitespace) {
            const newPosition = new vscode.Position(nextLine, nextTextLine.firstNonWhitespaceCharacterIndex);
            editor.selection = new vscode.Selection(newPosition, newPosition);
            editor.revealRange(new vscode.Range(newPosition, newPosition));
            return;
          }
        }
      }
    }

  }
};

module.exports = GoToNextParagraph;