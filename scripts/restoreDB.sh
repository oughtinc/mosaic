#!/bin/bash
# WARNING: this will overwrite the current state of the db.
if [ $# -eq 0 ]
  then
    echo "ERROR: Please specify the name of the dump you'd like to restore."
    exit 1
fi
docker pause mosaic_web_1 mosaic_api_1
cd server/
yarn run db:clear
cd ..
psql --host=localhost --username=mosaic mosaic_dev < dbDumps/$1.db
docker unpause mosaic_web_1 mosaic_api_1