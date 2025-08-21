const { Oloo } = require('@mavega/oloo');
const BaseCommand = require('./BaseCommand');
const vscode = require('vscode');
const fs = require('fs');

/**
 * @description Open the counterpart C/C++ file (.h/.hpp <-> .cpp/.c/.cc/.cxx) to the active document beside, in preview, and auto-close it when selection changes away.
 * @type {BaseCommandType & { _listener?: vscode.Disposable }}
 */
const OpenHeaderOrSourceBeside = {
  /**
   * @returns {typeof OpenHeaderOrSourceBeside}
   */
  create() {
    const cmd = Oloo.assign(BaseCommand.create('lgd.openHeaderOrSourceBeside', 'Open Header/Source Beside (Preview)'), OpenHeaderOrSourceBeside);
    return cmd;
  },

  /**
   * Execute command.
   */
  async executeCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }

    const document = editor.document;
    const thisUri = document.uri;
    if (thisUri.scheme !== 'file') { return; }

    const counterpart = this._getCounterpartUri(thisUri);
    if (!counterpart) {
      vscode.window.setStatusBarMessage('LGD: No counterpart header/source found', 2000);
      return;
    }

    try {
      const doc = await vscode.workspace.openTextDocument(counterpart);
      // Show beside in preview so it disappears when unfocused/replaced
      const shown = await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preview: true, preserveFocus: true });

      // Auto-close when selection changes on the original editor
      this._attachAutoClose(thisUri, shown);
    } catch (err) {
      vscode.window.showErrorMessage(`LGD: Failed to open counterpart: ${err}`);
    }
  },

  /**
   * @param {vscode.Uri} uri
   * @returns {vscode.Uri | null}
   */
  _getCounterpartUri(uri) {
    const file = uri.fsPath;
    const lower = file.toLowerCase();

    const headerExts = ['.h', '.hpp', '.hh', '.hxx'];
    const sourceExts = ['.cpp', '.cc', '.cxx', '.c'];

    const matchExt = (exts) => exts.find(e => lower.endsWith(e));
    const h = matchExt(headerExts);
    const s = matchExt(sourceExts);

    /** @type {string[]} */
    let targets;
    let stem;
    if (h) {
      stem = file.slice(0, file.length - h.length);
      targets = sourceExts;
    } else if (s) {
      stem = file.slice(0, file.length - s.length);
      targets = headerExts;
    } else {
      return null;
    }

    for (const ext of targets) {
      const candidatePath = stem + ext;
      if (fs.existsSync(candidatePath)) {
        return vscode.Uri.file(candidatePath);
      }
    }
    return null;
  },

  /**
   * Attach a selection change listener that will close the preview when user moves selection away from the original editor.
   * @param {vscode.Uri} originalUri
   * @param {vscode.TextEditor} previewEditor
   */
  _attachAutoClose(originalUri, previewEditor) {
    // Dispose previous listener if any to avoid leaks
    if (this._listener) {
      try { this._listener.dispose(); } catch { }
      this._listener = undefined;
    }

    const closePreview = () => {
      const previewPath = previewEditor?.document?.uri?.fsPath;
      if (!previewPath) { return false; }
      const previewVisibleEditor = vscode.window.visibleTextEditors.find(e => e.document.uri.fsPath === previewPath);
      if (previewVisibleEditor) {
        return vscode.window.showTextDocument(previewVisibleEditor.document, previewVisibleEditor.viewColumn || vscode.ViewColumn.Beside, false)
          .then(() => {
            try { vscode.commands.executeCommand('workbench.action.closeActiveEditor'); } catch { }
            return true;
          });
      }
      return false;
    };

    const closeIfNeeded = () => {
      const active = vscode.window.activeTextEditor;
      if (!active) { return; }

      const previewDocPath = previewEditor?.document?.uri?.fsPath;
      const activePath = active.document.uri.fsPath;

      // If preview becomes active, close it
      if (previewDocPath && activePath === previewDocPath) {
        try { vscode.commands.executeCommand('workbench.action.closeActiveEditor'); } catch { }
        if (this._listener) { try { this._listener.dispose(); } catch { } this._listener = undefined; }
        return;
      }

      // If focus moved away from the original editor, close preview
      if (activePath !== originalUri.fsPath) {
        const maybePromise = closePreview();
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.then(() => {
            if (this._listener) { try { this._listener.dispose(); } catch { } this._listener = undefined; }
          });
        } else {
          if (this._listener) { try { this._listener.dispose(); } catch { } this._listener = undefined; }
        }
      }
    };

    // Listen to selection changes and active editor changes
    const selDisposable = vscode.window.onDidChangeTextEditorSelection(closeIfNeeded);
    const activeDisposable = vscode.window.onDidChangeActiveTextEditor(closeIfNeeded);
    this._listener = { dispose: () => { selDisposable.dispose(); activeDisposable.dispose(); } };
  }
};

module.exports = OpenHeaderOrSourceBeside;
