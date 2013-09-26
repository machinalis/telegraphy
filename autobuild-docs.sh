#!/bin/bash

echo "Autobuiding doc on RST changes"
while true
    do
    inotifywait -r -e modify -e move -e create -e delete ./doc
    {
        echo "file changed; time to run make html"
        make -C doc html
        which notify-send && notify-send "Telegraphy Sphinx doc builded"
    }
done
