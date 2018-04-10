# Mosaic 

A platform for individuals to complete small tasks

## Setup

1. Set up the node server.
  First, change the config/config.json file to use your local db creds.
  
```
cd server;
npm run db:create
npm run db:migrate
npm run db:seed
npm run start
```

2. Start the react-create-app client

```
cd client 
npm run start
```

## Testing

- Backend:

To run the tests:

```
cd server
npm run test
```

To use Visual Studio Code to debug while running the tests:
1. Click on the debug menu
2. Select "Mocha Tests"
3. Click the run button
