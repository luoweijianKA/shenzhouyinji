#!/bin/bash
pid=$(ss -lnpt|grep 5051|awk -F '[,=]' '{print$3}')
app=event
dir=/data/shenzhouyinji/service/$app
kill -9 $pid
DB_SOURCE="szyj:shenzhouyinji@tcp(127.0.0.1:3306)/shenzhouyinji" \
CONSUL_REG_ADDRESS="127.0.0.1:8500" \
nohup $dir/$app > nohup.out 2>&1 &
