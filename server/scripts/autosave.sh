#!/bin/bash

autosave () {
    previous_autosave_path=$(ls dbDumps/autosave* | tail -n 1)
    
    # create current autosave
    current_autosave_name=autosave`date +%s`
    [ -d dbDumps ] || mkdir dbDumps
    pg_dump --host=localhost --username=mosaic mosaic_dev > dbDumps/$current_autosave_name.db

    # if contents of the current autosave are the same as contents of the previous autosave, delete the current autosave
    if [ $previous_autosave_path ]
        then
            current_autosave_path=dbDumps/${current_autosave_name}.db
            if cmp --silent "$previous_autosave_path" "$current_autosave_path"
                then
                    rm $current_autosave_path
            fi
    fi

    sleep $1
    autosave $1
}

if [ $# -eq 0 ]
    then
        echo "ERROR: Please specify how many seconds to sleep for."
        exit 1
fi

autosave $1


