#!/bin/bash

# NextCore AI Portal - Server Management Script
# Quick commands to manage the local development and production servers

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  NextCore AI Portal - Server Manager  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo "  ./run.sh [command]"
    echo ""
    echo -e "${CYAN}Commands:${NC}"
    echo -e "  ${GREEN}dev${NC}       Start development server (hot reload)"
    echo -e "  ${GREEN}build${NC}     Build production bundle"
    echo -e "  ${GREEN}start${NC}     Start production server (requires build)"
    echo -e "  ${GREEN}prod${NC}      Build and start production server"
    echo -e "  ${GREEN}lint${NC}      Run ESLint"
    echo -e "  ${GREEN}install${NC}   Install/update dependencies"
    echo -e "  ${GREEN}clean${NC}     Clean build artifacts and cache"
    echo -e "  ${GREEN}help${NC}      Show this help message"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo "  ./run.sh dev     # Start development server"
    echo "  ./run.sh prod    # Build and run production"
    echo ""
}

case "$1" in
    dev)
        echo -e "${GREEN}Starting development server...${NC}"
        npm run dev
        ;;
    build)
        echo -e "${BLUE}Building production bundle...${NC}"
        npm run build
        ;;
    start)
        echo -e "${GREEN}Starting production server...${NC}"
        npm start
        ;;
    prod)
        echo -e "${BLUE}Building and starting production server...${NC}"
        npm run build && npm start
        ;;
    lint)
        echo -e "${BLUE}Running ESLint...${NC}"
        npm run lint
        ;;
    install)
        echo -e "${BLUE}Installing dependencies...${NC}"
        npm install
        ;;
    clean)
        echo -e "${YELLOW}Cleaning build artifacts...${NC}"
        rm -rf .next
        rm -rf node_modules/.cache
        echo -e "${GREEN}✓ Clean complete${NC}"
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
