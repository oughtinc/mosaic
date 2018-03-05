# Docker

This will be replaced later with `docker-compose`.

Before running this, make sure you have the latest node image:

```
docker pull node:latest
```

Execute all `docker run` commands below in the Mosaic root folder.

## Server

1. Update server/config/config.json, e.g. like this:

```
"development": {
  "user": "mosaic",
  "username": "mosaic",
  "password": "MDaUA2P4ZbkJPCKEM",
  "database": "mosaic_dev",
  "host": "127.0.0.1",
  "dialect": "postgres"
}
```

1. Run the database server:

```
docker run -it --rm --name mosaic-db -e POSTGRES_PASSWORD="MDaUA2P4ZbkJPCKEM" -e POSTGRES_USER="mosaic" postgres
```

2. Run the API server and initialize the database:

```
docker run -it -p 8080:8080 --link mosaic-db:postgres -v "`pwd`":/data node bash
```

3. Install package dependencies

```
cd /data/server
yarn
```

4. Update the config to reflect the actual postgres server location, found like this:

```
env | grep POSTGRES_PORT_5432_TCP_ADDR
```

5. Initialize the API server

```
yarn run db:create
yarn run db:migrate
yarn run db:seed
yarn run start
```

This is accessible at http://0.0.0.0:8080/graphiql


6. (Optional:) Run pgweb database browser

```
docker run -p 8081:8081 --link mosaic-db:postgres -e DATABASE_URL=postgres://mosaic:MDaUA2P4ZbkJPCKEM@172.17.0.2:5432/mosaic_dev?sslmode=disable sosedoff/pgweb
```

This is accessible at http://0.0.0.0:8081/

## Client

```
docker run -it -p 3000:3000 -v "`pwd`":/data node bash
cd /data/client
yarn
yarn run start
```

The client is served at http://0.0.0.0:3000
