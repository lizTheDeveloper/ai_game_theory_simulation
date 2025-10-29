#!/usr/bin/env python3
"""
Unit tests for citationChecker.py

Run with:
    python -m unittest scripts/test_citationChecker.py
    python scripts/test_citationChecker.py
"""

import unittest
import sys
from pathlib import Path

# Add scripts directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from citationChecker import CitationChecker


class TestCitationExtraction(unittest.TestCase):
    """Test citation extraction from text."""

    def setUp(self):
        """Create checker instance for each test."""
        self.checker = CitationChecker()

    def test_extract_simple_citation(self):
        """Test extraction of 'Author et al. (YYYY)' format."""
        text = "According to Smith et al. (2024), AI is advancing."
        citations = self.checker.extract_citations(text)

        self.assertEqual(len(citations), 1)
        self.assertEqual(citations[0]['author'], 'Smith')
        self.assertEqual(citations[0]['year'], '2024')
        self.assertEqual(citations[0]['normalized'], 'Smith et al. (2024)')

    def test_extract_single_author(self):
        """Test extraction of 'Author (YYYY)' format."""
        text = "Brown (2023) showed that transformers scale."
        citations = self.checker.extract_citations(text)

        self.assertEqual(len(citations), 1)
        self.assertEqual(citations[0]['author'], 'Brown')
        self.assertEqual(citations[0]['year'], '2023')
        self.assertEqual(citations[0]['normalized'], 'Brown (2023)')

    def test_extract_parenthetical_citation(self):
        """Test extraction of '(Author et al., YYYY)' format."""
        text = "Recent work (Johnson et al., 2025) demonstrates this."
        citations = self.checker.extract_citations(text)

        self.assertEqual(len(citations), 1)
        self.assertEqual(citations[0]['author'], 'Johnson')
        self.assertEqual(citations[0]['year'], '2025')
        self.assertEqual(citations[0]['normalized'], 'Johnson et al. (2025)')

    def test_extract_multiple_citations(self):
        """Test extraction of multiple citations from same text."""
        text = """
        Patterson et al. (2022) found energy costs.
        Li et al. (2023) showed water consumption.
        Smith (2024) disagrees.
        """
        citations = self.checker.extract_citations(text)

        self.assertEqual(len(citations), 3)
        authors = [c['author'] for c in citations]
        self.assertIn('Patterson', authors)
        self.assertIn('Li', authors)
        self.assertIn('Smith', authors)

    def test_extract_with_year_suffix(self):
        """Test extraction of citations with year suffixes (2024a, 2024b)."""
        text = "Brown et al. (2024a) and Brown et al. (2024b) conflict."
        citations = self.checker.extract_citations(text)

        self.assertEqual(len(citations), 2)
        self.assertEqual(citations[0]['year'], '2024a')
        self.assertEqual(citations[1]['year'], '2024b')

    def test_no_citations(self):
        """Test text with no citations returns empty list."""
        text = "This text has no citations at all."
        citations = self.checker.extract_citations(text)

        self.assertEqual(len(citations), 0)

    def test_duplicate_citations(self):
        """Test that duplicate citations are deduplicated."""
        text = "Smith et al. (2024) found X. Smith et al. (2024) also found Y."
        citations = self.checker.extract_citations(text)

        # Should only return one citation (deduplicated)
        self.assertEqual(len(citations), 1)

    def test_lowercase_author_ignored(self):
        """Test that lowercase 'author names' are ignored."""
        text = "The smith et al. (2024) should not match."
        citations = self.checker.extract_citations(text)

        self.assertEqual(len(citations), 0)


class TestCitationVerification(unittest.TestCase):
    """Test citation verification against database."""

    def setUp(self):
        """Create checker instance for each test."""
        self.checker = CitationChecker()

    def test_verify_known_citation(self):
        """Test verification of a known citation (Patterson et al.)."""
        # Patterson et al. (2022) should be in CITATION_CORRECTIONS_APPLIED_PHASE3.md
        result = self.checker.verify_citation('Patterson et al. (2022)')

        # Might be verified or verified-but-flagged depending on database state
        self.assertIn(result['status'], ['✅ VERIFIED', '⚠️ VERIFIED BUT FLAGGED'])

    def test_verify_unknown_citation(self):
        """Test verification of unknown citation."""
        result = self.checker.verify_citation('NonexistentAuthor et al. (9999)')

        self.assertFalse(result['verified'])
        self.assertEqual(result['status'], '❓ UNVERIFIED')

    def test_check_text_with_mix(self):
        """Test checking text with both verified and unverified citations."""
        text = """
        Patterson et al. (2022) is a real paper.
        FakeAuthor et al. (9999) is not real.
        """
        results = self.checker.check_text(text)

        self.assertEqual(results['citations_found'], 2)
        # Should have at least 1 verified (Patterson)
        self.assertGreaterEqual(results['verified'], 1)
        # Should have at least 1 unverified (FakeAuthor)
        self.assertGreaterEqual(results['unverified'], 1)

    def test_all_verified_flag(self):
        """Test that all_verified flag is correct."""
        # Known good citation
        text = "Patterson et al. (2022) is verified."
        results = self.checker.check_text(text)

        # Should be all verified (unless flagged as suspicious)
        if results['suspicious'] == 0:
            self.assertTrue(results['all_verified'])

        # Unknown citation
        text = "FakeAuthor et al. (9999) is not real."
        results = self.checker.check_text(text)

        self.assertFalse(results['all_verified'])


class TestCitationPatterns(unittest.TestCase):
    """Test citation pattern matching edge cases."""

    def setUp(self):
        """Create checker instance for each test."""
        self.checker = CitationChecker()

    def test_citation_with_ampersand(self):
        """Test 'Author & Author (YYYY)' format."""
        text = "Smith & Jones (2024) collaborated."
        citations = self.checker.extract_citations(text)

        self.assertEqual(len(citations), 1)
        self.assertEqual(citations[0]['author'], 'Smith')

    def test_citation_without_period(self):
        """Test 'et al' without period (et al vs et al.)."""
        text1 = "Smith et al. (2024) with period."
        text2 = "Smith et al (2024) without period."

        citations1 = self.checker.extract_citations(text1)
        citations2 = self.checker.extract_citations(text2)

        self.assertEqual(len(citations1), 1)
        self.assertEqual(len(citations2), 1)

    def test_citation_in_middle_of_sentence(self):
        """Test citation in middle of sentence."""
        text = "The work by Li et al. (2023) shows that water consumption is high."
        citations = self.checker.extract_citations(text)

        self.assertEqual(len(citations), 1)
        self.assertEqual(citations[0]['author'], 'Li')

    def test_multiple_citations_same_sentence(self):
        """Test multiple citations in parenthetical format."""
        text = "Recent work (Smith, 2024; Jones, 2023) supports this."
        citations = self.checker.extract_citations(text)

        # Should extract both
        self.assertGreaterEqual(len(citations), 2)


class TestDatabaseLoading(unittest.TestCase):
    """Test database loading functionality."""

    def setUp(self):
        """Create checker instance for each test."""
        self.checker = CitationChecker()

    def test_verified_citations_loaded(self):
        """Test that verified citations database is not empty."""
        self.assertIsNotNone(self.checker.verified_citations)
        self.assertIsInstance(self.checker.verified_citations, set)
        # Should have at least some verified citations
        self.assertGreater(len(self.checker.verified_citations), 0)

    def test_suspicious_citations_loaded(self):
        """Test that suspicious citations database loads."""
        self.assertIsNotNone(self.checker.suspicious_citations)
        self.assertIsInstance(self.checker.suspicious_citations, dict)

    def test_database_sources_exist(self):
        """Test that database source files exist."""
        repo_root = self.checker.repo_root

        # At least one source should exist
        bib_file = repo_root / "docs/wiki/BIBLIOGRAPHY.md"
        self.assertTrue(
            bib_file.exists(),
            f"Bibliography not found at {bib_file}"
        )


def run_tests():
    """Run all tests with verbose output."""
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # Print summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")

    if result.wasSuccessful():
        print("\n✅ ALL TESTS PASSED")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED")
        return 1


if __name__ == '__main__':
    sys.exit(run_tests())
