const { existsSync } = require('fs')
const { log } = require('console')
const path = require('path')

/**
 * Check for any renamed repos
 *
 * @param {} options
 */
async function run (options) {
    const chalk = (await import('chalk')).default

    let loggedHeader = false
    for (const [oldPackageName, newPackageName] of Object.entries(options.renamedPackages)) {
        if (existsSync(path.join(options.packageDir, oldPackageName))) {
            if (!loggedHeader) {
                loggedHeader = true
                log(chalk.redBright(chalk.bold('********************************')))
                log(chalk.redBright(chalk.bold('Found repos that have been renamed')))
            }
            log(`${chalk.redBright(' !')} ${oldPackageName} -> ${newPackageName}`)
        }
    }
    if (loggedHeader) {
        log(chalk.bold('Run `npm run update-renamed` to rename them'))
        log(chalk.redBright(chalk.bold('********************************')))
        process.exit(0)
    }
}

module.exports = {
    run
}
