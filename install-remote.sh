#!/bin/bash
set -e

echo "🚀 Installing development environment on remote VM..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# Install Node.js (LTS version)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - > /dev/null 2>&1
sudo apt-get install -y nodejs -qq

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# Install Python 3.11
echo "🐍 Installing Python 3.11..."
sudo apt-get install -y software-properties-common -qq
sudo add-apt-repository -y ppa:deadsnakes/ppa > /dev/null 2>&1
sudo apt-get update -qq
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip build-essential -qq

# Set Python 3.11 as default
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
sudo update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1

echo "✅ Python: $(python --version)"

# Install Git
echo "📦 Installing Git..."
sudo apt-get install -y git -qq

echo "✅ Git: $(git --version)"

# Install Claude Code globally
echo "🤖 Installing Claude Code..."
sudo npm install -g @anthropic-ai/claude-code

echo "✅ Claude Code: $(claude --version)"

# Create Python virtual environment
echo "🐍 Creating Python virtual environment..."
python3.11 -m venv .venv
source .venv/bin/activate

# Upgrade pip
pip install --upgrade pip -q

# Install Python dependencies
echo "📦 Installing Python packages..."
pip install -q numpy faiss-cpu sentence-transformers fastmcp anthropic openai tiktoken pandas scikit-learn requests beautifulsoup4 python-dotenv tqdm

echo "✅ Python packages installed"

# Install npm packages
echo "📦 Installing Node.js packages..."
npm install --loglevel=error

echo "✅ npm packages installed"

# Generate MCP config
echo "🔧 Generating MCP configuration..."
bash setup-mcp-config.sh

# Build project
echo "🏗️  Building project..."
npm run build

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Add ANTHROPIC_API_KEY to ~/.bashrc"
echo "  2. Run ./autonomous-worker.sh to test"
echo "  3. Set up systemd timer for autonomous operation"
echo ""
