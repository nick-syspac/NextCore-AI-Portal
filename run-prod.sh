#!/bin/bash

# NextCore AI Portal - Production Build & Start
# This script builds and runs the production version

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  NextCore AI Portal - Production      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules not found. Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Build the application
echo -e "${BLUE}Building production bundle...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Build successful!${NC}"
    echo ""
    echo -e "${BLUE}Starting production server...${NC}"
    echo ""
    echo -e "${BLUE}Server will be available at:${NC}"
    echo "  ${GREEN}http://localhost:3000${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Start the production server
    npm start
else
    echo ""
    echo -e "${RED}✗ Build failed. Please check the errors above.${NC}"
    exit 1
fi
