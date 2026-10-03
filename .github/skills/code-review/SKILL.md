---
name: code-review
description: Review navigation-command pull requests for actionable correctness, regression, compatibility, security, and test-coverage issues.
---

# Review navigation changes

Review the latest head against its actual target/merge-base. Read the relevant implementation, tests, and repository guidance before concluding that behavior or coverage was removed.

- Give each actionable finding an exact file and smallest useful line range, triggering input/state, expected behavior, actual failure, and user impact. Distinguish merge blockers from suggestions; label uncertainty rather than presenting guesses as reproduced defects.
- Compare folding claims against VS Code's observable behavior and the sanitized ranges returned by `vscode.executeFoldingRangeProvider`, not only hypothetical raw language-provider ranges. Check nesting, comment boundaries, selections, repeated commands, and asynchronous editor changes.
- Confirm that cited baseline test files, runner configuration, and dependencies actually exist. Check the complete current test command and relevant tests; passing tests are evidence, not proof of no defects.
- Recheck earlier findings against the current code. Keep unresolved valid findings; do not repeat demonstrably fixed ones.
- Report important defects even if they contradict the PR description or this guidance. Do not suppress findings, invent evidence, or approve merely because approval was requested.
- End with an honest readiness assessment and remaining blockers or unverified behavior. If no actionable issues remain, say so. Formal approval remains an independent review decision governed by GitHub's settings.
