# FlowForge Development Environment

This repository provides a quick and easy way to setup a local FlowForge development
environment.

## Getting Started

1. Clone this repository

2. Install npm though a [Node version manager](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm) (e.g. NVM, Volta) or with a [custom global install directory](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally#manually-change-npms-default-directory).

3. In the root of this repository run:

       npm install
       npm run init
      
   This will install the immediate dependencies of the development environment,
   clone all of the required repositories under the `packages` directory, link the packages to one another, then install
   all of the dependencies of those repositories. It will then run `npm run build`
   on any of the repositories that require it.

You can now start developing the code normally in the directories under `packages`.

```
flowforge-dev-env
├── LICENSE
├── README.md
├── lib
├── package.json
└── packages
    ├── flowforge
    │   └── ... 
    ├── forge-ui-components
    │   └── ... 
    ├── flowforge-driver-localfs
    │   └── ...
    ├── flowforge-driver-k8s
    │   └── ...
    ├── flowforge-driver-docker
    │   └── ...
    ├── flowforge-device-agent
    │   └── ...
    ├── flowforge-file-server
    │   └── ...
    ├── flowforge-nr-audit-logger
    │   └── ...
    ├── flowforge-nr-auth
    │   └── ...
    ├── flowforge-nr-launcher
    │   └── ...
    ├── flowforge-nr-storage
    │   └── ...
    ├── flowforge-nr-theme
    │   └── ...
    ├── flowforge-nr-project-nodes
    │   └── ...
    ├── flowforge-nr-file-nodes
    │   └── ...
    ├── flowforge-nr-persistent-context
    │   └── ...
    ├── installer
    │   └── ...
    ├── helm
    │   └── ...
    └── docker-compose
        └── ...

```

### Running FlowForge

After running `npm run init`, you will be able to start FlowForge with its default
configuration by running:

    cd packages/flowforge
    npm run start

To run in development mode, where it automatically rebuilds the frontend and restarts
the application when changes are made, run:

    cd packages/flowforge
    npm run serve

More details on how to develop FlowForge itself are provided in the [main docs](https://github.com/flowforge/flowforge/tree/main/docs/contribute).

### Changing a repos dependencies


**Do not run `npm install` in one of the repository directories under `packages`.**

If you do, you'll need to delete the `node_modules` directory that gets created.

If you need to modify a repository's dependencies:

1. Edit its `package.json` to add the dependencies in the normal way
2. Run `npm install` in the root of *this* repository.


## Commands

### `npm run init`

Setup the development environment. You can run this repeatedly - such as when
a new repository has been added that you need to add to your environment

### `npm run status`

Get the current status of each repository, including what branch they have checked out
and whether there are unstaged (`*`) and staged (`+`) changes.

For example:

```
Package git status
 + flowforge (main *+)
 + forge-ui-components (main)
 ...
```

### `npm run checkout`

For each repository on the `main` branch, pull the latest code.

### `npm run git <cmd>`

Run any git command on each repostory. For example, to ensure all repositories
are on the main branch:

```
npm run git checkout main
```

## Why is this needed?

The FlowForge platform consists of a number of npm modules. Each module is maintained
in its own git repository. When developing the code and you need to make changes
across multiple modules, you want to be sure the your development code is loaded.

We used to achieve that by running a script that modified the package.json of which
module to point to a relative location. That left the package.json file modified
and would get in the way when committing and merging changes.

Thankfully, npm workspaces solves that particular problem. Whilst it is more
often used in monorepos, this repo provides the setup required to get them working
with our multiple repositories.


## Other terminal tips

You can run any command in all repos using either of the following methods:

1. `npm exec`

    ```
    npm exec --ws -- /usr/bin/git checkout main
    ```

    However the command will require a full path and you cannot use shell built-ins.

2. `find ...`

    ```
    find packages -name .git -type d -exec git checkout main
    ```


## Auxiliary services

### PostgreSQL

By default FlowForge uses SQLite for development. Given production systems do not
tend to use SQLite but PostgreSQL (PG) it's advised to run PG for development too.
As prerequisite, one should install PG on their own system.

To use PG as development database ensure `packages/flowforge/etc/flowforge.local.yml`
has `postgres` set as database type. The host must be set to an **absolute** path
to the root `flowforge-dev-env` repository with `data` appended. For example:

```yaml
db:
  logging: false
  type: postgres
  host: /path/to/flowforge-dev-env/data
  port: 54321
```

Than run `npm run init` to setup your database.

Start the server by running `postgres -s -D ./data/pg -k $(pwd)/data -p 54321`
from the root directory, and keep the terminal window open. Just once you'll
need to run `createdb -h $(pwd)/data -p 54321 flowforge`.
