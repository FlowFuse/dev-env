const { existsSync } = require('fs')
const { rename } = require('fs/promises')
const { log } = require('console')
const path = require('path')

/**
 *
 * @param {} options
 */
async function run (options) {
    const { runner } = await require('../runner')()
    const chalk = (await import('chalk')).default

    let loggedHeader = false
    for (const [oldPackageName, newPackageName] of Object.entries(options.renamedPackages)) {
        const fullPath = path.join(options.packageDir, oldPackageName)
        if (existsSync(fullPath)) {
            if (!loggedHeader) {
                loggedHeader = true
                log(chalk.redBright(chalk.bold('Updated renamed packages')))
            }
            // await rm(fullPath, { recursive: true })
            log(`${chalk.yellowBright(' -')} ${oldPackageName} ${chalk.yellowBright('=>')} ${newPackageName}`)
            await runner(
                newPackageName,
                `git remote set-url origin https://github.com/FlowFuse/${newPackageName}.git`,
                { cwd: fullPath }
            )
            await runner(
                newPackageName,
                `git remote set-url --push origin git@github.com:FlowFuse/${newPackageName}.git`,
                { cwd: fullPath }
            )
            await rename(fullPath, path.join(options.packageDir, newPackageName))
        }
    }
}

module.exports = {
    run
}
