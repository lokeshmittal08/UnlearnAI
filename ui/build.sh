#!/bin/bash

# Build the project
npm run build

# Remove existing docs folder
rm -rf ../docs

# Create docs folder
mkdir -p ../docs

# Move contents of dist to docs
mv ./dist/* ../docs/ 2>/dev/null || true
mv ./dist/.* ../docs/ 2>/dev/null || true

# Remove empty dist directory
rmdir ./dist