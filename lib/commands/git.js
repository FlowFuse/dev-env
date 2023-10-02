const { existsSync } = require('fs')
const { log, error } = require('console')
const path = require('path')

function indent (string, count = 2, indent = '  ') {
    return string.replace(/^/gm, indent.repeat(count))
}

async function run (options) {
    const { runner } = await require('../runner')()
    const chalk = (await import('chalk')).default

    if (!options._unknown || options._unknown.length === 0) {
        log('Usage: npm run git <cmd>')
        return
    }
    const cmd = `git ${options._unknown.join(' ')}`
    log(chalk.bold(`Running ${cmd} on all packages`))
    for (let i = 0; i < options.packages.length; i++) {
        if (!existsSync(path.join(options.packageDir, options.packages[i]))) {
            log(`${chalk.redBright('-')} FlowFuse/${options.packages[i]}`)
        } else {
            try {
                const output = await runner(
                    options.packages[i],
                    cmd,
                    { cwd: path.join(options.packageDir, options.packages[i]) }
                )
                log(`${chalk.greenBright('+')} ${chalk.bold(options.packages[i])}:`)
                log(`${indent(output.stdout.trim())}`)
            } catch (err) {
                log(`${chalk.redBright('-')} ${chalk.bold(options.packages[i])}`)
                error(err)
            }
        }
    }
}
module.exports = {
    run
}
