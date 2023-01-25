const { existsSync } = require('fs')
const { log } = require('console')
const path = require('path')

async function run (options) {
    const chalk = (await import('chalk')).default

    const packages = {}

    log(chalk.bold('Checking repository packages'))
    for (let i = 0; i < options.packages.length; i++) {
        const packageFile = path.join(options.packageDir, options.packages[i], 'package.json')
        if (existsSync(packageFile)) {
            const packageDetails = require(packageFile)
            if (packageDetails.dependencies) {
                for (const [name, version] of Object.entries(packageDetails.dependencies)) {
                    packages[name] = packages[name] || {}
                    packages[name][version] = packages[name][version] || []
                    packages[name][version].push({ package: options.packages[i] })
                }
            }
            if (packageDetails.devDependencies) {
                for (const [name, version] of Object.entries(packageDetails.devDependencies)) {
                    packages[name] = packages[name] || {}
                    packages[name][version] = packages[name][version] || []
                    packages[name][version].push({ package: options.packages[i], dev: true })
                }
            }
        }
    }

    for (const [name, details] of Object.entries(packages)) {
        const versions = Object.keys(details)
        versions.sort()
        if (versions.length > 1) {
            log(` ${chalk.bold(name)}`)
            for (const version of versions) {
                log(`  - ${version} : ${details[version].map(p => p.package).join(', ')}`)
            }
        }
    }
}

module.exports = {
    run
}
