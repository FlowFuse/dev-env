const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const { existsSync, mkdirSync, readdirSync, readFileSync } = require('fs')
const { log, error } = require('console')
const path = require('path')
const yaml = require('js-yaml');

/**
 * run performs initiation tasks for the developer environment
 *
 * @param {} options
 */
async function run(options) {
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
                    { cwd: options.packageDir }
                )
                log(`${chalk.greenBright('+')} flowforge/${options.packages[i]}`)
            } catch(err) {
                log(`${chalk.redBright('-')} ${options.packages[i]}`)
                error(`Failed to clone flowforge/${options.packages[i]}: ${err.toString()}`)
                error(err.stderr)
                error('Aborting')
                return
            }
        } else {
            log(` ${chalk.yellowBright('=')} flowforge/${options.packages[i]}`)
        }
    }
    log(chalk.bold('Installing packages'))
    try {
        await runner(
            `npm install`,
            `npm install`,
            { cwd: options.rootDir }
        )
        log(`${chalk.greenBright('+')} npm install`)
    } catch(err) {
        log(`${chalk.redBright('-')} npm install`)
        error(`Failed install npm packages: ${err.toString()}`)
        error(err.stderr)
        error('Aborting')
        return
    }
    log(chalk.bold('Building packages'))
    const buildPackages = ['forge-ui-components','flowforge']
    for (let i = 0; i < buildPackages.length; i++) {
        const package = buildPackages[i]
        try {
            await runner(
                package,
                `${NPM} run build`,
                { cwd: path.join(options.packageDir, package) }
            )
            log(`${chalk.greenBright('+')} flowforge/${package}`)
        } catch(err) {
            log(`${chalk.redBright('-')} flowforge/${package}`)
            error(`Failed to build ${package}`)
            error(err.stderr)
            error('Aborting')
            return
        }
    }

	if (usePGDatabase(options.rootDir)) {
		log(chalk.bold('Setting up PostgreSQL'))

		const pgDir = path.join(options.rootDir, "data", "pg");
		if (readdirSync(pgDir).length === 0) {
			try {
				await runner("initdb", `initdb --pgdata=${pgDir}`)
				log(`${chalk.greenBright('+')} initdb`)
			} catch (e) {
				log(`${chalk.redBright('-')} initdb`)
				error(`Failed to initiate a PostgreSQL database: ${e.toString()}`)
				error(e.stderr)
				error('Aborting')
				return
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
function usePGDatabase(rootPath) {
	const configPath = path.join(rootPath, "packages", "flowforge", "etc", "flowforge.yml");

	let ffConfig = {};
	try {
		ffConfig = yaml.load(readFileSync(configPath, 'utf8'));
	} catch (e) {
		console.log(e);
		return false
	}

	return ffConfig.db?.type === "postgres";
}

module.exports = {
    run
}
