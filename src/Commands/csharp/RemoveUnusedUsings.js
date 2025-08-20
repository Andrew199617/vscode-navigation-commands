const { Oloo } = require('@mavega/oloo');
const BaseCommand = require('../BaseCommand');
const vscode = require('vscode');

/**
 * @description Command to trigger C# IDE0005 cleanup (remove unused usings) using Organize Imports.
 * @type {RemoveUnusedUsingsType}
 * @extends {BaseCommandType}
 */
const RemoveUnusedUsings = {
  /**
   * @description Initialize an instance of RemoveUnusedUsings.
   * @returns {RemoveUnusedUsingsType}
   */
  create(commandName = 'lgd.removeUnused', title = 'Remove Unused Usings (C#)') {
    const removeUnused = Oloo.assign(BaseCommand.create(commandName, title), RemoveUnusedUsings);
    return removeUnused;
  },

  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    // Only act for C# files
    if (editor.document.languageId !== 'csharp') {
      vscode.window.showInformationMessage('lgd.removeUnused only applies to C# files.');
      return;
    }

    // Prefer executing built-in organize imports which triggers IDE0005 (remove unused usings)
    try {
      // Try the official command first
      const organized = await vscode.commands.executeCommand('editor.action.organizeImports');
      // Some C# extensions also expose csharp-specific organize command; we attempt as fallback
      await vscode.commands.executeCommand('csharp.organizeImports');
      // Save document if auto-save is disabled to persist fixes
      if (editor.document.isDirty) {
        await editor.document.save();
      }
      return organized;
    } catch (err) {
      // Last resort: try to run codeAction for source.organizeImports explicitly
      try {
        await vscode.commands.executeCommand('vscode.executeSourceAction', editor.document.uri, { kind: 'source.organizeImports', apply: true });
        if (editor.document.isDirty) {
          await editor.document.save();
        }
      } catch (e2) {
        vscode.window.showErrorMessage(`Failed to remove unused usings: ${e2?.message || err?.message}`);
      }
    }
  }
};

module.exports = RemoveUnusedUsings;
