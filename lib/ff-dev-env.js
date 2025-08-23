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
    'nr-mqtt-nodes',
    'nr-tables-nodes',
    'nr-project-nodes',
    'nr-file-nodes',
    'nr-assistant',
    'installer',
    'helm',
    'docker-compose',
    'mqtt-schema-agent',
    'verdaccio-ff-auth',
    'nr-subflow-export'
]

options.npmPackages = [
    'flowfuse',
    'driver-localfs',
    'driver-k8s',
    'driver-docker',
    'device-agent',
    'file-server',
    'nr-launcher',
    'nr-mqtt-nodes',
    'nr-tables-nodes',
    'nr-project-nodes',
    'nr-file-nodes',
    'nr-assistant',
    'mqtt-schema-agent',
    'verdaccio-ff-auth',
    'nr-subflow-export'
]

options.extraNpmLinks = {
    'flowfuse': ['@flowfuse/driver-localfs', '@flowfuse/driver-kubernetes', '@flowfuse/driver-docker'],
}

options.disabledNpmLinks = {
}

options.renamedPackages = {
    'flowforge': 'flowfuse',
    'flowforge-driver-localfs': 'driver-localfs',
    'flowforge-driver-k8s': 'driver-k8s',
    'flowforge-driver-docker': 'driver-docker',
    'flowforge-device-agent': 'device-agent',
    'flowforge-file-server': 'file-server',
    'flowforge-nr-launcher': 'nr-launcher',
    'flowforge-nr-project-nodes': 'nr-project-nodes',
    'flowforge-nr-file-nodes': 'nr-file-nodes'
}


options.removedPackages = [
    'forge-ui-components',
    'flowforge-nr-plugin',
    'flowforge-nr-audit-logger',
    'flowforge-nr-auth',
    'flowforge-nr-storage',
    'flowforge-nr-theme',
    'nr-persistent-context',
    'flowforge-nr-persistent-context'
]



if (options.command === 'remove-unused') {
    require('./commands/removeUnused').run(options)
} else if (options.command === 'update-renamed') {
    require('./commands/updateRenamed').run(options)
} else {
    require('./commands/checkRenamed').run(options)
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
