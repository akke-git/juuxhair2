#!/bin/bash

# JuuxHair2 - Stop all services
# Usage: ./stop.sh

echo "Stopping JuuxHair2 services..."

# Kill Vite dev server (port 3000)
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "Frontend (port 3000) stopped" || echo "Frontend not running"

# Kill FastAPI server (port 8000)
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "Backend (port 8000) stopped" || echo "Backend not running"

echo "Done."
