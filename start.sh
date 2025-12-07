#!/bin/bash

# JuuxHair2 - Start Frontend & Backend
# Usage: ./start.sh

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/hairfit_server"
FRONTEND_DIR="$PROJECT_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  JuuxHair2 - Starting Services${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}Services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "\n${YELLOW}[1/2] Starting Backend (FastAPI)...${NC}"
cd "$BACKEND_DIR"

if [ -d "venv" ]; then
    source venv/bin/activate
fi

uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo -e "${GREEN}Backend started (PID: $BACKEND_PID) → http://localhost:8000${NC}"

# Wait for backend to be ready
sleep 2

# Start Frontend
echo -e "\n${YELLOW}[2/2] Starting Frontend (Vite)...${NC}"
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend started (PID: $FRONTEND_PID) → http://localhost:3000${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  All services running!${NC}"
echo -e "${GREEN}  Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}  Backend:  http://localhost:8000${NC}"
echo -e "${GREEN}  Press Ctrl+C to stop all services${NC}"
echo -e "${GREEN}========================================${NC}"

# Wait for both processes
wait
