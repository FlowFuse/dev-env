const { existsSync } = require('fs')
const { rm } = require('fs/promises')
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
        const fullPath = path.join(options.packageDir, options.removedPackages[i])
        if (existsSync(fullPath)) {
            if (!loggedHeader) {
                loggedHeader = true
                log(chalk.redBright(chalk.bold('Deleting unused packages')))
            }
            await rm(fullPath, { recursive: true })
            log(`${chalk.redBright(' x')} ${options.removedPackages[i]}`)
        }
    }
}

module.exports = {
    run
}
