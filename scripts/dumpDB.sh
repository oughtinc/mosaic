#!/bin/bash
if [ $# -eq 0 ]
  then
    echo "ERROR: Please supply a name for this dump."
    exit 1
fi
[ -d dbDumps ] || mkdir dbDumps
docker exec mosaic_postgres_1 pg_dump --host=localhost --username=mosaic mosaic_dev > dbDumps/$1.db