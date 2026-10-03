'use strict';

const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { runTests } = require('@vscode/test-electron');

async function main() {
    if (process.platform === 'linux' && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) {
        throw new Error('VS Code host tests need a display. On headless Linux, run: xvfb-run -a npm test');
    }

    const extensionDevelopmentPath = path.resolve(__dirname, '..');
    const testRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'lgd-folding-host-'));
    const workspace = path.join(testRoot, 'workspace');
    const userData = path.join(testRoot, 'user-data');
    const extensions = path.join(testRoot, 'extensions');
    try {
        await fs.cp(path.join(extensionDevelopmentPath, 'tests/vscode-host/fixtures'), workspace, { recursive: true });
        await fs.mkdir(path.join(userData, 'User'), { recursive: true });
        await fs.mkdir(extensions);
        // Short fixtures and a compact editor keep every unfolded line on screen.
        // Host assertions also require both viewport anchors to remain visible.
        await fs.writeFile(path.join(userData, 'User/settings.json'), JSON.stringify({
            'editor.folding': true,
            'editor.foldingStrategy': 'auto',
            'editor.fontSize': 12,
            'editor.lineHeight': 16,
            'editor.minimap.enabled': false,
            'editor.scrollBeyondLastLine': false,
            'editor.stickyScroll.enabled': false,
            'editor.wordWrap': 'off',
            'window.newWindowDimensions': 'maximized',
            'workbench.startupEditor': 'none',
            'workbench.editor.enablePreview': false,
            'workbench.tips.enabled': false,
            'security.workspace.trust.enabled': false,
            'telemetry.telemetryLevel': 'off',
            'extensions.autoCheckUpdates': false,
            'extensions.autoUpdate': false,
            'update.mode': 'none'
        }, null, 2));

        // Pin the minimum supported release line for reproducibility. CI can also
        // exercise current releases with VSCODE_TEST_VERSION=stable. An explicit
        // VSCODE_TEST_EXECUTABLE can reuse a downloaded binary, never its profile.
        await runTests({
            version: process.env.VSCODE_TEST_VERSION || '1.85.2',
            vscodeExecutablePath: process.env.VSCODE_TEST_EXECUTABLE || undefined,
            cachePath: path.join(os.tmpdir(), 'lgd-vscode-test-downloads'),
            extensionDevelopmentPath,
            extensionTestsPath: path.join(extensionDevelopmentPath, 'tests/vscode-host/index.js'),
            reuseMachineInstall: false,
            extensionTestsEnv: { ELECTRON_RUN_AS_NODE: undefined },
            launchArgs: [
                workspace,
                '--new-window',
                '--disable-gpu',
                '--disable-extensions',
                '--user-data-dir', userData,
                '--extensions-dir', extensions
            ]
        });
    } finally {
        await fs.rm(testRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
