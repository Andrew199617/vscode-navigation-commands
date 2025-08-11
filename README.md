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
