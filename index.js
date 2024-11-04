const GoToNextParagraph = require('./src/Commands/GoToNextParagraph.js');
const GoToLastParagraph = require('./src/Commands/GoToLastParagraph.js');
const GoToLastParens = require('./src/Commands/GoToLastParens.js');
const GoToNextParens = require('./src/Commands/GoToNextParens.js');
const HighlightInsideNextParens = require('./src/Commands/HighlightInsideNextParens.js');
const HighlightInsideLastParens = require('./src/Commands/HighlightInsideLastParens.js');


function activate(context) {

    const goNextParagraphCommand = GoToNextParagraph.create().createCommand();
    const goLastParagraphCommand = GoToLastParagraph.create().createCommand();
    const goToLastParensCommand = GoToLastParens.create().createCommand();
    const goToNextParensCommand = GoToNextParens.create().createCommand();
    const highlightInsideNextParensCommand = HighlightInsideNextParens.create().createCommand();
    const highlightInsideLastParensCommand = HighlightInsideLastParens.create().createCommand();
    const goToAssignmentCommand = GoToAssignment.create().createCommand();

    context.subscriptions.push(goLastParagraphCommand);
    context.subscriptions.push(goNextParagraphCommand);
    context.subscriptions.push(goToLastParensCommand);
    context.subscriptions.push(goToNextParensCommand);
    context.subscriptions.push(highlightInsideLastParensCommand);
    context.subscriptions.push(highlightInsideNextParensCommand);
    context.subscriptions.push(goToAssignmentCommand);
}

// this method is called when your extension is deactivated
function deactivate() {

}


module.exports = {
    activate,
    deactivate
}