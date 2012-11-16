#!/bin/bash

# set these variables
PIN=50228A9F
IP=192.168.1.104
DEVPASSWD=274344
DEBUGTOKEN=~/Desktop/debugtoken.bar
SDKBIN=/Developer/BlackBerryWebWorksSDK/bbwp

# do not touch from this point
export PATH=$PATH:$SDKBIN:$SDKBIN/blackberry-tablet-sdk/bin

# deploy
blackberry-deploy -installDebugToken $DEBUGTOKEN -device $IP -password $DEVPASSWD
