# Mosaic 

A platform for individuals to complete small tasks

## Setup

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
- Use psql or pgadmin to create a sql dump of the db. E.g. see these instructions: https://www.pgadmin.org/docs/pgadmin4/1.x/backup_dialog.html

### Restore

First, make sure that you Postgress connection string is set properly:

fish shell:
`set -x CONNECTION_STRING_DEV postgres://mosaic:MDaUA2P4ZbkJPCKEM@localhost:5432/mosaic_dev`

bash:
`export CONNECTION_STRING_DEV=postgres://mosaic:MDaUA2P4ZbkJPCKEM@localhost:5432/mosaic_dev`

JTBC, this will clear the current contents of your database -- be careful!
0. Kill the app and close all connections to the database
0. Run `scripts/prepRestoreDB.sh`
0. Use psql or pgadmin to restore the db from a backup. E.g. see these instructions: https://www.pgadmin.org/docs/pgadmin4/dev/restore_dialog.html
0. Run the app normally
