#!/bin/bash
if [ $# -eq 0 ]
  then
    echo "ERROR: Please supply a filepath for this dump."
    exit 1
fi

dump_dir=$(dirname $1)

if [ ! -d $dump_dir ]; then
    echo "ERROR: There is no directory at the filepath you specified."
    exit 1
fi

docker exec mosaic_postgres_1 pg_dump --host=localhost --username=mosaic mosaic_dev > $1