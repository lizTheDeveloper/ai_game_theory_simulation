#!/usr/bin/env python3
"""
MARCUS 3.0 Code Attribution Agent

Extends Citation Integrity Agent for code attribution and license compliance.

Domain-specific behaviors for:
- Open source license detection (MIT, GPL, Apache, BSD, etc.)
- Code plagiarism detection (copy-paste, refactoring, paraphrasing)
- Attribution verification (author credits, license headers)
- Dependency tracking (imports, function calls, library usage)

New Behaviors (extending CitationBehavior):
- PROPER_ATTRIBUTION: Correct author/license attribution
- LICENSE_COMPLIANT: Adheres to license requirements
- UNATTRIBUTED_COPY: Copy-paste without attribution
- LICENSE_VIOLATION: Incompatible license mixing
- REFACTORED_PLAGIARISM: Renamed but structurally identical
- PARAPHRASED_CODE: Logic copied with different syntax
- INCOMPLETE_ATTRIBUTION: Partial attribution (missing license/author)
- DEPENDENCY_CONFLICT: Incompatible dependency licenses

Author: Marcus (Platform Engineer)
Date: 2025-11-17
"""

import re
import hashlib
import difflib
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple
from citation_integrity_agent import (
    CitationBehavior,
    CitationDocument,
    CitationIntegrityAgent,
    NestedCitationMemory
)


class CodeAttributionBehavior(Enum):
    """
    Code-specific attribution behaviors extending citation analysis.

    Each behavior represents a different pattern of code attribution,
    from proper attribution to various forms of plagiarism/violation.

    Format: (behavior_name, integrity_score, confidence, violation_severity)
    """

    # Proper behaviors (high integrity)
    PROPER_ATTRIBUTION = ("proper_attribution", 1.0, 1.0, 0.0)
    LICENSE_COMPLIANT = ("license_compliant", 1.0, 0.95, 0.0)

    # Neutral/unclear
    PARTIAL_ATTRIBUTION = ("partial_attribution", 0.6, 0.7, 0.3)
    UNCLEAR_LICENSE = ("unclear_license", 0.5, 0.5, 0.4)

    # Violations (low integrity)
    UNATTRIBUTED_COPY = ("unattributed_copy", 0.0, 0.9, 1.0)
    LICENSE_VIOLATION = ("license_violation", 0.0, 0.95, 1.0)
    REFACTORED_PLAGIARISM = ("refactored_plagiarism", 0.1, 0.8, 0.9)
    PARAPHRASED_CODE = ("paraphrased_code", 0.2, 0.7, 0.8)
    INCOMPLETE_ATTRIBUTION = ("incomplete_attribution", 0.4, 0.6, 0.5)
    DEPENDENCY_CONFLICT = ("dependency_conflict", 0.2, 0.85, 0.8)

    @property
    def integrity_score(self) -> float:
        """How well this behavior maintains code integrity."""
        return self.value[1]

    @property
    def confidence(self) -> float:
        """How confident the agent is in detecting this behavior."""
        return self.value[2]

    @property
    def violation_severity(self) -> float:
        """How severe a violation this represents (0=none, 1=critical)."""
        return self.value[3]


class LicenseType(Enum):
    """
    Open source license types with compatibility rules.

    Attributes:
        copyleft: Requires derivative works to use same license
        permissive: Allows relicensing under different terms
        network_copyleft: Copyleft triggered by network use (AGPL)
    """

    # Permissive licenses
    MIT = ("MIT", False, True, False)
    BSD_2_CLAUSE = ("BSD-2-Clause", False, True, False)
    BSD_3_CLAUSE = ("BSD-3-Clause", False, True, False)
    APACHE_2_0 = ("Apache-2.0", False, True, False)
    ISC = ("ISC", False, True, False)

    # Copyleft licenses
    GPL_2_0 = ("GPL-2.0", True, False, False)
    GPL_3_0 = ("GPL-3.0", True, False, False)
    LGPL_2_1 = ("LGPL-2.1", True, False, False)  # Library GPL (weaker)
    LGPL_3_0 = ("LGPL-3.0", True, False, False)

    # Network copyleft
    AGPL_3_0 = ("AGPL-3.0", True, False, True)

    # Proprietary/unknown
    PROPRIETARY = ("Proprietary", False, False, False)
    UNKNOWN = ("Unknown", False, False, False)

    @property
    def copyleft(self) -> bool:
        """Does this license require derivatives to use same license?"""
        return self.value[1]

    @property
    def permissive(self) -> bool:
        """Can derivatives be relicensed?"""
        return self.value[2]

    @property
    def network_copyleft(self) -> bool:
        """Is copyleft triggered by network use (AGPL)?"""
        return self.value[3]

    def is_compatible_with(self, other: 'LicenseType') -> bool:
        """
        Check if this license is compatible with another.

        Compatibility rules:
        - Permissive licenses are compatible with everything
        - Copyleft requires same license family
        - GPL/AGPL are one-way compatible (GPL can use permissive, not vice versa)
        """
        # Same license is always compatible
        if self == other:
            return True

        # Permissive licenses are compatible with everything
        if other.permissive:
            return True

        # GPL can incorporate permissive but not vice versa
        if self.copyleft and other.permissive:
            return True

        # GPL versions must match (2.0 vs 3.0 incompatible)
        if self.copyleft and other.copyleft:
            return self.name.split('_')[0] == other.name.split('_')[0]

        return False


@dataclass
class CodeDocument(CitationDocument):
    """
    Code document extending citation document with code-specific fields.

    Attributes:
        code: The actual code content
        language: Programming language (python, javascript, etc.)
        imports: List of imported modules/libraries
        functions: List of function signatures
        license_header: Detected license header text
        declared_license: License declared in header/metadata
        detected_license: License detected by analysis
        author: Author attribution from header/git
        similarity_hash: Hash for fast similarity detection
    """

    code: str = ""
    language: str = "unknown"
    imports: List[str] = field(default_factory=list)
    functions: List[str] = field(default_factory=list)
    license_header: Optional[str] = None
    declared_license: Optional[LicenseType] = None
    detected_license: Optional[LicenseType] = None
    author: Optional[str] = None
    similarity_hash: Optional[str] = None

    def __post_init__(self):
        """Extract code features after initialization."""
        if self.code and not self.imports:
            self.imports = self._extract_imports()
        if self.code and not self.functions:
            self.functions = self._extract_functions()
        if self.code and not self.license_header:
            self.license_header = self._extract_license_header()
        if self.code and not self.declared_license:
            self.declared_license = self._detect_license()
        if self.code and not self.similarity_hash:
            self.similarity_hash = self._compute_similarity_hash()

    def _extract_imports(self) -> List[str]:
        """Extract import statements from code."""
        imports = []

        # Python imports
        if self.language == "python":
            import_patterns = [
                r'^\s*import\s+([a-zA-Z0-9_., ]+)',
                r'^\s*from\s+([a-zA-Z0-9_.]+)\s+import'
            ]
            for pattern in import_patterns:
                matches = re.findall(pattern, self.code, re.MULTILINE)
                imports.extend(matches)

        # JavaScript/TypeScript imports
        elif self.language in ["javascript", "typescript"]:
            import_patterns = [
                r'^\s*import\s+.*from\s+[\'"]([^\'"]+)[\'"]',
                r'^\s*require\([\'"]([^\'"]+)[\'"]\)'
            ]
            for pattern in import_patterns:
                matches = re.findall(pattern, self.code, re.MULTILINE)
                imports.extend(matches)

        return list(set(imports))  # Deduplicate

    def _extract_functions(self) -> List[str]:
        """Extract function signatures from code."""
        functions = []

        # Python functions
        if self.language == "python":
            pattern = r'^\s*def\s+([a-zA-Z0-9_]+)\s*\('
            matches = re.findall(pattern, self.code, re.MULTILINE)
            functions.extend(matches)

        # JavaScript/TypeScript functions
        elif self.language in ["javascript", "typescript"]:
            patterns = [
                r'^\s*function\s+([a-zA-Z0-9_]+)\s*\(',
                r'^\s*const\s+([a-zA-Z0-9_]+)\s*=\s*\(',
                r'^\s*([a-zA-Z0-9_]+)\s*\([^)]*\)\s*{'
            ]
            for pattern in patterns:
                matches = re.findall(pattern, self.code, re.MULTILINE)
                functions.extend(matches)

        return list(set(functions))  # Deduplicate

    def _extract_license_header(self) -> Optional[str]:
        """Extract license header from top of file."""
        # Look for comment block at start of file
        lines = self.code.split('\n')
        header_lines = []
        in_header = False

        for line in lines[:50]:  # Check first 50 lines
            stripped = line.strip()

            # Detect license-related keywords
            if any(kw in stripped.lower() for kw in ['license', 'copyright', 'author']):
                in_header = True

            if in_header:
                header_lines.append(line)

                # Stop at first blank line after header
                if not stripped and len(header_lines) > 3:
                    break

        return '\n'.join(header_lines) if header_lines else None

    def _detect_license(self) -> Optional[LicenseType]:
        """Detect license type from header text."""
        if not self.license_header:
            return None

        header_lower = self.license_header.lower()

        # License detection patterns
        license_patterns = {
            LicenseType.MIT: ['mit license', 'permission is hereby granted'],
            LicenseType.APACHE_2_0: ['apache license', 'version 2.0'],
            LicenseType.GPL_2_0: ['gnu general public license', 'version 2'],
            LicenseType.GPL_3_0: ['gnu general public license', 'version 3'],
            LicenseType.AGPL_3_0: ['gnu affero general public license'],
            LicenseType.BSD_2_CLAUSE: ['bsd 2-clause', 'redistribution and use'],
            LicenseType.BSD_3_CLAUSE: ['bsd 3-clause', 'neither the name'],
            LicenseType.ISC: ['isc license', 'permission to use, copy'],
        }

        for license_type, patterns in license_patterns.items():
            if all(pattern in header_lower for pattern in patterns):
                return license_type

        return LicenseType.UNKNOWN

    def _compute_similarity_hash(self) -> str:
        """
        Compute hash for similarity detection.

        Uses normalized code (whitespace removed, comments stripped)
        to detect copy-paste even with formatting changes.
        """
        # Normalize code: remove comments, whitespace, lowercase
        normalized = self.code.lower()

        # Remove single-line comments
        normalized = re.sub(r'#.*$', '', normalized, flags=re.MULTILINE)  # Python
        normalized = re.sub(r'//.*$', '', normalized, flags=re.MULTILINE)  # JS

        # Remove multi-line comments
        normalized = re.sub(r'/\*.*?\*/', '', normalized, flags=re.DOTALL)  # C-style
        normalized = re.sub(r'""".*?"""', '', normalized, flags=re.DOTALL)  # Python docstrings

        # Remove all whitespace
        normalized = re.sub(r'\s+', '', normalized)

        # Compute SHA-256 hash
        return hashlib.sha256(normalized.encode()).hexdigest()

    def similarity_to(self, other: 'CodeDocument') -> float:
        """
        Compute similarity score with another code document.

        Uses multiple metrics:
        - Hash comparison (exact match after normalization)
        - Difflib sequence matching (structural similarity)
        - Import overlap (shared dependencies)
        - Function signature overlap

        Returns:
            Float in [0, 1] representing similarity
        """
        scores = []

        # 1. Hash comparison (exact match)
        if self.similarity_hash == other.similarity_hash:
            scores.append(1.0)
        else:
            scores.append(0.0)

        # 2. Structural similarity (difflib)
        matcher = difflib.SequenceMatcher(None, self.code, other.code)
        scores.append(matcher.ratio())

        # 3. Import overlap (Jaccard similarity)
        if self.imports and other.imports:
            imports1 = set(self.imports)
            imports2 = set(other.imports)
            intersection = len(imports1 & imports2)
            union = len(imports1 | imports2)
            jaccard = intersection / union if union > 0 else 0.0
            scores.append(jaccard)

        # 4. Function signature overlap
        if self.functions and other.functions:
            funcs1 = set(self.functions)
            funcs2 = set(other.functions)
            intersection = len(funcs1 & funcs2)
            union = len(funcs1 | funcs2)
            jaccard = intersection / union if union > 0 else 0.0
            scores.append(jaccard)

        # Return weighted average (higher weight to structural similarity)
        weights = [0.3, 0.4, 0.15, 0.15]
        return sum(s * w for s, w in zip(scores, weights)) / sum(weights[:len(scores)])


@dataclass
class CodeAttributionResult:
    """
    Result of code attribution analysis.

    Attributes:
        behavior: Detected attribution behavior
        integrity_score: How well attribution is maintained [0, 1]
        confidence: Agent confidence in this assessment [0, 1]
        violation_severity: How severe any violation is [0, 1]
        license_compatible: Are licenses compatible?
        similar_code: List of similar code snippets found
        attribution_details: Human-readable explanation
    """

    behavior: CodeAttributionBehavior
    integrity_score: float
    confidence: float
    violation_severity: float
    license_compatible: bool
    similar_code: List[Tuple[str, float]] = field(default_factory=list)  # (source_id, similarity)
    attribution_details: str = ""


class CodeAttributionAgent(CitationIntegrityAgent):
    """
    Agent for code attribution and license compliance.

    Extends CitationIntegrityAgent with code-specific capabilities:
    - License detection and compatibility checking
    - Code similarity analysis (copy-paste detection)
    - Import dependency tracking
    - Function signature matching
    """

    def __init__(
        self,
        agent_id: str,
        db_config: Dict[str, str],
        redis_config: Dict[str, str],
        initial_behavior: Optional[CodeAttributionBehavior] = None
    ):
        """
        Initialize code attribution agent.

        Args:
            agent_id: Unique agent identifier
            db_config: PostgreSQL configuration
            redis_config: Redis configuration
            initial_behavior: Starting behavior (default: PROPER_ATTRIBUTION)
        """
        # Initialize parent with equivalent citation behavior
        super().__init__(
            agent_id=agent_id,
            db_config=db_config,
            redis_config=redis_config,
            initial_behavior=CitationBehavior.COMBINED_HEURISTIC
        )

        # Override with code-specific behavior
        self.current_behavior = initial_behavior or CodeAttributionBehavior.PROPER_ATTRIBUTION

        # Code-specific state
        self.known_licenses: Set[LicenseType] = set()
        self.code_database: Dict[str, CodeDocument] = {}  # source_id -> code

        logger.info(f"🔍 Code Attribution Agent {agent_id} initialized with behavior: {self.current_behavior.name}")

    def analyze_code(self, doc: CodeDocument) -> CodeAttributionResult:
        """
        Analyze code document for attribution and license compliance.

        Args:
            doc: Code document to analyze

        Returns:
            CodeAttributionResult with detected behavior and scores
        """
        # 1. License analysis
        license_compatible = self._check_license_compatibility(doc)

        # 2. Similarity analysis
        similar_code = self._find_similar_code(doc)

        # 3. Attribution analysis
        has_attribution = bool(doc.author or doc.license_header)

        # 4. Determine behavior based on analysis
        behavior = self._determine_behavior(
            doc=doc,
            license_compatible=license_compatible,
            similar_code=similar_code,
            has_attribution=has_attribution
        )

        # 5. Generate explanation
        details = self._generate_attribution_details(
            doc=doc,
            behavior=behavior,
            license_compatible=license_compatible,
            similar_code=similar_code
        )

        return CodeAttributionResult(
            behavior=behavior,
            integrity_score=behavior.integrity_score,
            confidence=behavior.confidence,
            violation_severity=behavior.violation_severity,
            license_compatible=license_compatible,
            similar_code=similar_code,
            attribution_details=details
        )

    def _check_license_compatibility(self, doc: CodeDocument) -> bool:
        """Check if document's license is compatible with known licenses."""
        if not doc.detected_license:
            return False  # Unknown license = not compatible

        # Check against all known licenses
        for known_license in self.known_licenses:
            if not doc.detected_license.is_compatible_with(known_license):
                return False

        return True

    def _find_similar_code(self, doc: CodeDocument, threshold: float = 0.7) -> List[Tuple[str, float]]:
        """Find similar code in database."""
        similar = []

        for source_id, known_doc in self.code_database.items():
            similarity = doc.similarity_to(known_doc)
            if similarity >= threshold:
                similar.append((source_id, similarity))

        # Sort by similarity (highest first)
        similar.sort(key=lambda x: x[1], reverse=True)

        return similar

    def _determine_behavior(
        self,
        doc: CodeDocument,
        license_compatible: bool,
        similar_code: List[Tuple[str, float]],
        has_attribution: bool
    ) -> CodeAttributionBehavior:
        """Determine attribution behavior based on analysis."""

        # Case 1: License violation
        if not license_compatible and doc.detected_license:
            return CodeAttributionBehavior.LICENSE_VIOLATION

        # Case 2: High similarity without attribution
        if similar_code and max(s[1] for s in similar_code) > 0.9:
            if not has_attribution:
                return CodeAttributionBehavior.UNATTRIBUTED_COPY
            else:
                return CodeAttributionBehavior.PROPER_ATTRIBUTION

        # Case 3: Medium similarity (refactored plagiarism)
        if similar_code and max(s[1] for s in similar_code) > 0.7:
            if not has_attribution:
                return CodeAttributionBehavior.REFACTORED_PLAGIARISM
            else:
                return CodeAttributionBehavior.PARTIAL_ATTRIBUTION

        # Case 4: Low similarity (paraphrased)
        if similar_code and max(s[1] for s in similar_code) > 0.5:
            if not has_attribution:
                return CodeAttributionBehavior.PARAPHRASED_CODE
            else:
                return CodeAttributionBehavior.PARTIAL_ATTRIBUTION

        # Case 5: Proper attribution
        if has_attribution and license_compatible:
            return CodeAttributionBehavior.PROPER_ATTRIBUTION

        # Case 6: Incomplete attribution
        if has_attribution and not license_compatible:
            return CodeAttributionBehavior.INCOMPLETE_ATTRIBUTION

        # Default: unclear
        return CodeAttributionBehavior.UNCLEAR_LICENSE

    def _generate_attribution_details(
        self,
        doc: CodeDocument,
        behavior: CodeAttributionBehavior,
        license_compatible: bool,
        similar_code: List[Tuple[str, float]]
    ) -> str:
        """Generate human-readable attribution analysis."""
        parts = []

        # License info
        if doc.detected_license:
            parts.append(f"License: {doc.detected_license.name}")
            if not license_compatible:
                parts.append("⚠️ License incompatibility detected")
        else:
            parts.append("⚠️ No license detected")

        # Attribution info
        if doc.author:
            parts.append(f"Author: {doc.author}")
        else:
            parts.append("⚠️ No author attribution")

        # Similarity info
        if similar_code:
            top_match = similar_code[0]
            parts.append(f"Similar to {top_match[0]} ({top_match[1]:.0%} match)")

        # Behavior verdict
        parts.append(f"Verdict: {behavior.name.replace('_', ' ').title()}")

        return " | ".join(parts)

    def add_to_database(self, source_id: str, doc: CodeDocument):
        """Add code document to knowledge database."""
        self.code_database[source_id] = doc
        if doc.detected_license:
            self.known_licenses.add(doc.detected_license)

        logger.info(f"📚 Added {source_id} to code database ({doc.detected_license.name if doc.detected_license else 'Unknown'})")


# Convenience function for quick analysis
def analyze_code_file(
    file_path: str,
    language: str,
    agent: CodeAttributionAgent
) -> CodeAttributionResult:
    """
    Analyze a code file for attribution compliance.

    Args:
        file_path: Path to code file
        language: Programming language
        agent: Code attribution agent instance

    Returns:
        CodeAttributionResult with analysis
    """
    with open(file_path, 'r') as f:
        code = f.read()

    doc = CodeDocument(
        text=file_path,
        claimed_source=None,
        actual_source=None,
        code=code,
        language=language
    )

    return agent.analyze_code(doc)


if __name__ == "__main__":
    # Example usage - reads from environment variables
    import os
    db_config = {
        'host': os.getenv('DATABASE_HOST', os.getenv('PGHOST', 'localhost')),
        'port': os.getenv('DATABASE_PORT', os.getenv('PGPORT', '5432')),
        'database': os.getenv('POSTGRES_DB', os.getenv('PGDATABASE', 'citations')),
        'user': os.getenv('POSTGRES_USER', os.getenv('PGUSER', 'postgres')),
        'password': os.getenv('POSTGRES_PASSWORD', os.getenv('PGPASSWORD', ''))
    }

    redis_config = {
        'host': os.getenv('REDIS_HOST', 'localhost'),
        'port': int(os.getenv('REDIS_PORT', '6379')),
        'password': os.getenv('REDIS_PASSWORD')
    }

    # Create agent
    agent = CodeAttributionAgent(
        agent_id="code_attr_001",
        db_config=db_config,
        redis_config=redis_config
    )

    # Example: Analyze MIT-licensed code
    mit_code = '''
# MIT License
# Copyright (c) 2024 John Doe

def hello_world():
    print("Hello, world!")
'''

    doc1 = CodeDocument(
        text="example.py",
        claimed_source="John Doe",
        actual_source="John Doe",
        code=mit_code,
        language="python"
    )

    result = agent.analyze_code(doc1)
    print(f"\n{result.attribution_details}")
    print(f"Integrity: {result.integrity_score:.2f}, Confidence: {result.confidence:.2f}")

    # Add to database
    agent.add_to_database("john_doe_hello", doc1)

    # Example: Analyze plagiarized code (same code, no attribution)
    plagiarized_code = '''
def hello_world():
    print("Hello, world!")
'''

    doc2 = CodeDocument(
        text="stolen.py",
        claimed_source=None,
        actual_source="John Doe",
        code=plagiarized_code,
        language="python"
    )

    result2 = agent.analyze_code(doc2)
    print(f"\n{result2.attribution_details}")
    print(f"Integrity: {result2.integrity_score:.2f}, Confidence: {result2.confidence:.2f}")
    print(f"Violation Severity: {result2.violation_severity:.2f}")
