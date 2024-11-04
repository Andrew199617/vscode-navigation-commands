const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("./BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to go to the start of the assignment in the current line.
 * @type {GoToAssignmentType}
 * @extends {BaseCommandType}
 */
const GoToAssignment = {
  /**
   * @description Initialize an instance of GoToAssignment.
   * @returns {GoToAssignmentType}
   */
  create() {
    const goToAssignment = Oloo.assign(BaseCommand.create("lgd.goToAssignment", "Go To Assignment"), GoToAssignment);
    return goToAssignment;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    const textLine = document.lineAt(position.line).text;
    let match = textLine.match(/=(\s*)/);
    if (!match) {
      return;
    }

    let assignmentIndex = match.index + match[0].length;
    if (assignmentIndex !== -1) {
      const newPosition = new vscode.Position(position.line, assignmentIndex);
      editor.selection = new vscode.Selection(newPosition, newPosition);
      editor.revealRange(new vscode.Range(newPosition, newPosition));
    }
  }
};

module.exports = GoToAssignment;