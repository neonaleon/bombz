# bombz

## Intro
CS4344 Networked and Mobile Gaming Final Project

## Client (./server/client)

### Directory structure
* bin - packaged files will be output here
* package - contains only/all files to be packaged & deployed
* deploy.sh - script to deploy application to the device

### Setup
* follow [PlayBook Devel](http://blog.nus.edu.sg/cs4344/playbook-devel/) until end of step 6
* configure variables in deploy.sh
* deploy to device with ./deploy.sh

## Server (./server)

### Setup
* sudo npm link
* sudo node main.js
