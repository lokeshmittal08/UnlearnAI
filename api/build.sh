#!/bin/bash

# Remove existing api image if it exists
docker rmi api:latest || true

if [ "$1" = "--local" ]; then
    echo "Building for local platform (macOS ARM64)..."
    docker build -t api:latest .
    docker save api:latest -o api.tar
    echo "Docker image saved as api.tar"
else
    echo "Building for x86 (linux/amd64)..."
    docker buildx build --platform linux/amd64 --load -t api_x86:latest .
    docker save api_x86:latest -o api_x86.tar
    echo "Docker image saved as api_x86.tar"
fi

# Save the image as api.tar

