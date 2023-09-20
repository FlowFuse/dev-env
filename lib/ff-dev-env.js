#!/usr/bin/env node
const commandLineArgs = require('command-line-args')
const path = require('path')

const options = commandLineArgs([{ name: 'command', defaultOption: true }], { stopAtFirstUnknown: true })

if (!options.command) {
    reportUsageAndExit()
}

options.rootDir = path.resolve(path.join(__dirname, '..'))
options.packageDir = path.resolve(path.join(__dirname, '..', 'packages'))
options.packages = [
    'flowfuse',
    'driver-localfs',
    'driver-k8s',
    'driver-docker',
    'device-agent',
    'file-server',
    'nr-launcher',
    'nr-project-nodes',
    'nr-file-nodes',
    'nr-persistent-context',
    'installer',
    'helm',
    'docker-compose'
]

options.npmPackages = [
    'flowfuse',
    'driver-localfs',
    'driver-k8s',
    'driver-docker',
    'device-agent',
    'file-server',
    'nr-launcher',
    'nr-project-nodes',
    'nr-file-nodes',
    'nr-persistent-context',
]

options.extraNpmLinks = {
    'flowfuse': ['@flowfuse/localfs', '@flowfuse/kubernetes', '@flowfuse/docker'],
}

options.disabledNpmLinks = {
    // 'flowforge': ['@flowforge/forge-ui-components'],
}

options.removedPackages = [
    'flowforge-nr-plugin',
    'flowforge-nr-audit-logger',
    'flowforge-nr-auth',
    'flowforge-nr-storage',
    'flowforge-nr-theme',
    'flowforge',
    'forge-ui-components',
    'flowforge-driver-k8s',
    'flowforge-driver-docker',
    'flowforge-driver-localfs',
    'flowforge-nr-launcher',
    'flowforge-nr-project-nodes',
    'flowforge-nr-file-nodes',
    'flowforge-nr-persistent-context',
    'flowforge-file-server',
    'flowforge-device-agent'
]



if (options.command === 'remove-unused') {
    require('./commands/removeUnused').run(options)
} else {
    require('./commands/checkRemoved').run(options)
    if (options.command === 'init') {
        require('./commands/init').run(options)
    } else if (options.command === 'status') {
        require('./commands/status').run(options)
    } else if (options.command === 'link') {
        require('./commands/link').run(options)
    } else if (options.command === 'update') {
        require('./commands/update').run(options)
    } else if (options.command === 'git') {
        require('./commands/git').run(options)
    } else if (options.command === 'check-dependencies') {
        require('./commands/checkDependencies').run(options)
    } else {
        reportUsageAndExit()
    }
}

function reportUsageAndExit () {
    console.log(require('./usage').usage())
    process.exit(0)
}
