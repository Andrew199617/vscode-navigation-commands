const { Oloo } = require('@mavega/oloo');
const vscode = require('vscode');
const GoToNextMethod = require('./GoToNextMethod');

/**
 * @description Command to navigate to the last method in a class or object.
 * @type {GoToLastMethodType}
 * @extends {GoToNextMethodType}
 */
const GoToLastMethod = {
  /**
   * @description Initialize an instance of GoToLastMethod.
   * @returns {GoToLastMethodType}
   */
  create() {
    const goToLastMethod = Oloo.assign(GoToNextMethod.create("lgd.goToLastMethod", "Go To Last Method"), GoToLastMethod);
    return goToLastMethod;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    const currentLine = position.line;
    const lines = document.getText().split('\n');

    for (let i = currentLine - 1; i >= 0; --i) {
      if (this.getMethod(lines[i], i)) {
        return;
      }
    }
  },
};

module.exports = GoToLastMethod;