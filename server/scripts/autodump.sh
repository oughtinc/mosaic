#!/bin/bash

# Usage: 1st argument is filepath to dump directory,
# 2nd argument is seconds to wait between dumps
# e.g. scripts/autodump.sh autodumps 30

# You can restore these dumps using scripts/restoreDB.sh

if [ ! $2 ]
    then
        echo "ERROR: Please pass filepath to dump directory (1st arg) and seconds to wait between dumps (2nd arg)."
        exit 1
fi

[ -d $1 ] || mkdir -p $1

previous_autodump_path=$(ls $1/autodump* | tail -n 1)

# create current autodump
current_autodump_path=$1/autodump`date +%s`.db
pg_dump --host=localhost --username=mosaic mosaic_dev > $current_autodump_path

# if contents of the current autodump are the same as contents of the previous autodump, delete the current autodump
if [ $previous_autodump_path ]
    then
        if cmp --silent "$previous_autodump_path" "$current_autodump_path"
            then db_unchanged=true
        fi
fi

if [ $db_unchanged ]
    then
        rm $current_autodump_path
        echo "db has not changed since last autodump, skipping autodump"
else
    echo "created new autodump" $current_autodump_path
fi

# repeat after waiting the specified amount
sleep $2
$0 $1 $2



