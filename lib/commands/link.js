const { existsSync } = require('fs')
const { log } = require('console')
const path = require('path')

const PackageLinker = require('../symlinks')

async function run (options) {
    const chalk = (await import('chalk')).default

    const { runner } = await require('../runner')()

    log(`\n${chalk.bold('Reading npm package package.json files and preparing symlinks')}`)
    const symlinker = new PackageLinker(runner, options.packageDir, options.npmPackages)
    await symlinker.globallyLinkPackages()

    log(`\n${chalk.bold('Linking npm packages to one another')}`)
    await symlinker.linkPackages(options.extraNpmLinks)
}

module.exports = {
    run
}
