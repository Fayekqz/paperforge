#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Ensure Node.js and npm are available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed or not in PATH."
    exit 1
fi

# Install dependencies if missing
if [ ! -d "node_modules" ]; then
    echo "Installing project dependencies..."
    npm install
fi

MODE="${1:-dev}"

case "$MODE" in
    prod|production|start)
        echo "Building and starting production server..."
        npm run build
        echo "Server running at http://localhost:3000"
        npm run start
        ;;
    build)
        echo "Building application bundle..."
        npm run build
        ;;
    *)
        echo "Starting Next.js development server on http://localhost:3000..."
        npm run dev
        ;;
esac
