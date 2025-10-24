#!/bin/bash
#
# Install Presidio Dependencies for Conversation Redaction
#
# This script installs Microsoft Presidio and its dependencies
# for detecting and redacting sensitive information in conversation backups.

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Presidio Installation ===${NC}"
echo "Installing Microsoft Presidio for conversation redaction"
echo ""

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found${NC}"
    echo "  Please install Python 3.8+ first"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"
echo ""

# Check pip
if ! python3 -m pip --version &> /dev/null; then
    echo -e "${YELLOW}⚠ pip not found, attempting to install...${NC}"
    python3 -m ensurepip --default-pip
fi

echo -e "${BLUE}Installing Presidio packages...${NC}"
echo "  This may take a few minutes..."
echo ""

# Install from requirements file
python3 -m pip install -r scripts/redaction-requirements.txt

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Presidio installed successfully${NC}"
    echo ""
    echo "Test installation:"
    if python3 -c "from presidio_analyzer import AnalyzerEngine; print('✓ presidio-analyzer OK')" && \
       python3 -c "from presidio_anonymizer import AnonymizerEngine; print('✓ presidio-anonymizer OK')"; then
        echo ""
        echo -e "${GREEN}✓ All modules working correctly${NC}"
        echo ""
        echo "You can now use:"
        echo "  bash claude-conversations/backup-conversations.sh --redact"
    else
        echo -e "${RED}✗ Module import failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Installation failed${NC}"
    echo ""
    echo "Try installing manually:"
    echo "  pip install presidio-analyzer presidio-anonymizer"
    exit 1
fi

# Optional: SpaCy model
echo ""
echo -e "${YELLOW}Optional: Enhanced Detection${NC}"
echo "For better entity recognition, install SpaCy language model:"
echo ""
echo "  python3 -m pip install spacy"
echo "  python3 -m spacy download en_core_web_lg"
echo ""
echo "(Requires ~500MB download, provides better detection of PII)"
