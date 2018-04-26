# Mosaic 

A platform for individuals to complete small tasks

## Setup

### (Recommended) Using Docker

0. Make sure Docker is downloaded and running on your computer. You can get it here: https://www.docker.com/community-edition#/download
0. Run `docker-compose up`

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

## Save and restore db states

### Save
0. If the app is not running, run it (`docker-compose up`)
0. `cd server`
0. `scripts/dumpDB.sh` with a filepath for your dump, e.g. `scripts/dumpDB.sh ./dbDumps/myDump.db`

### Restore

0. If the app is not running, run it (`docker-compose up`)
0. Close all external connections to the database (e.g. from pgadmin)
0. `cd server`
0. `scripts/restoreDB.sh` with a filepath for the dump you're restoring, e.g. `scripts/restoreDB.sh ./dbDumps/myDump.db`

## LogRocket

We have a LogRocket integration for monitoring sessions, including Redux store. Ask Andrew Schreiber for the login information.

URL: https://app.logrocket.com/i58gnp/mosaic/

### Troubleshooting
- One error case is that the scripts attempt to connect to the db w/ your system username, which probably won't work. If this happens, it's probably b/c you have an open connection to the db other than the script. (For some reason this causes the scripts to ignore the configs that you pass in and attempt to connect as the "default" user, which is your system user.) Perhaps you're running a tool like pgadmin or PSequel. Obviously the fix is to kill those other connections and try again.
### Autodump

To automatically create new dumps when the db changes:
0. If the app is not running, run it (`docker-compose up`)
0. `cd server`
0. `scripts/dumpDB.sh` with a filepath for the directory to save the dumps to and the number of seconds to wait between checking whether the db has changed, e.g. `scripts/autodump.sh autodumps 30`

#### Troubleshooting
- One error case is that the scripts attempt to connect to the db w/ your system username, which probably won't work. If this happens, it's probably b/c you have an open connection to the db other than the script. (For some reason this causes the scripts to ignore the configs that you pass in and attempt to connect as the "default" user, which is your system user.) Perhaps you're running a tool like pgadmin or PSequel. Obviously the fix is to kill those other connections and try again.
- relatedly, you may get this error if you try to restore the DB while the code is recompiling: `ERROR: database "mosaic_dev" is being accessed by other users`. If you do, wait until the code is done compiling and try again.
