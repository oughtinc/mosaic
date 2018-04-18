#!/bin/bash
# WARNING: this will overwrite the current state of the db.
if [ $# -eq 0 ]
  then
    echo "ERROR: Please specify the name of the dump you'd like to restore."
    exit 1
fi
docker exec mosaic_api_1  bash -c "cd data/ && yarn run db:clear"
docker exec -i mosaic_postgres_1 psql --host=localhost --username=mosaic mosaic_dev < dbDumps/$1.db
