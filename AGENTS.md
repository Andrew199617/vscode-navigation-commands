# Project guidance

- README.md is the VS Code extension's end-user/Marketplace documentation. Keep it concise and use its existing command-list format: command name, ID, and description.
- Integrate new commands into that list. Do not append developer handbooks, test procedures, implementation notes, delivery details, or lengthy feature essays to the README.
- Keep durable contributor guidance here and technical detail in focused code comments/tests.
- Commands are user-assignable. Do not add default keyboard shortcuts unless explicitly requested.
- Run `npm ci --ignore-scripts` and `npm test` for folding changes. Validate visible folding changes in an isolated VS Code host, including repeated invocation and the same-file native/custom comparison.
- Preserve folding-provider nesting, cursor exclusions, and comment boundaries. Do not equate a folding level with semantic methods or indentation counts.
- Keep PR screenshots out of the source tree. Upload them as native GitHub attachments in the PR description, grouped with concise before/after captions.
- PR descriptions explain behavior and show images; do not put test-pass counts or verification-status sections there. Test status belongs in GitHub Actions.
- Run every project test on both push and pull_request in GitHub Actions. Keep npm test as the complete suite, including newly added tests; do not weaken checks to hide failures.
