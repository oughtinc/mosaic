#!/bin/bash

# Usage: pass the path to save the dump
# e.g. scripts/dumpDB.sh dbDumps/dbmyDump.db

# pass false as the 2nd param to supress success message

set -e

if [ $# -eq 0 ]
  then
    echo "ERROR: Please supply a filepath for this dump."
    exit 1
fi

dump_dir=$(dirname $1)

[ -d $dump_dir ] || mkdir -p $dump_dir

docker exec mosaic_postgres_1 pg_dump --host=localhost --username=mosaic mosaic_dev > $1

if [ ! $2 ];
    then
        echo Dump successfully created at $1
fi