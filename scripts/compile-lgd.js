/**
 * Compiles every .lgd file in the repo to its dotted .lgd.js output.
 *
 * Relative requires that target another .lgd source are rewritten to the
 * dotted output (require('./BaseCommand.js') becomes
 * require('./BaseCommand.lgd.js')) so the emitted files run under plain Node.
 * Bare specifiers such as require('vscode') are left alone.
 *
 * Usage: node scripts/compile-lgd.js
 * Override the compiler location with LGD_COMPILER_PATH.
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const compilerPath = process.env.LGD_COMPILER_PATH
    || path.resolve(repoRoot, '..', 'js-syntax-extension', 'src', 'Compilers', 'LgdCompiler.js');
const LgdCompiler = require(compilerPath);

function findLgdFiles(directory)
{
    const found = [];
    for(const entry of fs.readdirSync(directory, { withFileTypes: true }))
    {
        if(entry.name === 'node_modules' || entry.name === '.git')
        {
            continue;
        }

        const full = path.join(directory, entry.name);
        if(entry.isDirectory())
        {
            found.push(...findLgdFiles(full));
        }
        else if(entry.name.endsWith('.lgd'))
        {
            found.push(full);
        }
    }

    return found.sort();
}

function rewriteRequires(code, lgdFile)
{
    const directory = path.dirname(lgdFile);
    return code.replace(/require\(['"](\.[^'"]*?)(\.js)?['"]\)/g, (match, specifier) =>
    {
        const target = path.resolve(directory, `${specifier}.lgd`);
        if(fs.existsSync(target))
        {
            return `require('${specifier}.lgd.js')`;
        }

        return match;
    });
}

function main()
{
    const files = findLgdFiles(repoRoot);
    if(files.length === 0)
    {
        console.log('No .lgd files found.');
        return;
    }

    let failed = false;
    for(const file of files)
    {
        const source = fs.readFileSync(file, 'utf8');
        const result = LgdCompiler.create().compileToJs(source);
        const relative = path.relative(repoRoot, file);
        if(result.errors.length > 0)
        {
            failed = true;
            console.error(`${relative}:`);
            for(const error of result.errors)
            {
                console.error(`  ${error.message} (offset ${error.offset})`);
            }

            continue;
        }

        const output = rewriteRequires(result.code, file);
        const outFile = `${file}.js`;
        fs.writeFileSync(outFile, output);
        console.log(`${relative} -> ${path.relative(repoRoot, outFile)}`);
    }

    if(failed)
    {
        console.error('Compilation failed.');
        process.exit(1);
    }
}

main();
