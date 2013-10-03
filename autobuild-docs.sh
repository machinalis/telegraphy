#!/bin/bash

function check_installed {
    which $1 >/dev/null
    status=$?
    if [ $status -ne 0 ]; then
        echo "Could not execute $1. Please install it first!"
        exit 1
    fi
}

check_installed inotifywait

echo "Autobuiding doc on RST changes"
while true
    do
    inotifywait -r -e modify -e move -e create -e delete ./doc
    {
        echo "file changed; time to run make html"
        make -C doc html
        which notify-send && notify-send "Telegraphy Sphinx doc built"
    }
done
