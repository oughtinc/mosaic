#!/bin/bash
# note: this will clear out the current contents of your database
docker-compose up -d postgres
cd server/
yarn run db:clear