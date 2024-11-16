const GoToNextParagraph = require('./src/Commands/GoToNextParagraph.js');
const GoToLastParagraph = require('./src/Commands/GoToLastParagraph.js');

const HighlightInsideNextParens = require('./src/Commands/Parenthesis/HighlightInsideNextParens.js');
const HighlightInsideLastParens = require('./src/Commands/Parenthesis/HighlightInsideLastParens.js');
const MoveToNextOpenParens = require('./src/Commands/Parenthesis/MoveToNextOpenParens.js');
const MoveToLastOpenParens = require('./src/Commands/Parenthesis/MoveToLastOpenParens.js');
const MoveToNextClosingParens = require('./src/Commands/Parenthesis/MoveToNextClosingParens.js');
const MoveToLastClosingParens = require('./src/Commands/Parenthesis/MoveToLastClosingParens.js');

const MoveToNextBracket = require('./src/Commands/Brackets/MoveToNextBracket.js');
const MoveToLastBracket = require('./src/Commands/Brackets/MoveToLastBracket.js');
const MoveToNextOpenBracket = require('./src/Commands/Brackets/MoveToNextOpenBracket.js');
const MoveToLastOpenBracket = require('./src/Commands/Brackets/MoveToLastOpenBracket.js');
const HighlightInsideNextBracket = require('./src/Commands/Brackets/HighlightInsideNextBracket.js');
const HighlightInsideLastBracket = require('./src/Commands/Brackets/HighlightInsideLastBracket.js');

const GoToNextMethod = require('./src/Commands/GoToNextMethod.js');
const GoToLastMethod = require('./src/Commands/GoToLastMethod.js');
const GoToAssignment = require('./src/Commands/GoToAssignment.js');

const MoveToNextStringChar = require('./src/Commands/Strings/MoveToNextStringChar.js');
const MoveToLastStringChar = require('./src/Commands/Strings/MoveToLastStringChar.js');
const HighlightInsideNextStringChar = require('./src/Commands/Strings/HighlightInsideNextStringChar.js');
const HighlightInsideLastStringChar = require('./src/Commands/Strings/HighlightInsideLastStringChar.js');

function activate(context) {
    const goNextParagraphCommand = GoToNextParagraph.create().createCommand();
    const goLastParagraphCommand = GoToLastParagraph.create().createCommand();
    context.subscriptions.push(goLastParagraphCommand);
    context.subscriptions.push(goNextParagraphCommand);

    const highlightInsideNextParensCommand = HighlightInsideNextParens.create().createCommand();
    const highlightInsideLastParensCommand = HighlightInsideLastParens.create().createCommand();
    const moveToNextOpenParensCommand = MoveToNextOpenParens.create().createCommand();
    const moveToLastOpenParensCommand = MoveToLastOpenParens.create().createCommand();
    const moveToNextClosingParensCommand = MoveToNextClosingParens.create().createCommand();
    const moveToLastClosingParensCommand = MoveToLastClosingParens.create().createCommand();
    context.subscriptions.push(highlightInsideLastParensCommand);
    context.subscriptions.push(highlightInsideNextParensCommand);
    context.subscriptions.push(moveToNextOpenParensCommand);
    context.subscriptions.push(moveToLastOpenParensCommand);
    context.subscriptions.push(moveToNextClosingParensCommand);
    context.subscriptions.push(moveToLastClosingParensCommand);

    const goToAssignmentCommand = GoToAssignment.create().createCommand();
    context.subscriptions.push(goToAssignmentCommand);
    
    const moveToNextBracketCommand = MoveToNextBracket.create().createCommand();
    const moveToLastBracketCommand = MoveToLastBracket.create().createCommand();
    const moveToNextOpenBracketCommand = MoveToNextOpenBracket.create().createCommand();
    const moveToLastOpenBracketCommand = MoveToLastOpenBracket.create().createCommand();
    const highlightInsideNextBracketCommand = HighlightInsideNextBracket.create().createCommand();
    const highlightInsideLastBracketCommand = HighlightInsideLastBracket.create().createCommand();
    context.subscriptions.push(moveToNextBracketCommand);
    context.subscriptions.push(moveToLastBracketCommand);
    context.subscriptions.push(moveToNextOpenBracketCommand);
    context.subscriptions.push(moveToLastOpenBracketCommand);
    context.subscriptions.push(highlightInsideNextBracketCommand);
    context.subscriptions.push(highlightInsideLastBracketCommand);

    const goToNextMethodCommand = GoToNextMethod.create().createCommand();
    const goToLastMethodCommand = GoToLastMethod.create().createCommand();
    context.subscriptions.push(goToNextMethodCommand);
    context.subscriptions.push(goToLastMethodCommand);

    const moveToNextStringCharCommand = MoveToNextStringChar.create().createCommand();
    const moveToLastStringCharCommand = MoveToLastStringChar.create().createCommand();
    const highlightInsideNextStringCharCommand = HighlightInsideNextStringChar.create().createCommand();
    const highlightInsideLastStringCharCommand = HighlightInsideLastStringChar.create().createCommand();
    context.subscriptions.push(moveToNextStringCharCommand);
    context.subscriptions.push(moveToLastStringCharCommand);
    context.subscriptions.push(highlightInsideNextStringCharCommand);
    context.subscriptions.push(highlightInsideLastStringCharCommand);
}

module.exports = {
    activate,
    deactivate
}