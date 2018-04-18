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
0. `scripts/dumpDB.sh` with a name for your dump, e.g. `scripts/dumpDB.sh myDump`

Note that `docker-compose up` automatically runs `server/scripts/autodumps.sh`, which stores auto db dumps in `server/autodumps`

### Restore

0. If the app is not running, run it (`docker-compose up`)
0. Close all external connections to the database (e.g. from pgadmin)
0. `cd server`
0. Place the dump file in `server/dbDumps` if it's not there already 
0. Run `scripts/restoreDB.sh` with the name of the dump you're restoring, e.g. `scripts/restoreDB.sh myDump`

To restore an autodump, move it `server/dbDumps` and follow the steps above

### Troubleshooting
- One error case is that the scripts attempt to connect to the db w/ your system username, which probably won't work. If this happens, it's probably b/c you have an open connection to the db other than the script. (For some reason this causes the scripts to ignore the configs that you pass in and attempt to connect as the "default" user, which is your system user.) Perhaps you're running a tool like pgadmin or PSequel. Obviously the fix is to kill those other connections and try again.