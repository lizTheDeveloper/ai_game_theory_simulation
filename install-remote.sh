#!/bin/bash
set -e  # Exit on error

echo "🚀 Installing development environment on remote-claude VM..."

# Get the project directory (where this script is located)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Project directory: $PROJECT_DIR"

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install essential build tools
echo "🔨 Installing build essentials..."
sudo apt-get install -y build-essential curl wget git vim

# Install Node.js (LTS version)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install Python 3.11+ (Ubuntu 22.04 comes with Python 3.10, so we'll install 3.11)
echo "🐍 Installing Python 3.11..."
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Set Python 3.11 as default
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
sudo update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1

# Verify Python installation
echo "✅ Python version: $(python --version)"

# Install Git (usually pre-installed, but just in case)
echo "📦 Ensuring Git is installed..."
sudo apt-get install -y git
echo "✅ Git version: $(git --version)"

# Install Claude Code globally
echo "🤖 Installing Claude Code..."
sudo npm install -g @anthropic-ai/claude-code

# Verify Claude installation
echo "✅ Claude Code installed: $(which claude 2>/dev/null || echo 'Not in PATH yet')"

# Clone the repository (if not already cloned)
if [ ! -d "$PROJECT_DIR/.git" ]; then
    echo "📥 Cloning repository..."
    read -p "Enter GitHub repository URL: " REPO_URL
    cd "$(dirname "$PROJECT_DIR")"
    git clone "$REPO_URL" "$(basename "$PROJECT_DIR")"
    cd "$PROJECT_DIR"
else
    echo "✅ Repository already exists"
    cd "$PROJECT_DIR"
fi

# Configure Git
echo "🔧 Configuring Git..."
read -p "Enter your Git name (e.g., 'Ann Howard'): " GIT_NAME
read -p "Enter your Git email: " GIT_EMAIL
git config --global user.name "$GIT_NAME"
git config --global user.email "$GIT_EMAIL"

# Create Python virtual environment
echo "🐍 Creating Python virtual environment..."
cd "$PROJECT_DIR"
python3.11 -m venv .venv

# Activate virtual environment and install Python dependencies
echo "📦 Installing Python dependencies..."
source .venv/bin/activate

# Install Python packages for MCP RAG servers
pip install --upgrade pip
pip install numpy faiss-cpu sentence-transformers sqlite3 fastmcp

# Additional packages that might be needed
pip install anthropic openai tiktoken

echo "✅ Python packages installed in .venv"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build || echo "⚠️  Build failed - you may need to fix TypeScript errors"

# Run the MCP config setup script
echo "🔧 Setting up MCP configuration..."
bash "$PROJECT_DIR/setup-mcp-config.sh"

# Create a helpful startup script
cat > "$PROJECT_DIR/start-dev.sh" <<'DEVSCRIPT'
#!/bin/bash
# Start development environment

# Activate Python virtual environment
source .venv/bin/activate

# Start development server
npm run dev
DEVSCRIPT
chmod +x "$PROJECT_DIR/start-dev.sh"

echo "✨ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Activate Python environment: source .venv/bin/activate"
echo "  2. Start development server: npm run dev"
echo "  3. Or use the helper script: ./start-dev.sh"
echo ""
echo "🔧 MCP config generated at: .claude/mcp-config.json"
echo "   This config uses relative paths and will work on any machine"
echo ""
echo "💡 To use Claude Code, run: claude"
echo ""
