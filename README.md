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
