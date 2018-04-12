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
0. Run `yarn run dump-db` with a name for your dump, e.g. `yarn run dump-db myDump`

### Restore

First, make sure that your Postgress connection string is set properly in your shell profile:

fish shell:
`set -x CONNECTION_STRING_DEV postgres://mosaic:MDaUA2P4ZbkJPCKEM@localhost:5432/mosaic_dev`

bash:
`export CONNECTION_STRING_DEV=postgres://mosaic:MDaUA2P4ZbkJPCKEM@localhost:5432/mosaic_dev`

Also, make sure that you have the Postgres command line tools in your shell PATH. You should have the command `psql`.

If you don't have it, and you installed Postgres via the Postgres app, you probably just need to add something like this to your PATH: `/Applications/Postgres.app/Contents/Versions/10/bin`

0. If the app is not running, run it (`docker-compose up`)
0. Close all external connections to the database (e.g. from pgadmin)
0. Place the dump file in `dbDumps/` if it's not there already 
0. Run `yarn run restore-db` with the name of the dump you're restoring, e.g. `yarn run restore-db myDump`

### Troubleshooting
- One error case is that the scripts attempt to connect to the db w/ your system username, which probably won't work. If this happens, it's probably b/c you have an open connection to the db other than the script. (For some reason this causes the scripts to ignore the configs that you pass in and attempt to connect as the "default" user, which is your system user.) Perhaps you're accidentally running the mosaic app itself, or maybe you're running a tool like pgadmin. Obviously the fix is to kill those other connections and try again.