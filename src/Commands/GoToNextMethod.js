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

    /**
     * The tab size of the currently opened file in VS Code.
     * @type {number}
     */
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

    for (let i = 0; i < currentLine - 1; i++) {
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
    const editor = vscode.window.activeTextEditor;
    const lines = editor?.document?.getText().split('\n') || [];
    const languageId = editor?.document?.languageId;
    if (languageId === 'csharp') {
      return this.getMethodCSharp(line, i, lines);
    }

    return this.getMethodJavaScript(line, i, lines);
  },

  // JavaScript / TypeScript style method detection (enhanced)
  getMethodJavaScript(line, i, lines) {
    let tabIndented = new RegExp(`^ {${this.tabSize}}[\\w\\$]{1}`, 'm').test(line)
      || new RegExp(`^\\t{1}[\\w\\$]{1}`, 'm').test(line);
    const notIndented = /^[\\w\\$]{1}/m.test(line);

    if (!tabIndented && !notIndented) {
      return false;
    }

    const trimmedLine = line.trim();

    // Common false positives
    if (/^(if|for|while|switch|else)\b/.test(trimmedLine)) {
      return false;
    }

    // Also consider the next line to support Allman style where `{` is on the next line
    const nextLine = (lines && lines[i + 1]) ? lines[i + 1].trim() : '';
    const combined = trimmedLine + ' ' + nextLine;

    const jsPatterns = [
      // function foo() {
      /^function\s+\w+\s*\([^)]*\)\s*\{/,
      // foo: function() {
      /^\w+\s*:\s*function\s*\([^)]*\)\s*\{/,
      // TS/JS class method possibly with modifiers
      /^(?:public\s+|private\s+|protected\s+|readonly\s+|override\s+|declare\s+)?(?:static\s+)?(?:async\s+)?(?:get\s+|set\s+)?\w+\s*\([^)]*\)\s*\{/,
      // class/object property arrow method: foo = () => {  or foo: () => {
      /^\w+\s*(?::|=)\s*\([^)]*\)\s*=>\s*(?:\{|[^;]+;?)/
    ];

    if (jsPatterns.some(r => r.test(trimmedLine) || r.test(combined))) {
      const editor = vscode.window.activeTextEditor;
      const newPosition = new vscode.Position(i, tabIndented ? this.tabSize : 0);
      editor.selection = new vscode.Selection(newPosition, newPosition);
      editor.revealRange(new vscode.Range(newPosition, newPosition));
      return true;
    }
    return false;
  },

  // C# method detection (enhanced)
  getMethodCSharp(line, i, lines) {
    if (!line) {
      return false;
    }

    let tabIndented = new RegExp(`^ {${this.tabSize}}[A-Za-z_]`, 'm').test(line)
      || new RegExp(`^\\t{1}[A-Za-z_]`, 'm').test(line);
    const notIndented = /^[A-Za-z_]/m.test(line);

    if (!tabIndented && !notIndented) {
      return false;
    }

    const trimmedLine = line.trim();

    // Exclude control statements & attributes and common declarations
    if (/^(if|for|foreach|while|switch|using|lock|else|catch|finally|return)\b/.test(trimmedLine)) {
      return false;
    }

    if (/^\[.*\]$/.test(trimmedLine)) { // attribute line
      return false;
    }

    // Combine current and next line to catch signatures where { or => is on next line
    const nextLine = (lines && lines[i + 1]) ? lines[i + 1].trim() : '';
    const combined = trimmedLine + ' ' + nextLine;

    // Return type (with namespaces/generics/arrays), name (optionally generic), then params
    const csharpMethodRegex = new RegExp(
      '^(?:public|private|protected|internal)?' +
      '(?:\\s+(?:static|async|virtual|override|sealed|abstract|extern|unsafe|new|partial))*' +
      '\\s+[A-Za-z_][\\w<>\\[\\],\\.]*' + // return type (allow dotted namespace and generics)
      '\\s+[A-Za-z_]\\w*(?:<[^>]+>)?' + // method name with optional generic type params
      '\\s*\\([^;{}]*\\)\\s*(?:\\{|=>)'
    );

    // Constructor: access modifier(s) + ClassName(...) { or =>
    const csharpCtorRegex = new RegExp(
      '^(?:public|private|protected|internal)?' +
      '(?:\\s+(?:static|unsafe|new|partial))*' +
      '\\s*[A-Za-z_]\\w*' +
      '\\s*\\([^;{}]*\\)\\s*(?:\\{|=>)'
    );

    const isMethod = csharpMethodRegex.test(trimmedLine) || csharpMethodRegex.test(combined) ||
      csharpCtorRegex.test(trimmedLine) || csharpCtorRegex.test(combined);

    if (isMethod) {
      const editor = vscode.window.activeTextEditor;
      const newPosition = new vscode.Position(i, tabIndented ? this.tabSize : 0);
      editor.selection = new vscode.Selection(newPosition, newPosition);
      editor.revealRange(new vscode.Range(newPosition, newPosition));
      return true;
    }

    return false;
  }
};

module.exports = GoToNextMethod;