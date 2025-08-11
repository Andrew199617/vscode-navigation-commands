const vscode = require('vscode');

/**
* @description Helps Create an Object that can generate a Command for vscode.
* @type {BaseCommandType}
*/
const BaseCommand = {
  /**
  * @description Initialize an instance of BaseCommand.
  * @param {string} commandName The name of the command.
  * @param {string} title The title of the command.
  * @returns {BaseCommandType}
  */
  create(commandName, title) {
    const baseCommand = Object.create(BaseCommand);

    /** @type {vscode.Command} */
    baseCommand.command = {
      title: title,
      command: commandName
    };

    return baseCommand;
  },

  /**
   * @type {string}
   */
  get commandName() {
    return this.command.command;
  },

  /**
   * @description Creates the vscode command.
   * @returns {vscode.Disposable}
   */
  createCommand() {
    return vscode.commands.registerCommand(this.commandName, this.executeCommand, this)
  },

  /**
   * @virtual
   */
  executeCommand() {
    throw new Error('Did not implement!');
  },

  /**
   * @static
   * @description Helper function to get the next position of a char.
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @param {string} char The char to find.
   * @param {number} offset The offset to put the cursor. 0 for behind of char, 1 for in front.
   * @returns {vscode.Position|null}
   */
  findNextChar(document, position, char, offset = 0) {
    if(position.character + 1 + offset > 0) {
      const textLine = document.lineAt(position.line).text;
      let closeBracketIndex = textLine.indexOf(char, position.character + 1 - offset);
      if (closeBracketIndex !== -1) {
        return new vscode.Position(position.line, Math.max(0, closeBracketIndex + offset));
      }    
    }

    for (let line = position.line + 1; line < document.lineCount; line++) {
      const textLine = document.lineAt(line).text;
      closeBracketIndex = textLine.indexOf(char, 0);

      if (closeBracketIndex !== -1) {
        return new vscode.Position(line, Math.max(0, closeBracketIndex + offset));
      }
    }

    return null;
  },

  /**
   * @static
   * @description Helper function to get the previous position of a char.
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @param {string} char The char to find.
   * @param {number} offset The offset to put the cursor. 0 for behind of char, 1 for in front of char.
   * @returns {vscode.Position|null}
   */
  findPreviousChar(document, position, char, offset = 0) {
    if(position.character - 1 + offset > 0) {
      const textLine = document.lineAt(position.line).text;
      const closeBracketIndex = textLine.lastIndexOf(char, position.character - 1 - offset);
      if (closeBracketIndex !== -1) {
        return new vscode.Position(position.line, Math.max(0, closeBracketIndex + offset));
      }
    }
    
    for (let line = position.line - 1; line >= 0; line--) {
      const textLine = document.lineAt(line).text;
      const closeBracketIndex = textLine.lastIndexOf(char, textLine.length);

      if (closeBracketIndex !== -1) {
        return new vscode.Position(line, Math.max(0, closeBracketIndex + offset));
      }
    }

    return null;
  }
};

module.exports = BaseCommand;