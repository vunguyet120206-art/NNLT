#!/bin/bash

# Script to fix port conflicts for Hero Lab

echo "🔧 Fixing port conflicts..."

# Stop and remove existing containers
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Remove old containers
echo "Removing old containers..."
docker ps -a | grep hero-lab | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true

# Kill processes on ports 8000 and 3000
echo "Checking ports..."

if lsof -ti :8000 > /dev/null 2>&1; then
    echo "⚠️  Port 8000 is in use. Killing process..."
    lsof -ti :8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if lsof -ti :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use. Killing process..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "✅ Ports should be free now"
echo ""
echo "You can now run: docker-compose up -d --build"

