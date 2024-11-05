const { Oloo } = require('@mavega/oloo');
const BaseCommand = require('./BaseCommand');
const vscode = require('vscode');

/**
 * @description Command to navigate to the next method in a class or object.
 * @type {GoToNextMethodType}
 * @extends {BaseCommandType}
 */
const GoToNextMethod = {
  /**
   * @description Initialize an instance of GoToNextMethod.
   * @returns {GoToNextMethodType}
   */
  create(commandName = "lgd.goToNextMethod", title = "Go To Next Method") {
    const goToNextMethod = Oloo.assign(BaseCommand.create(commandName, title), GoToNextMethod);
    goToNextMethod.tabSize = this.getTabSize();
    return goToNextMethod;
  },

  /**
 * @description Get the tab size of the currently opened file in VS Code.
 * @returns {number} The tab size.
 */
  getTabSize() {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      // Retrieve tabSize from the active editor's options
      const editorTabSize = editor.options.tabSize;
      if (editorTabSize) {
        return editorTabSize;
      }

      // Alternatively, get language-specific tabSize settings
      const languageTabSize = vscode.workspace.getConfiguration('editor', editor.document.uri).get('tabSize');
      if (languageTabSize) {
        return languageTabSize;
      }
    }

    // Fallback to the general editor tabSize configuration
    return vscode.workspace.getConfiguration('editor').get('tabSize') || 2; // Default to 2 if not set
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

    for (let i = currentLine + 1; i < lines.length; i++) {
      if (this.getMethod(lines[i], i)) {
        return;
      }
    }
  },

  /**
   * Searches for the next method in the document and navigates to its position.
   * @param {string} line The line to search for a method.
   * @param {number} i The line number of the current line.
   * @returns {boolean} Returns true if a method was found and navigation was successful, otherwise false.
   */
  getMethod(line, i) {
    let tabIndented = new RegExp(`^ {${this.tabSize}}[^\s ]{1}`, 'm').test(line)
      || new RegExp(`^\t{1}[^\s ]{1}`, 'm').test(line);
    const notIndented = /^[^\s ]{1}/m.test(line);

    if (!tabIndented && !notIndented) {
      return false;
    }

    const trimmedLine = line.trim();
    if (
      (/^function\s+\w+\s*\(.+?{/m.test(trimmedLine) ||
        /^\w+\s*:\s*function\s*\(.+?{/m.test(trimmedLine) ||
        /^\w+\s*\(.+?{/m.test(trimmedLine)) &&
      // does not match if, while, for, switch, etc.
      !/^if/m.test(trimmedLine) &&
      !/^while/m.test(trimmedLine) &&
      !/^for/m.test(trimmedLine) &&
      !/^switch/m.test(trimmedLine) &&
      !/^else/m.test(trimmedLine)
    ) {
      const editor = vscode.window.activeTextEditor;
      const newPosition = new vscode.Position(i, tabIndented ? this.tabSize : 0);
      editor.selection = new vscode.Selection(newPosition, newPosition);
      editor.revealRange(new vscode.Range(newPosition, newPosition));
      return true;
    }
  }
};

module.exports = GoToNextMethod;