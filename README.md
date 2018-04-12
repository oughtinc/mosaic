# Mosaic 

A platform for individuals to complete small tasks

## Setup

### (Recommended) Using Docker

0. Make sure Docker is downloaded and running on your computer. You can get it get it here: https://www.docker.com/community-edition#/download
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
0. Use psql or pgadmin to create a sql dump of the db. E.g. see these instructions: https://www.pgadmin.org/docs/pgadmin4/1.x/backup_dialog.html

### Restore

First, make sure that you Postgress connection string is set properly in your shell profile:

fish shell:
`set -x CONNECTION_STRING_DEV postgres://mosaic:MDaUA2P4ZbkJPCKEM@localhost:5432/mosaic_dev`

bash:
`export CONNECTION_STRING_DEV=postgres://mosaic:MDaUA2P4ZbkJPCKEM@localhost:5432/mosaic_dev`

JTBC, the following steps will clear the current contents of your database -- be careful!
0. Close all external connections to the database (e.g. from pgadmin)
0. `yarn run erase-db`
0. Use psql or pgadmin to restore the db from a backup. E.g. see these instructions: https://www.pgadmin.org/docs/pgadmin4/dev/restore_dialog.html
0. `yarn run unpause-app`. You can now use the app w/ the restored db

### Troubleshooting
- One error case is that the scripts attempt to connect to the db w/ your system username, which should not work. If this happens, it's probably b/c you have an open connection to the db other than the script. (For some reason this causes the scripts to ignore the configs that you pass in and attempt to connect as the "default" user, which is your system user.) Perhaps you're accidentally running the app itself, or maybe you're running a tool like pgadmin. Obviously the fix is to kill those other connections and try again.