#!/usr/bin/env python3
# Use venv if available, otherwise fall back to system python
"""
Conversation Redaction Script using Microsoft Presidio

Sanitizes conversation backup files by detecting and redacting sensitive information:
- API keys (Google, OpenAI, Anthropic, etc.)
- Private keys and certificates
- Service account credentials
- OAuth tokens
- Billing account numbers
- Email addresses (optional)
- IP addresses (optional)

Usage:
    python3 scripts/redact-conversations.py [--emails] [--ips]

Options:
    --emails    Also redact email addresses
    --ips       Also redact IP addresses
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Any

# Check if Presidio is installed
try:
    from presidio_analyzer import AnalyzerEngine, RecognizerRegistry
    from presidio_analyzer.predefined_recognizers import CreditCardRecognizer
    from presidio_anonymizer import AnonymizerEngine
    from presidio_anonymizer.entities import OperatorConfig
    PRESIDIO_AVAILABLE = True
except ImportError:
    PRESIDIO_AVAILABLE = False
    print("Warning: Presidio not installed. Install with: pip install presidio-analyzer presidio-anonymizer", file=sys.stderr)
    print("Falling back to regex-based redaction (less comprehensive)", file=sys.stderr)


class ConversationRedactor:
    """Redact sensitive information from conversation JSONL files"""

    def __init__(self, redact_emails=False, redact_ips=False):
        self.redact_emails = redact_emails
        self.redact_ips = redact_ips

        if PRESIDIO_AVAILABLE:
            self.analyzer = AnalyzerEngine()
            self.anonymizer = AnonymizerEngine()

        # Regex patterns for fallback or additional detection
        self.patterns = {
            # API Keys
            'google_api_key': re.compile(r'AIza[0-9A-Za-z\-_]{35}'),
            'google_oauth': re.compile(r'ya29\.[0-9A-Za-z\-_]+'),
            'anthropic_key': re.compile(r'sk-ant-[0-9A-Za-z\-_]{40,}'),
            'openai_key': re.compile(r'sk-[0-9A-Za-z]{48}'),
            'aws_key': re.compile(r'AKIA[0-9A-Z]{16}'),
            'github_token': re.compile(r'gh[pousr]_[0-9A-Za-z]{36,}'),

            # Private Keys
            'private_key_header': re.compile(r'-----BEGIN (?:RSA |EC )?PRIVATE KEY-----'),
            'gcp_service_account_key': re.compile(r'"private_key":\s*"[^"]+'),

            # GCloud Specific
            'service_account_email': re.compile(r'[a-z0-9\-]+@[a-z0-9\-]+\.iam\.gserviceaccount\.com'),
            'gcp_project_number': re.compile(r'\b\d{12}\b'),  # 12-digit project numbers
            'billing_account': re.compile(r'(?:billing[-_]account[-_]id|billingAccountId)[":\s]+([0-9A-F]{6}-[0-9A-F]{6}-[0-9A-F]{6})'),
        }

    def redact_text(self, text: str) -> str:
        """Redact sensitive information from text"""
        if not text:
            return text

        # Use Presidio if available
        if PRESIDIO_AVAILABLE:
            text = self._redact_with_presidio(text)

        # Apply regex patterns for specific formats
        text = self._redact_with_patterns(text)

        return text

    def _redact_with_presidio(self, text: str) -> str:
        """Use Presidio to detect and redact PII"""
        # Entities to detect (ONLY high-confidence PII, not generic words)
        entities = [
            "CREDIT_CARD",
            "CRYPTO",
            "PHONE_NUMBER",
            "US_SSN",
            "US_PASSPORT",
            "US_BANK_NUMBER",
            # Explicitly EXCLUDE generic entities that cause over-redaction:
            # - PERSON (redacts variable names like 'id', 'name', 'state')
            # - DATE_TIME (redacts timestamps)
            # - LOCATION (redacts country names in code)
            # - URL (redacts file paths and local URLs)
        ]

        if self.redact_emails:
            entities.append("EMAIL_ADDRESS")

        if self.redact_ips:
            entities.append("IP_ADDRESS")

        # Analyze text
        results = self.analyzer.analyze(text=text, entities=entities, language='en')

        # Anonymize
        if results:
            anonymized = self.anonymizer.anonymize(
                text=text,
                analyzer_results=results,
                operators={"DEFAULT": OperatorConfig("replace", {"new_value": "[REDACTED]"})}
            )
            return anonymized.text

        return text

    def _redact_with_patterns(self, text: str) -> str:
        """Apply regex patterns for known sensitive formats"""
        for pattern_name, pattern in self.patterns.items():
            # Special handling for service account keys (redact entire JSON block)
            if pattern_name == 'gcp_service_account_key':
                text = pattern.sub('"private_key": "[REDACTED_PRIVATE_KEY]"', text)
            else:
                text = pattern.sub(f'[REDACTED_{pattern_name.upper()}]', text)

        return text

    def redact_jsonl_file(self, input_path: Path, output_path: Path) -> Dict[str, int]:
        """Redact a JSONL conversation file"""
        stats = {
            'lines_processed': 0,
            'lines_redacted': 0,
            'errors': 0
        }

        with open(input_path, 'r', encoding='utf-8') as infile, \
             open(output_path, 'w', encoding='utf-8') as outfile:

            for line_num, line in enumerate(infile, 1):
                stats['lines_processed'] += 1

                try:
                    # Parse JSON
                    obj = json.loads(line)

                    # Track if this line was modified
                    original = json.dumps(obj)

                    # Redact message content
                    if 'message' in obj and isinstance(obj['message'], dict):
                        if 'content' in obj['message']:
                            content = obj['message']['content']

                            # Handle string content
                            if isinstance(content, str):
                                redacted = self.redact_text(content)
                                if redacted != content:
                                    stats['lines_redacted'] += 1
                                obj['message']['content'] = redacted

                            # Handle array content (tool results, etc.)
                            elif isinstance(content, list):
                                for i, item in enumerate(content):
                                    if isinstance(item, dict):
                                        # Redact text fields (including thinking blocks)
                                        for key in ['text', 'content', 'thinking']:
                                            if key in item and isinstance(item[key], str):
                                                redacted = self.redact_text(item[key])
                                                if redacted != item[key]:
                                                    stats['lines_redacted'] += 1
                                                item[key] = redacted

                                        # Redact tool use inputs (command arguments, etc.)
                                        if 'input' in item and isinstance(item['input'], dict):
                                            for k, v in item['input'].items():
                                                if isinstance(v, str):
                                                    redacted = self.redact_text(v)
                                                    if redacted != v:
                                                        stats['lines_redacted'] += 1
                                                    item['input'][k] = redacted

                    # Also redact toolUseResult (Claude Code specific)
                    if 'toolUseResult' in obj and isinstance(obj['toolUseResult'], dict):
                        for key in ['stdout', 'stderr']:
                            if key in obj['toolUseResult'] and isinstance(obj['toolUseResult'][key], str):
                                redacted = self.redact_text(obj['toolUseResult'][key])
                                if redacted != obj['toolUseResult'][key]:
                                    stats['lines_redacted'] += 1
                                obj['toolUseResult'][key] = redacted

                    # Check if modified
                    if json.dumps(obj) != original:
                        stats['lines_redacted'] += 1

                    # Write redacted line
                    outfile.write(json.dumps(obj) + '\n')

                except json.JSONDecodeError as e:
                    stats['errors'] += 1
                    print(f"Warning: Failed to parse line {line_num}: {e}", file=sys.stderr)
                    # Write original line if parsing fails
                    outfile.write(line)

        return stats


def main():
    """Main entry point"""
    # Parse arguments
    redact_emails = '--emails' in sys.argv
    redact_ips = '--ips' in sys.argv

    # Paths
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    conversations_dir = project_dir / 'claude-conversations'
    sanitized_dir = conversations_dir / 'sanitized'
    raw_dir = conversations_dir / 'raw'

    # Create directories
    sanitized_dir.mkdir(exist_ok=True)
    raw_dir.mkdir(exist_ok=True)

    print("🔒 Conversation Redaction Script")
    print(f"   Source: {conversations_dir}")
    print(f"   Output: {sanitized_dir}")
    print(f"   Redact emails: {redact_emails}")
    print(f"   Redact IPs: {redact_ips}")
    print()

    if not PRESIDIO_AVAILABLE:
        print("⚠️  Presidio not available, using regex-only mode")
        print("   Install for better detection: pip install presidio-analyzer presidio-anonymizer")
        print()

    # Find JSONL files
    jsonl_files = list(conversations_dir.glob('*.jsonl'))

    if not jsonl_files:
        print("No conversation files found")
        return 0

    print(f"Found {len(jsonl_files)} conversation files")
    print()

    # Initialize redactor
    redactor = ConversationRedactor(redact_emails, redact_ips)

    # Process each file
    total_stats = {
        'files_processed': 0,
        'lines_processed': 0,
        'lines_redacted': 0,
        'errors': 0
    }

    for jsonl_file in jsonl_files:
        # Move original to raw/ if not already there
        raw_path = raw_dir / jsonl_file.name
        if not raw_path.exists():
            jsonl_file.rename(raw_path)
            print(f"📦 Archived: {jsonl_file.name}")
        else:
            raw_path = jsonl_file

        # Redact to sanitized/
        sanitized_path = sanitized_dir / jsonl_file.name

        print(f"🔍 Processing: {jsonl_file.name}...", end=' ')
        stats = redactor.redact_jsonl_file(raw_path, sanitized_path)

        total_stats['files_processed'] += 1
        total_stats['lines_processed'] += stats['lines_processed']
        total_stats['lines_redacted'] += stats['lines_redacted']
        total_stats['errors'] += stats['errors']

        print(f"✓ ({stats['lines_redacted']} redacted)")

    # Summary
    print()
    print("=" * 50)
    print("📊 Redaction Summary")
    print("=" * 50)
    print(f"Files processed:  {total_stats['files_processed']}")
    print(f"Lines processed:  {total_stats['lines_processed']}")
    print(f"Lines redacted:   {total_stats['lines_redacted']}")
    print(f"Errors:           {total_stats['errors']}")
    print()
    print("✓ Sanitized files saved to: claude-conversations/sanitized/")
    print("✓ Raw backups saved to: claude-conversations/raw/")

    return 0


if __name__ == '__main__':
    sys.exit(main())
