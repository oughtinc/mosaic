#!/bin/bash
save () {
    scripts/dumpDB.sh autosave`date +%s`
    echo "Autosave complete!"
    sleep 5
    save
}

save