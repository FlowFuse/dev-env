const { log, error } = require('console')
const path = require('path')
const { readlinkSync } = require('fs')

module.exports = class PackageLinker {
    constructor(runner, packageDir, packagePathsToLoad = []) {
        this.runner = runner

        this.packageDir = packageDir
        this.npmPackagePaths = packagePathsToLoad
    }

    async getInfoForPackages() {
        if (this.packagesByPath) {
            return this.packagesByPath
        }

        const packages = {}

        for (let i = 0; i < this.npmPackagePaths.length; i++) {
            const packagePath = this.npmPackagePaths[i]

            try {
                const packageFile = path.join(this.packageDir, packagePath, 'package.json')
                const packageDetails = require(packageFile)

                const packageSummary = {
                    name: packageDetails.name,
                    dependencies: new Set(),
                }

                const allDependencies = { ...packageDetails.dependencies, ...packageDetails.devDependencies }
                for (const [name, version] of Object.entries(allDependencies)) {
                    packageSummary.dependencies.add(name)
                }

                packages[packagePath] = packageSummary
            } catch (err) {
                error(`Failed to read package.json for ${packagePath}: ${err.toString()}`)
                error(err.stderr)
                error('Aborting')
                return
            }
        }

        this.packagesByPath = packages

        return this.packagesByPath
    }

    async globallyLinkPackages() {
        const packagesByPath = await this.getInfoForPackages()
        const chalk = (await import('chalk')).default

        const { stdout: npmRootOutput } = await this.runner('Get npm root', 'npm root -g', {
            cwd: this.packageDir,
        })
        for (let i = 0; i < this.npmPackagePaths.length; i++) {
            const packagePath = this.npmPackagePaths[i]

            try {
                const npmGlobalInstallPath = npmRootOutput.trim()

                const newLinkPath = path.join(this.packageDir, this.npmPackagePaths[i])

                let resolvedExistingLinkPath
                try {
                    const existingGlobalLinkLocation = path.join(
                        npmGlobalInstallPath,
                        packagesByPath[this.npmPackagePaths[i]].name
                    )
                    const existingLinkPath = readlinkSync(existingGlobalLinkLocation)

                    const existingLinkDirectory = path.dirname(existingGlobalLinkLocation)

                    resolvedExistingLinkPath = path.join(existingLinkDirectory, existingLinkPath)
                } catch (err) {
                    // No existing link
                }

                if (resolvedExistingLinkPath === newLinkPath) {
                    log(`${chalk.yellowBright('=')} flowforge/${this.npmPackagePaths[i]}`)
                } else {
                    await this.runner(`npm link for ${this.npmPackagePaths[i]}`, 'npm link', {
                        cwd: path.join(this.packageDir, this.npmPackagePaths[i]),
                    })
                    log(`${chalk.greenBright('+')} flowforge/${this.npmPackagePaths[i]}`)
                }
            } catch (err) {
                log(`${chalk.redBright('-')} flowforge/${this.npmPackagePaths[i]}`)
                error(`Failed to link ${this.npmPackagePaths[i]}: ${err.toString()}`)
                error(err.stderr)
                error('Aborting')
                return
            }
        }
    }

    async linkPackages(extraLinks = {}, disabledLinks = {}) {
        const packagesByPath = await this.getInfoForPackages()
        const chalk = (await import('chalk')).default

        for (let i = 0; i < this.npmPackagePaths.length; i++) {
            const packageToLinkFromPath = this.npmPackagePaths[i]
            const packageToLinkFrom = packagesByPath[packageToLinkFromPath]

            try {
                let packagesToLinkTo = []
                for (let j = 0; j < this.npmPackagePaths.length; j++) {
                    if (i === j) continue

                    const packageToLinkTo = packagesByPath[this.npmPackagePaths[j]]
                    const packageToLinkToName = packageToLinkTo.name
                    if (packageToLinkFrom.dependencies.has(packageToLinkToName)) {
                        packagesToLinkTo.push(packageToLinkTo)
                    }
                }
                
                // Optional extra links not found in package.json
                if (extraLinks[packageToLinkFromPath]) {
                    packagesToLinkTo.push(...extraLinks[packageToLinkFromPath].map((pkg) => { return { name: pkg } }))
                }

                // Remove any disabled links
                if (disabledLinks[packageToLinkFromPath]) {
                    const packagesToSkip = disabledLinks[packageToLinkFromPath]
                    packagesToLinkTo = packagesToLinkTo.filter((pkg) => packagesToSkip.includes(pkg.name) === false) 
                }

                if (packagesToLinkTo.length > 0) {
                    const packageNamesToLinkTo = packagesToLinkTo.map((pkg) => pkg.name)
                    const packageNamesString = packageNamesToLinkTo.join(', ')
                    const result = await this.runner(
                        `npm link from ${packageToLinkFrom.name} to ${packageNamesString}`,
                        `npm link ${packageNamesToLinkTo.join(' ')} --fund=false --audit=false`,
                        { cwd: path.join(this.packageDir, packageToLinkFromPath) }
                    )

                    log(
                        `${chalk.greenBright('+')} flowforge/${packageToLinkFromPath} linked to ${packageNamesString}`
                    )
                }
            } catch (err) {
                log(`${chalk.redBright('-')} flowforge/${packageToLinkFromPath}`)
                error(`Failed install link packages for ${packageToLinkFromPath.name}: ${err.toString()}`)
                console.log(err)
                error(err.stderr)
                error('Aborting')
                return
            }
        }
    }
}
