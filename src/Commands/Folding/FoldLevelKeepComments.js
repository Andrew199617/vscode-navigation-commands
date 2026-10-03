const vscode = require('vscode');
const BaseCommand = require('../BaseCommand');
const { selectCodeFolds } = require('./selectCodeFolds');

const FoldLevelKeepComments = {
  create(level) {
    const command = BaseCommand.create(
      `lgd.foldLevel${level}KeepComments`,
      level === 0 ? 'Fold Level 0 (Outermost, Keep Comments)' : `Fold Level ${level} (Keep Comments)`
    );
    Object.assign(command, FoldLevelKeepComments);
    command.level = level;
    return command;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const document = editor.document;
    const version = document.version;
    try {
      const ranges = await vscode.commands.executeCommand('vscode.executeFoldingRangeProvider', document.uri);
      // Provider requests are asynchronous: do not fold a newly focused editor
      // or apply stale line numbers after typing while the provider is running.
      if (vscode.window.activeTextEditor !== editor || document.version !== version || document.isClosed) return;
      const selectionLines = selectCodeFolds(ranges, {
        level: this.level,
        text: document.getText(),
        languageId: document.languageId,
        blockedLines: editor.selections.map(selection => selection.active?.line ?? selection.start.line)
      });
      if (!selectionLines.length) return;
      await vscode.commands.executeCommand('editor.fold', {
        selectionLines,
        levels: 1,
        direction: 'down'
      });
    } catch (error) {
      vscode.window.showWarningMessage(`Could not fold level ${this.level}: ${error.message || error}`);
    }
  }
};

module.exports = FoldLevelKeepComments;
