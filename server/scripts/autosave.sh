#!/bin/bash
save () {
    scripts/dumpDB.sh autosave`date +%s`
    echo "Autosave complete!"
    sleep 30
    save
}

save