#!/bin/bash

# Build the project
npm run build

# Move dist to docs folder for deployment
mv ./dist ../docs