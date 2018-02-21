# sps

Simple prediction system. 

Doesn't yet have user authentication. Aggregate predictions currently made as a simple average of all previous ones, instead of the most recent by each user.


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
