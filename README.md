# Mosaic 

A platform for individuals to complete small tasks

## Setup

### (Recommended) Using Docker

1. Make sure Docker is downloaded and running on your computer. You can get it here: https://www.docker.com/community-edition#/download
2. Run `docker-compose up`

### (Deprecated) Using yarn scripts directly

Note: this method is deprecated and is likely to be incompatible w/ testing and w/ backing up and restoring the database.

1. Set up the node server.
  First, change the config/config.json file to use your local db creds.
  
```
cd server;
yarn run db:create
yarn run db:migrate
yarn run db:seed
yarn start
```

2. Start the react-create-app client

```
cd client 
yarn start
```

## Testing

- Backend:

To run the tests:

```
cd server
yarn test
```

To use Visual Studio Code to debug while running the tests:
1. Click on the debug menu
2. Select "Mocha Tests"
3. Click the run button

## LogRocket

We have a LogRocket integration for monitoring sessions, including Redux store. Ask Andrew Schreiber for the login information.

URL: https://app.logrocket.com/i58gnp/mosaic/

## Save and restore db states

### Save

1. If the app is not running, run it (`docker-compose up`)
1. `cd server`
1. `scripts/dumpDB.sh` with a filepath for your dump, e.g. `scripts/dumpDB.sh ./dbDumps/myDump.db`

### Restore

1. If the app is not running, run it (`docker-compose up`)
1. Close all external connections to the database (e.g. from pgadmin)
1. `cd server`
1. `scripts/restoreDB.sh` with a filepath for the dump you're restoring, e.g. `scripts/restoreDB.sh ./dbDumps/myDump.db`

### Troubleshooting
- One error case is that the scripts attempt to connect to the db w/ your system username, which probably won't work. If this happens, it's probably b/c you have an open connection to the db other than the script. (For some reason this causes the scripts to ignore the configs that you pass in and attempt to connect as the "default" user, which is your system user.) Perhaps you're running a tool like pgadmin or PSequel. Obviously the fix is to kill those other connections and try again.
- relatedly, you may get this error if you try to restore the DB while the code is recompiling: `ERROR: database "mosaic_dev" is being accessed by other users`. If you do, wait until the code is done compiling and try again.

### Autodump

To automatically create new dumps when the db changes:
1. If the app is not running, run it (`docker-compose up`)
1. `cd server`
1. `scripts/autodump.sh` with a filepath for the directory to save the dumps to and the number of seconds to wait between checking whether the db has changed, e.g. `scripts/autodump.sh autodumps 30`

## Deployment
We deploy the app on Heroku: https://dashboard.heroku.com/apps/mosaic-prod

To create a development build on your branch, create a pull request. A link to a development build with the latest version of your branch will be on your PR page. If your deployed branch - Review App in Heroku terminology - expires you must go to the (pipeline)[https://dashboard.heroku.com/pipelines/00d7422d-a5ee-4b56-ae40-76c0ade1a023] and click `Create Review App` to redeploy it.

When a branch is merged to master, it is automatically pushed to Heroku.

`docker-compose.yml` and `package.json` at the root level must be kept in sync.

## Publishing Example subtrees
In order to make an example subtrees, do the following steps:

1. Open the application for a specific subtree. Go to the ``/subtree/`` url for that subtree.
1. Open the graphQl explorer. Click on "queries." There should be a query called "workspaceQuery" in the "Watched Queries" view. Run it. If you can't find it, the following code may work:

``` js
query workspaceSubtree($workspaceId: String!) {
  subtreeWorkspaces(workspaceId: $workspaceId) {
    id
    childWorkspaceOrder
    connectedPointers
    blocks {
      id
      value
      type
      __typename
    }
    __typename
  }
}
//Query Variables
{
  "workspaceId": "YOUR ROOT TREE WORKSPACE ID HERE"
}
```

1. Copy the response from the graphQL workSpaceSubtree query.
1. Use the website https://json-to-js.com/ to convert this json object into a javascript object.
1. Create a new file in the ``/client/src/pages/ExampelShowPage/examples`` directory. Add this javascript object in it, exported as the variable ``data.`` For guidance, you can check out other items (like ``example1.ts``) in that directory. 
1. Edit the file ``/client/src/pages/ExampelShowPage/examples/index.ts``: add an object (in the ``examples`` hash) for your new example, with it's name, rootWorkspaceId (the first one you want to show), and url extension (this will go after /examples/${url}.)
1. Now you should be able to visit this example at ``/client/src/pages/ExampelShowPage/examples/{#example-url}``
