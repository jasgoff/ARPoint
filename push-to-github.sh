#!/bin/bash

# AR Survey - GitHub Setup and Push Script

echo "======================================"
echo "🚀 AR Survey - GitHub Setup"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 Initializing git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}📝 Creating .gitignore...${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.py[cod]
*$py.class
.Python
env/
venv/
ENV/

# Build outputs
build/
dist/
*.egg-info/
.next/

# Environment variables
.env
.env.local
.env.*.local
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Misc
.emergent/
*.orig
EOF
    echo -e "${GREEN}✅ .gitignore created${NC}"
fi

echo ""
echo "======================================"
echo "Step 1: Commit Changes"
echo "======================================"

# Add all files
git add .

# Commit
echo -e "${YELLOW}📝 Enter commit message (or press Enter for default):${NC}"
read -p "Message: " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update AR Survey app with new features"
fi

git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✅ Changes committed${NC}"

echo ""
echo "======================================"
echo "Step 2: Setup GitHub Remote"
echo "======================================"

# Check if remote exists
if git remote | grep -q "origin"; then
    echo -e "${GREEN}✅ Remote 'origin' already exists${NC}"
    git remote -v
else
    echo -e "${YELLOW}🔗 Enter your GitHub repository URL:${NC}"
    echo "Example: https://github.com/username/repo-name.git"
    read -p "URL: " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        echo -e "${RED}❌ No URL provided. Skipping remote setup.${NC}"
    else
        git remote add origin "$REPO_URL"
        echo -e "${GREEN}✅ Remote added${NC}"
    fi
fi

echo ""
echo "======================================"
echo "Step 3: Push to GitHub"
echo "======================================"

# Get current branch
BRANCH=$(git branch --show-current)

echo -e "${YELLOW}📤 Pushing to GitHub (branch: ${BRANCH})...${NC}"

# Push
if git push -u origin "$BRANCH" 2>&1 | tee /tmp/git_push.log; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
else
    if grep -q "fatal: repository .* not found" /tmp/git_push.log; then
        echo -e "${RED}❌ Repository not found${NC}"
        echo -e "${YELLOW}Please create the repository on GitHub first:${NC}"
        echo "1. Go to https://github.com/new"
        echo "2. Create a new repository"
        echo "3. Run this script again"
    elif grep -q "rejected" /tmp/git_push.log; then
        echo -e "${YELLOW}⚠️  Push rejected. Pulling changes first...${NC}"
        git pull origin "$BRANCH" --rebase
        git push -u origin "$BRANCH"
    fi
fi

echo ""
echo "======================================"
echo "🎉 Done!"
echo "======================================"
echo ""
echo "Your code is now on GitHub!"
echo ""
