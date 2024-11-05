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
- **Description:** Highlights the inside of the last parenthesis.

### Go to Assignment
- **Command ID:** `lgd.goToAssignment`
- **Description:** Moves the cursor to the beginning of an assignment, searching for the first letter after an equals sign.

### Go to Assignment
- **Command ID:** `lgd.goToNextMethod`
- **Description:** Move the cursor to next method in class, object, or module.

### Go to Assignment
- **Command ID:** `lgd.gotToLastMethod`
- **Description:** Move the cursor to next method in class, object, or module.

## Other Extensions by Learn Game Development

Check out other extensions made by Learn Game Development for enhancing your coding experience. Some of the popular ones include:

- **learn-game-development.js-syntax-extension:** Provides extra formatting, type checking and refactoring capabilities to javascript.
- **learn-game-development.js-snippet-extension:** Snippets to easily create classes, objects, enums and react components in javascript.

For more information, search for "Learn Game Development" in extension browser.
