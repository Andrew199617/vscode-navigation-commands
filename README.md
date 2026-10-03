# LGD Navigation Commands
Extension for vscode that provides extra navigation commands that you can bind to any keyboard command.

## Assigning Commands to Keyboard Shortcuts

To assign the commands provided by this extension to keyboard shortcuts, follow these steps:

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
2. Type `Preferences: Open Keyboard Shortcuts` and select it.
3. Enter lgd and all the commands will pop up.
4. Right click and press assign keybinding.
5. choose keybinding that makes sense. I recommend having it setup in a down, left, right, up format on the numpad with shift, ctrl, alt as a different modifier. For highlight always use shift for the shortcut for the best experience.

## Available Commands

### Go to Next Paragraph
- **Command ID:** `lgd.goToNextParagraph`
- **Description:** Moves the cursor to the next chunk of code separated by a new line.

### Go to Last Paragraph
- **Command ID:** `lgd.goToLastParagraph`
- **Description:** Moves the cursor to the last chunk of code separated by a new line.

### Go to Next Parenthesis
- **Command ID:** `lgd.goToNextParenthesis`
- **Description:** Moves the cursor to the next open parenthesis.

### Go to Last Parenthesis
- **Command ID:** `lgd.goToLastParenthesis`
- **Description:** Moves the cursor to the last open parenthesis.

### Highlight Inside Next Parenthesis
- **Command ID:** `lgd.highlightInsideNextParenthesis`
- **Description:** Highlights the inside of the next parenthesis.

### Highlight Inside Last Parenthesis
- **Command ID:** `lgd.highlightInsideLastParenthesis`
- **Description:** Highlights the inside of the last parenthesis. Places cursor begind 
)'

### Move To Next Closing Parenthesis
- **Command ID:** `lgd.moveToNextClosingParenthesis`
- **Description:** Moves the cursor to the next closing parenthesis. Places cursor behind ')'
### Move To Last Closing Parenthesis
- **Command ID:** `lgd.moveToLastClosingParenthesis`
- **Description:** Moves the cursor to the last closing parenthesis.

### Go to Assignment
- **Command ID:** `lgd.goToAssignment`
- **Description:** Moves the cursor to the beginning of an assignment, searching for the first letter after an equals sign.

### Go to Next Bracket
- **Command ID:** `lgd.goToNextBracket`
- **Description:** Moves the cursor to the next closing bracket. Places the cursor behind the `}`.

### Go to Last Bracket
- **Command ID:** `lgd.goToLastBracket`
- **Description:** Moves the cursor to the last closing bracket. Places the cursor behind the `}`.

### Move to Next Open Bracket
- **Command ID:** `lgd.moveToNextOpenBracket`
- **Description:** Moves the cursor to the next opening bracket. Places the cursor after the `{`.

### Move to Last Open Bracket
- **Command ID:** `lgd.moveToLastOpenBracket`
- **Description:** Moves the cursor to the last opening bracket. Places the cursor after the `{`.

### Highlight Inside Next Bracket
- **Command ID:** `lgd.highlightInsideNextBracket`
- **Description:** Highlights the text inside the next bracket. Selects text between `{` and `}`.

### Highlight Inside Last Bracket
- **Command ID:** `lgd.highlightInsideLastBracket`
- **Description:** Highlights the text inside the last bracket. Selects text between `{` and `}`.

### Move To Next String Character
- **Command ID:** `lgd.moveToNextStringChar`
- **Description:** Moves the cursor to the next string character (`"`, `'`, or `` ` ``).

### Move To Last String Character
- **Command ID:** `lgd.moveToLastStringChar`
- **Description:** Moves the cursor to the last string character (`"`, `'`, or `` ` ``).

### Highlight Inside Next String Character
- **Command ID:** `lgd.highlightInsideNextStringChar`
- **Description:** Highlights the inside of the next string character.

### Highlight Inside Last String Character
- **Command ID:** `lgd.highlightInsideLastStringChar`
- **Description:** Highlights the inside of the last string character.

### Go to Next Method
- **Command ID:** `lgd.goToNextMethod`
- **Description:** Move the cursor to next method in class, object, or module.

### Go to Last Method
- **Command ID:** `lgd.gotToLastMethod`
- **Description:** Move the cursor to next method in class, object, or module.

## Other Extensions by Learn Game Development

Check out other extensions made by Learn Game Development for enhancing your coding experience. Some of the popular ones include:

- **learn-game-development.js-syntax-extension:** Provides extra formatting, type checking and refactoring capabilities to javascript.
- **learn-game-development.js-snippet-extension:** Snippets to easily create classes, objects, enums and react components in javascript.

For more information, search for "Learn Game Development" in extension browser.

## Fold Code at a Level, Keeping Comments

The new **LGD: Fold Level 1 (Keep Comments)** through **LGD: Fold Level 7
(Keep Comments)** commands fold code at the same nesting level as VS Code's
built-in **Fold Level 1–7**, but skip documentation and comment-only ranges.
They are available in the Command Palette and Keyboard Shortcuts editor.

- Command IDs: `lgd.foldLevel1KeepComments` through `lgd.foldLevel7KeepComments`
- No default shortcuts are assigned. Bind any of these commands yourself; your
  existing shortcuts and VS Code's original folding commands are unchanged.
- Level 1 means top-level folding ranges. Level 2 means ranges immediately
  nested within those, and so on. Levels are based on the editor's folding
  provider, not indentation counts or a guess about what constitutes a method.
  Classes, functions, object literals, members, nested classes, and control-flow
  blocks remain eligible at their actual level.
- Like VS Code's built-in level commands, a range containing a selection's start
  line is left open. Move the cursor outside a range if you want it folded.
- Repeating a command does not fold an enclosing class instead. Other existing
  folds stay as they are; these commands do not unfold previously folded comments.
- Documentation above or beside a folded body stays visible. Documentation
  *inside* a folded class/function is hidden along with that enclosing body.
  Use a deeper level to keep the enclosing body visible.
- JavaScript supports both syntax and indentation folding. Real comments are
  identified lexically when the provider does not label them, so comment-like
  text in a string, regular expression, or template literal remains code.
  With incomplete JavaScript, the tokenizer conservatively stops at a lexical
  error; provider-labelled comments still work beyond it.
- Other languages use their provider's comment labels. Untyped comment ranges
  in other languages (including JSX/TypeScript indentation-only providers) are
  not guessed. Manually created folding ranges are not returned by VS Code's
  folding-provider API and are outside this command's scope.

Requires VS Code 1.85 or newer. The command changes only editor folding state,
not source text or settings.

### Folding tests

Run `npm ci --ignore-scripts` and `npm run test:folding` (Node 20 or newer).
The focused tests use Node's built-in test runner and cover nesting, comments,
JavaScript lexical edge cases, cursor exclusions, repeated commands, and editor
changes while a provider request is pending. `npm test` runs this same suite.
This replaces the old test entry point, which referenced missing Jest/config
files; there were no existing checked-in tests to remove.
