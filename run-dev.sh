#!/bin/bash

# NextCore AI Portal - Local Development Server
# This script starts the Next.js development server

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  NextCore AI Portal - Dev Server      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules not found. Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ .env.local not found. Creating from example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✓ Created .env.local from .env.example${NC}"
    else
        echo -e "${YELLOW}  Note: You may need to create .env.local manually${NC}"
    fi
    echo ""
fi

# Display environment info
echo -e "${GREEN}✓ Starting development server...${NC}"
echo ""
echo -e "${BLUE}Environment:${NC}"
echo "  Node version: $(node --version)"
echo "  npm version:  $(npm --version)"
echo ""
echo -e "${BLUE}Server will be available at:${NC}"
echo "  ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the development server
npm run dev
