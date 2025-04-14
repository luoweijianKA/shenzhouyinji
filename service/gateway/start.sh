#!/bin/bash
DB_SOURCE="root:shenzhouyinji@tcp(127.0.0.1:3306)/shenzhouyinji" \
CONSUL_REG_ADDRESS="127.0.0.1:8500" \
APPID="wx2b36c7777353cd2e" \
SECRET="8a7bca23c18dbc558ae623ba89041699" \
nohup $dir/$app > nohup.out 2>&1 &
