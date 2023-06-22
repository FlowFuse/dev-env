const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const { existsSync, mkdirSync, readdirSync, readFileSync } = require('fs')
const { log, error } = require('console')
const path = require('path')
const yaml = require('js-yaml')

/**
 * run performs initiation tasks for the developer environment
 *
 * @param {} options
 */
async function run (options) {
    const { runner } = await require('../runner')()
    const chalk = (await import('chalk')).default

    log(chalk.bold('Cloning packages'))
    for (let i = 0; i < options.packages.length; i++) {
        if (!existsSync(path.join(options.packageDir, options.packages[i]))) {
            try {
                await runner(
                    `${options.packages[i]}`,
                    `git clone https://github.com/flowforge/${options.packages[i]}.git`,
                    { cwd: options.packageDir }
                )
                await runner(
                    `${options.packages[i]}`,
                    `git remote set-url --push origin git@github.com:flowforge/${options.packages[i]}.git`,
                    { cwd: path.join(options.packageDir, options.packages[i]) }
                )
                log(`${chalk.greenBright('+')} flowforge/${options.packages[i]}`)
            } catch (err) {
                log(`${chalk.redBright('-')} ${options.packages[i]}`)
                error(`Failed to clone flowforge/${options.packages[i]}: ${err.toString()}`)
                error(err.stderr)
                error('Aborting')
                return
            }
        } else {
            // Ensure the push remote has been set to the git@ url
            await runner(
                `${options.packages[i]}`,
                `git remote set-url --push origin git@github.com:flowforge/${options.packages[i]}.git`,
                { cwd: path.join(options.packageDir, options.packages[i]) }
            )
            log(`${chalk.yellowBright('=')} flowforge/${options.packages[i]}`)
        }
    }

    log(`\n${chalk.bold('Preparing package symlinks')}`)
    for (let i = 0; i < options.packages.length; i++) {
        try {
            await runner(`npm link for ${options.packages[i]}`, 'npm link', {
                cwd: path.join(options.packageDir, options.packages[i]),
            })
            log(`${chalk.greenBright('+')} flowforge/${options.packages[i]}`)
        } catch (err) {
            log(`${chalk.redBright('-')} flowforge/${options.packages[i]}`)
            error(`Failed to link ${options.packages[i]}: ${err.toString()}`)
            error(err.stderr)
            error('Aborting')
            return
        }
    }

    log(`\n${chalk.bold('Linking npm packages to each other')}`)
    const packagePathToName = {}
    const packageDependenciesByPath = {}
    for (let i = 0; i < options.npm_packages.length; i++) {
        try {
            const packageFile = path.join(options.packageDir, options.packages[i], 'package.json')
            const packageDetails = require(packageFile)
            
            packagePathToName[options.packages[i]] = packageDetails.name
            packageDependenciesByPath[options.packages[i]] = new Set()

            const allDependencies = { ...packageDetails.dependencies, ...packageDetails.devDependencies }
            for (const [name, version] of Object.entries(allDependencies)) {
                packageDependenciesByPath[options.packages[i]].add(name)
            }
        } catch (err) {
            error(`Failed to read package.json for ${options.packages[i]}: ${err.toString()}`)
            error(err.stderr)
            error('Aborting')
            return
        }
    }
    for (let i = 0; i < options.npm_packages.length; i++) {
        try {
            for (let j = 0; j < options.npm_packages.length; j++) {
                if (i === j) continue;

                const packageToLinkToName = packagePathToName[options.npm_packages[j]]
                if (packageDependenciesByPath[options.npm_packages[i]].has(packageToLinkToName)) {
                    await runner(
                        `npm link to ${packageToLinkToName} from ${options.npm_packages[i]}`,
                        `npm link ${packageToLinkToName}`,
                        { cwd: path.join(options.packageDir, options.npm_packages[i]) }
                    )
                }
            }

            log(`${chalk.greenBright('+')} flowforge/${options.npm_packages[i]}`)
        } catch (err) {
            log(`${chalk.redBright('-')} flowforge/${options.npm_packages[i]}`)
            error(
                `Failed install link packages for ${
                    options.packages[i]
                }: ${err.toString()}`
            )
            error(err.stderr)
            error('Aborting')
            return
        }
    }

    log(`\n${chalk.bold('Installing npm packages')}`)
    for (let i = 0; i < options.npm_packages.length; i++) {
        try {
            await runner(
                `npm install - ${options.npm_packages[i]}`,
                'npm install',
                { cwd: path.join(options.packageDir, options.npm_packages[i]) }
            )
            log(`${chalk.greenBright('+')} flowforge/${options.npm_packages[i]}`)
        } catch (err) {
            log(`${chalk.redBright('-')} flowforge/${options.npm_packages[i]}`)
            error(`Failed install npm packages for ${options.npm_packages[i]}: ${err.toString()}`)
            error(err.stderr)
            error('Aborting')
            return
        }
    }

    log(`\n${chalk.bold('Building packages')}`)
    const buildPackages = ['forge-ui-components', 'flowforge']
    for (let i = 0; i < buildPackages.length; i++) {
        const packageName = buildPackages[i]
        try {
            await runner(
                packageName,
                `${NPM} run build`,
                { cwd: path.join(options.packageDir, packageName) }
            )
            log(`${chalk.greenBright('+')} flowforge/${packageName}`)
        } catch (err) {
            log(`${chalk.redBright('-')} flowforge/${packageName}`)
            error(`Failed to build ${packageName}`)
            error(err.stderr)
            error('Aborting')
            return
        }
    }

    if (usePGDatabase(options.rootDir)) {
        log(`\n${chalk.bold('Setting up PostgreSQL')}`)

        const pgDir = path.join(options.rootDir, 'data', 'pg')
        try {
            mkdirSync(pgDir, { recursive: true })
        } catch (e) {
            error(`Failed to create folder for PostgreSQL database: ${e.toString()}`)
            error(e.stderr)
            error('Aborting')
            return
        }

        if (readdirSync(pgDir).length === 0) {
            try {
                await runner('initdb', `initdb --pgdata=${pgDir}`)
                log(`${chalk.greenBright('+')} initdb`)
            } catch (e) {
                log(`${chalk.redBright('-')} initdb`)
                error(`Failed to initiate a PostgreSQL database: ${e.toString()}`)
                error(e.stderr)
                error('Aborting')
            }
        } else {
            log(`${chalk.redBright('-')} ${pgDir} not empty, skipping`)
        }
    }
}

/**
 * usePGDatabase returns true if PG should be used and initiated
 *
 * @param {string} rootPath
 * @returns {boolean}
 */
function usePGDatabase (rootPath) {
    const flowforgeHome = path.join(rootPath, 'packages', 'flowforge')
    let configPath = path.join(flowforgeHome, '/etc/flowforge.yml')
    if (existsSync(path.join(flowforgeHome, '/etc/flowforge.local.yml'))) {
        configPath = path.join(flowforgeHome, '/etc/flowforge.local.yml')
    }

    let ffConfig = {}
    try {
        ffConfig = yaml.load(readFileSync(configPath, 'utf8'))
    } catch (e) {
        console.log(e)
        return false
    }

    return ffConfig.db?.type === 'postgres'
}

module.exports = {
    run
}
