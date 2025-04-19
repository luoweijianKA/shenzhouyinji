#!/bin/bash
pid=$(ss -lnpt|grep 8080|awk -F '[,=]' '{print$3}')
app=gateway
dir=/data/shenzhouyinji/service/$app
kill -9 $pid
DB_SOURCE="szyj:shenzhouyinji@tcp(127.0.0.1:3306)/shenzhouyinji" \
CONSUL_REG_ADDRESS="127.0.0.1:8500" \
WECHAT_APPID="wx2b36c7777353cd2e" \
WECHAT_SECRET="8a7bca23c18dbc558ae623ba89041699" \
nohup $dir/$app > nohup.out 2>&1 &
