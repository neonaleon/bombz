#!/bin/bash

# set these variables
IP=192.168.1.113
DEVPASSWD=274344
SDKBIN=/Developer/BlackBerryWebWorksSDK/bbwp

# do not touch from this point
export PATH=$PATH:$SDKBIN:$SDKBIN/blackberry-tablet-sdk/bin

# package
rm bin/*
cd package
zip -r ../bin/package.zip . -x ".DS_Store"
cd ..
bbwp bin/package.zip -d -o bin

# deploy
blackberry-deploy -installApp -password $DEVPASSWD -device $IP -package bin/package.bar
