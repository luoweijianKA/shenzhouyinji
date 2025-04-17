#!/bin/bash
DB_SOURCE="root:shenzhouyinji@tcp(127.0.0.1:3306)/shenzhouyinji" \
CONSUL_REG_ADDRESS="127.0.0.1:8500" \
nohup $dir/$app > nohup.out 2>&1 &
