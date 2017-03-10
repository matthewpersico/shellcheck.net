#!/bin/bash
# This file is invoked by shellcheck.php

export LC_CTYPE=en_US.utf8
ulimit -v 80000
ulimit -t 3
exec shellcheck -f json -
