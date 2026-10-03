# Project guidance

- README.md is the VS Code extension's end-user/Marketplace documentation. Keep it concise and use its existing command-list format: command name, ID, and description.
- Integrate new commands into that list. Do not append developer handbooks, test procedures, implementation notes, delivery details, or lengthy feature essays to the README.
- Keep durable contributor guidance here and technical detail in focused code comments/tests.
- Commands are user-assignable. Do not add default keyboard shortcuts unless explicitly requested.
- Run `npm ci --ignore-scripts` and `npm test` for folding changes. Validate visible folding changes in an isolated VS Code host, including repeated invocation and the same-file native/custom comparison.
- Preserve folding-provider nesting, cursor exclusions, and comment boundaries. Do not equate a folding level with semantic methods or indentation counts.
