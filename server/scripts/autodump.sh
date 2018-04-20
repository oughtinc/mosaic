#!/bin/bash

# Note: You can find the autodumps in server/autodumps,
# and you can copy one to server/dbDumps in order to restore it

autodump () {
    previous_autodump_path=$(ls autodumps/autodump* | tail -n 1)
    
    # create current autodump
    current_autodump_name=autodump`date +%s`
    [ -d autodumps ] || mkdir autodumps
    pg_dump --host=localhost --username=mosaic mosaic_dev > autodumps/$current_autodump_name.db

    # if contents of the current autodump are the same as contents of the previous autodump, delete the current autodump
    if [ $previous_autodump_path ]
        then
            current_autodump_path=autodumps/${current_autodump_name}.db
            if cmp --silent "$previous_autodump_path" "$current_autodump_path"
                then
                    rm $current_autodump_path
            fi
    fi

    sleep $1
    autodump $1
}

if [ $# -eq 0 ]
    then
        echo "ERROR: Please specify how many seconds to sleep for."
        exit 1
fi

autodump $1


