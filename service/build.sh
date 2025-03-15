#!/bin/bash

echo "Building gateway ..."
docker build -t shenzhouyinji/gateway ./gateway

echo "Building account service ..."
docker build -t shenzhouyinji/accountservice ./account