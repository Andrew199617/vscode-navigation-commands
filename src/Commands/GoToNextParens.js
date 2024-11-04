const { Oloo } = require('@mavega/oloo');
const BaseCommand = require("./BaseCommand");
const vscode = require('vscode');

/**
 * @description Command to navigate to the next parenthesis.
 * @type {GoToNextParensType}
 * @extends {BaseCommandType}
 */
const GoToNextParens = {
    /**
     * @description Initialize an instance of GoToNextParens.
     * @returns {GoToNextParensType}
     */
    create() {
        const goToNextParens = Oloo.assign(BaseCommand.create("lgd.goToNextParenthesis", "Go To Next Parenthesis"), GoToNextParens);
        return goToNextParens;
    },

    async executeCommand() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const position = editor.selection.active;

        for (let line = position.line; line < document.lineCount; line++) {
            const textLine = document.lineAt(line).text;
            const searchStart = line === position.line ? position.character : 0;
            const parenIndex = textLine.indexOf('(', searchStart);
            if (parenIndex !== -1) {
                const newPosition = new vscode.Position(line, parenIndex + 1);
                editor.selection = new vscode.Selection(newPosition, newPosition);
                editor.revealRange(new vscode.Range(newPosition, newPosition));
                return;
            }
        }
    }
};

module.exports = GoToNextParens;