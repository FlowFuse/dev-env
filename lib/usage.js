const commandLineUsage = require('command-line-usage')

module.exports = {
    usage: () => {
        return commandLineUsage([
            {
                header: 'FlowFUse Dev Environment',
                content: 'Tooling to create a local FlowForge development environment'
            },
            {
                header: 'Synopsis',
                content: '$ npm run <options> <command>'
            },
            {
                header: 'Command List',
                content: [
                    { name: 'init', summary: 'Create the development environment' },
                    { name: 'status', summary: 'Check the git status of each repository' },
                    { name: 'update', summary: 'Run git pull on each repo that is on the main branch' },
                    { name: 'git', summary: 'Run and git command on each repository' }
                ]
            }
        ])
    }
}
/*
*/
