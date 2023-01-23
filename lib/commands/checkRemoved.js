const { existsSync } = require('fs')
const { log } = require('console')
const path = require('path')

/**
 * run performs initiation tasks for the developer environment
 *
 * @param {} options
 */
async function run (options) {
    const chalk = (await import('chalk')).default

    let loggedHeader = false
    for (let i = 0; i < options.removedPackages.length; i++) {
        if (existsSync(path.join(options.packageDir, options.removedPackages[i]))) {
            if (!loggedHeader) {
                loggedHeader = true
                log(chalk.redBright(chalk.bold('********************************')))
                log(chalk.redBright(chalk.bold('Found repos that can be deleted')))
            }
            log(`${chalk.redBright(' !')} ${options.removedPackages[i]}`)
        }
    }
    if (loggedHeader) {
        log(chalk.bold('Run `npm run remove-unused` to delete them'))
        log(chalk.redBright(chalk.bold('********************************')))
    }
}

module.exports = {
    run
}
