#!/bin/bash

docker-compose up
echo reached
cd server
scripts/autodump.sh 1