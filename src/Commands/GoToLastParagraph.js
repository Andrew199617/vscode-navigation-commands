const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("./BaseCommand");
const vscode = require('vscode');

/**
* @description Command to help navigate in a window.
* @type {GoToLastParagraphType}
* @extends {BaseCommandType}
*/
const GoToLastParagraph = {
  /**
  * @description Initialize an instance of GoToLastParagraph.
  * @returns {GoToLastParagraphType}
  */
  create() {
    const goToLastParagraph = Oloo.assign(BaseCommand.create("lgd.goToLastParagraph", "Go To Last Paragraph"), GoToLastParagraph);
    return goToLastParagraph;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;

    let line = position.line - 1;
    let foundWhitespace = false;
    for (; line >= 0; line--) {
      const textLine = document.lineAt(line);
      if (textLine.isEmptyOrWhitespace) {
        foundWhitespace = true;
      }
      else if (foundWhitespace && !textLine.isEmptyOrWhitespace) {
        break;
      }
    }

    for (; line >= 0; line--) {
      const textLine = document.lineAt(line);
      if (textLine.isEmptyOrWhitespace) {
        const nextLine = line + 1;
        const nextTextLine = document.lineAt(nextLine);
        const newPosition = new vscode.Position(nextLine, nextTextLine.firstNonWhitespaceCharacterIndex);
        editor.selection = new vscode.Selection(newPosition, newPosition);
        editor.revealRange(new vscode.Range(newPosition, newPosition));
        return;
      }
    }

  }
};

module.exports = GoToLastParagraph;