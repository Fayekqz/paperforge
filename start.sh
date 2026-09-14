#!/bin/bash

# ============================================================
#  PaperForge — Academic Question Paper Generator
#  Start Script
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║         PaperForge — Academic Paper Generator        ║${RESET}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""

echo -e "${YELLOW}► Checking Node.js installation...${RESET}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js is not installed. Please install from https://nodejs.org${RESET}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node -v)${RESET}"

echo ""
echo -e "${YELLOW}► Checking dependencies...${RESET}"
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo -e "${YELLOW}  Installing dependencies (first-time only)...${RESET}"
  cd "$SCRIPT_DIR" && npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Dependency installation failed.${RESET}"
    exit 1
  fi
  echo -e "${GREEN}✓ Dependencies installed.${RESET}"
else
  echo -e "${GREEN}✓ Dependencies already installed.${RESET}"
fi

PORT=3000
echo ""
echo -e "${YELLOW}► Checking port availability...${RESET}"
if lsof -Pi :$PORT -sTCP:LISTEN -t &> /dev/null; then
  echo -e "${YELLOW}  Port 3000 in use. Switching to port 3001...${RESET}"
  PORT=3001
fi
echo -e "${GREEN}✓ Using port ${PORT}${RESET}"

echo ""
echo -e "${BOLD}  Opening: ${CYAN}http://localhost:${PORT}${RESET}"
echo -e "${BOLD}  Press ${RED}Ctrl + C${RESET}${BOLD} to stop.${RESET}"
echo ""

(sleep 2 && open "http://localhost:${PORT}") &

cd "$SCRIPT_DIR" && npm run dev -- -p $PORT
