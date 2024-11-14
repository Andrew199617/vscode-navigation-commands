const GoToNextParagraph = require('./src/Commands/GoToNextParagraph.js');
const GoToLastParagraph = require('./src/Commands/GoToLastParagraph.js');
const GoToLastParens = require('./src/Commands/GoToLastParens.js');
const GoToNextParens = require('./src/Commands/GoToNextParens.js');
const HighlightInsideNextParens = require('./src/Commands/HighlightInsideNextParens.js');
const HighlightInsideLastParens = require('./src/Commands/HighlightInsideLastParens.js');
const MoveToNextBracket = require('./src/Commands/MoveToNextBracket.js');
const MoveToLastBracket = require('./src/Commands/MoveToLastBracket.js');
const MoveToNextOpenBracket = require('./src/Commands/MoveToNextOpenBracket.js');
const MoveToLastOpenBracket = require('./src/Commands/MoveToLastOpenBracket.js');
const HighlightInsideNextBracket = require('./src/Commands/HighlightInsideNextBracket.js');
const HighlightInsideLastBracket = require('./src/Commands/HighlightInsideLastBracket.js');
const GoToNextMethod = require('./src/Commands/GoToNextMethod.js');
const GoToLastMethod = require('./src/Commands/GoToLastMethod.js');
const GoToAssignment = require('./src/Commands/GoToAssignment.js');


function activate(context) {
    const goNextParagraphCommand = GoToNextParagraph.create().createCommand();
    const goLastParagraphCommand = GoToLastParagraph.create().createCommand();
    const goToLastParensCommand = GoToLastParens.create().createCommand();
    const goToNextParensCommand = GoToNextParens.create().createCommand();
    const highlightInsideNextParensCommand = HighlightInsideNextParens.create().createCommand();
    const highlightInsideLastParensCommand = HighlightInsideLastParens.create().createCommand();
    const goToAssignmentCommand = GoToAssignment.create().createCommand();
    const moveToNextBracketCommand = MoveToNextBracket.create().createCommand();
    const moveToLastBracketCommand = MoveToLastBracket.create().createCommand();
    const moveToNextOpenBracketCommand = MoveToNextOpenBracket.create().createCommand();
    const moveToLastOpenBracketCommand = MoveToLastOpenBracket.create().createCommand();
    const highlightInsideNextBracketCommand = HighlightInsideNextBracket.create().createCommand();
    const highlightInsideLastBracketCommand = HighlightInsideLastBracket.create().createCommand();
    const goToNextMethodCommand = GoToNextMethod.create().createCommand();
    const goToLastMethodCommand = GoToLastMethod.create().createCommand();


    context.subscriptions.push(goLastParagraphCommand);
    context.subscriptions.push(goNextParagraphCommand);
    context.subscriptions.push(goToLastParensCommand);
    context.subscriptions.push(goToNextParensCommand);
    context.subscriptions.push(highlightInsideLastParensCommand);
    context.subscriptions.push(highlightInsideNextParensCommand);
    context.subscriptions.push(goToAssignmentCommand);
    context.subscriptions.push(moveToNextBracketCommand);
    context.subscriptions.push(moveToLastBracketCommand);
    context.subscriptions.push(moveToNextOpenBracketCommand);
    context.subscriptions.push(moveToLastOpenBracketCommand);
    context.subscriptions.push(highlightInsideNextBracketCommand);
    context.subscriptions.push(highlightInsideLastBracketCommand);
    context.subscriptions.push(goToNextMethodCommand);
    context.subscriptions.push(goToLastMethodCommand);
}

// this method is called when your extension is deactivated
function deactivate() {

}


module.exports = {
    activate,
    deactivate
}