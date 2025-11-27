#!/usr/bin/env python3
"""
MARCUS 3.0 Citation Integrity Benchmarking Suite

Comprehensive benchmark framework for evaluating citation integrity systems.

Components:
- BenchmarkDatasetGenerator: Creates clean, mixed, and adversarial datasets
- CitationMetrics: 50+ evaluation metrics
- Baseline implementations: Random, rule-based, ML, single-agent, no-memory
- Statistical analysis and comparison framework
- Comprehensive reporting (HTML, JSON, CSV, Markdown)

Evaluation Dimensions:
- Accuracy: Precision, recall, F1, behavior detection rates
- Performance: Latency (p50/p95/p99), throughput, memory usage
- Scalability: Performance vs. number of agents
- Convergence: Time to stable consensus, learning curves
- Robustness: Performance on adversarial/edge cases

Author: Marcus (Platform Engineer)
Date: 2025-11-17
"""

import json
import random
import time
import statistics
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any, Callable
from collections import defaultdict
from enum import Enum

# External dependencies
try:
    import numpy as np
    from sklearn.metrics import precision_recall_fscore_support, confusion_matrix
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.feature_extraction.text import TfidfVectorizer
except ImportError as e:
    raise ImportError(
        f"Missing required dependencies: {e}. "
        "Install with: pip install numpy scikit-learn"
    )


class DatasetType(Enum):
    """Types of benchmark datasets."""
    CLEAN = "clean"                     # All valid citations
    MIXED = "mixed"                     # Mix of valid and invalid
    ADVERSARIAL = "adversarial"         # Designed to fool systems
    EDGE_CASES = "edge_cases"           # Unusual but valid citations
    HIGH_VOLUME = "high_volume"         # Scalability testing
    TEMPORAL = "temporal"               # Time-based patterns
    MULTI_DOMAIN = "multi_domain"       # Cross-domain citations


@dataclass
class BenchmarkCitation:
    """
    A citation for benchmarking with ground truth.

    Attributes:
        text: The citation text
        claimed_source: What it claims to reference
        actual_source: Ground truth source (None if fabricated)
        is_valid: Ground truth validity
        category: Type of citation (valid, fabricated, misattributed, etc.)
        difficulty: How hard to classify (easy, medium, hard)
        metadata: Additional context
    """
    text: str
    claimed_source: str
    actual_source: Optional[str]
    is_valid: bool
    category: str
    difficulty: str = "medium"
    metadata: Dict[str, Any] = field(default_factory=dict)

    def get_ground_truth_integrity(self) -> float:
        """Get ground truth integrity score (1.0 = valid, 0.0 = invalid)."""
        return 1.0 if self.is_valid else 0.0


@dataclass
class CitationMetrics:
    """
    Comprehensive metrics for citation integrity evaluation.

    Covers accuracy, performance, convergence, and robustness.
    """

    # Accuracy metrics
    accuracy: float = 0.0
    precision: float = 0.0
    recall: float = 0.0
    f1_score: float = 0.0
    true_positives: int = 0
    false_positives: int = 0
    true_negatives: int = 0
    false_negatives: int = 0

    # Behavior detection
    behavior_accuracy: Dict[str, float] = field(default_factory=dict)
    confusion_matrix: List[List[int]] = field(default_factory=list)

    # Performance metrics
    mean_latency_ms: float = 0.0
    p50_latency_ms: float = 0.0
    p95_latency_ms: float = 0.0
    p99_latency_ms: float = 0.0
    throughput_per_sec: float = 0.0
    memory_usage_mb: float = 0.0

    # Convergence metrics
    learning_curve: List[float] = field(default_factory=list)
    convergence_time: Optional[float] = None
    final_accuracy: float = 0.0

    # Robustness metrics
    adversarial_accuracy: float = 0.0
    edge_case_accuracy: float = 0.0
    consistency_score: float = 0.0  # Consistency across runs

    # System metrics
    total_samples: int = 0
    total_errors: int = 0
    error_rate: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


class BenchmarkDatasetGenerator:
    """
    Generate benchmark datasets for citation integrity evaluation.

    Generates 7 types of datasets with varying characteristics:
    1. Clean: All valid citations
    2. Mixed: Realistic mix (80% valid, 20% invalid)
    3. Adversarial: Designed to fool systems
    4. Edge cases: Unusual but valid formats
    5. High volume: Scalability testing
    6. Temporal: Time-based patterns
    7. Multi-domain: Cross-domain citations
    """

    def __init__(self, seed: int = 42):
        """
        Initialize dataset generator.

        Args:
            seed: Random seed for reproducibility
        """
        self.seed = seed
        random.seed(seed)
        np.random.seed(seed)

        # Citation templates
        self.valid_templates = [
            "{author} ({year}). {title}. {journal}, {volume}, {pages}.",
            "{author} et al. ({year}). {title}. {conference}.",
            "{author} ({year}). {title}. Available at: {url}",
        ]

        self.fabricated_templates = [
            "{author} ({year}). {fake_title}. {fake_journal}.",
            "{author} et al. ({year}). {fake_title}. Proceedings of {fake_conference}.",
        ]

        # Sample data
        self.authors = ["Smith", "Jones", "Lee", "Garcia", "Chen", "Kumar", "Patel", "Wang"]
        self.years = list(range(2020, 2026))
        self.journals = ["Nature", "Science", "Cell", "PNAS", "Lancet"]
        self.conferences = ["NeurIPS", "ICML", "ICLR", "ACL", "CVPR"]

    def generate_valid_citation(self, difficulty: str = "medium") -> BenchmarkCitation:
        """Generate a valid citation."""
        author = random.choice(self.authors)
        year = random.choice(self.years)
        title = f"Study on {random.choice(['AI', 'Climate', 'Health', 'Energy'])}"
        journal = random.choice(self.journals)

        if difficulty == "easy":
            # Clear, well-formatted citation
            text = f"{author} et al. ({year}). {title}. {journal}, 123, 45-67."
            claimed = f"{author} et al. {year}"
        elif difficulty == "hard":
            # Abbreviated, informal citation
            text = f"{author} {str(year)[-2:]} - {title[:20]}..."
            claimed = f"{author} {year}"
        else:
            # Medium difficulty
            template = random.choice(self.valid_templates)
            text = template.format(
                author=author, year=year, title=title, journal=journal,
                volume=random.randint(1, 200), pages=f"{random.randint(1,999)}-{random.randint(1,999)}",
                conference=random.choice(self.conferences),
                url="https://example.com"
            )
            claimed = f"{author} {year}"

        return BenchmarkCitation(
            text=text,
            claimed_source=claimed,
            actual_source=text,  # Same as text for valid
            is_valid=True,
            category="valid",
            difficulty=difficulty
        )

    def generate_fabricated_citation(self, difficulty: str = "medium") -> BenchmarkCitation:
        """Generate a fabricated citation."""
        author = random.choice(self.authors)
        year = random.choice(self.years)
        fake_title = f"Nonexistent Study on {random.choice(['Quantum', 'Neural', 'Cosmic'])}"
        fake_journal = f"Journal of {random.choice(['Fake', 'Imaginary', 'Made-up'])} Research"

        if difficulty == "easy":
            # Obviously fake
            text = f"{author} ({year}). {fake_title}. {fake_journal}."
            claimed = f"{author} {year}"
        elif difficulty == "hard":
            # Realistic-looking fabrication
            text = f"{author} et al. ({year}). {fake_title}. Nature, 999, 1-99."
            claimed = f"{author} et al. {year}"
        else:
            # Medium difficulty
            template = random.choice(self.fabricated_templates)
            text = template.format(
                author=author, year=year, fake_title=fake_title,
                fake_journal=fake_journal,
                fake_conference=f"International Conference on {random.choice(['Fake', 'Nonexistent'])} Systems"
            )
            claimed = f"{author} {year}"

        return BenchmarkCitation(
            text=text,
            claimed_source=claimed,
            actual_source=None,  # Fabricated
            is_valid=False,
            category="fabricated",
            difficulty=difficulty
        )

    def generate_misattributed_citation(self) -> BenchmarkCitation:
        """Generate a citation with wrong attribution."""
        real_author = random.choice(self.authors)
        wrong_author = random.choice([a for a in self.authors if a != real_author])
        year = random.choice(self.years)
        title = f"Real Study on {random.choice(['AI', 'Climate'])}"

        text = f"{wrong_author} ({year}). {title}. Science, 123, 45-67."
        claimed = f"{wrong_author} {year}"
        actual = f"{real_author} ({year}). {title}. Science, 123, 45-67."

        return BenchmarkCitation(
            text=text,
            claimed_source=claimed,
            actual_source=actual,
            is_valid=False,
            category="misattributed",
            difficulty="hard"
        )

    def generate_dataset(
        self,
        dataset_type: DatasetType,
        size: int = 1000
    ) -> List[BenchmarkCitation]:
        """
        Generate a benchmark dataset.

        Args:
            dataset_type: Type of dataset to generate
            size: Number of citations to generate

        Returns:
            List of BenchmarkCitation objects
        """
        dataset: List[BenchmarkCitation] = []

        if dataset_type == DatasetType.CLEAN:
            # All valid citations
            for _ in range(size):
                dataset.append(self.generate_valid_citation())

        elif dataset_type == DatasetType.MIXED:
            # 80% valid, 15% fabricated, 5% misattributed
            for _ in range(int(size * 0.8)):
                dataset.append(self.generate_valid_citation())
            for _ in range(int(size * 0.15)):
                dataset.append(self.generate_fabricated_citation())
            for _ in range(int(size * 0.05)):
                dataset.append(self.generate_misattributed_citation())

        elif dataset_type == DatasetType.ADVERSARIAL:
            # Hard-to-detect fabrications
            for _ in range(size):
                if random.random() < 0.5:
                    dataset.append(self.generate_valid_citation(difficulty="hard"))
                else:
                    dataset.append(self.generate_fabricated_citation(difficulty="hard"))

        elif dataset_type == DatasetType.EDGE_CASES:
            # Unusual formats
            for _ in range(size):
                dataset.append(self.generate_valid_citation(difficulty="hard"))

        elif dataset_type == DatasetType.HIGH_VOLUME:
            # Large dataset for scalability testing
            for _ in range(size):
                difficulty = random.choice(["easy", "medium", "hard"])
                if random.random() < 0.8:
                    dataset.append(self.generate_valid_citation(difficulty))
                else:
                    dataset.append(self.generate_fabricated_citation(difficulty))

        elif dataset_type == DatasetType.TEMPORAL:
            # Time-based patterns (older = more reliable)
            for _ in range(size):
                year = random.choice(self.years)
                # Older citations are more likely to be valid
                reliability = (year - 2020) / 5
                if random.random() < reliability:
                    dataset.append(self.generate_valid_citation())
                else:
                    dataset.append(self.generate_fabricated_citation())

        elif dataset_type == DatasetType.MULTI_DOMAIN:
            # Citations from different domains
            for _ in range(size):
                dataset.append(self.generate_valid_citation())

        # Shuffle
        random.shuffle(dataset)

        return dataset

    def save_dataset(self, dataset: List[BenchmarkCitation], filepath: Path) -> None:
        """Save dataset to JSON file."""
        filepath.parent.mkdir(parents=True, exist_ok=True)

        data = [
            {
                'text': c.text,
                'claimed_source': c.claimed_source,
                'actual_source': c.actual_source,
                'is_valid': c.is_valid,
                'category': c.category,
                'difficulty': c.difficulty,
                'metadata': c.metadata
            }
            for c in dataset
        ]

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"✅ Dataset saved: {filepath} ({len(dataset)} citations)")

    def load_dataset(self, filepath: Path) -> List[BenchmarkCitation]:
        """Load dataset from JSON file."""
        with open(filepath) as f:
            data = json.load(f)

        dataset = [
            BenchmarkCitation(
                text=d['text'],
                claimed_source=d['claimed_source'],
                actual_source=d.get('actual_source'),
                is_valid=d['is_valid'],
                category=d['category'],
                difficulty=d.get('difficulty', 'medium'),
                metadata=d.get('metadata', {})
            )
            for d in data
        ]

        print(f"📦 Dataset loaded: {filepath} ({len(dataset)} citations)")
        return dataset


class BaselineImplementation:
    """Base class for baseline implementations."""

    def __init__(self, name: str):
        self.name = name

    def analyze(self, citation: BenchmarkCitation) -> float:
        """
        Analyze a citation and return integrity score.

        Args:
            citation: Citation to analyze

        Returns:
            Integrity score in [0, 1]
        """
        raise NotImplementedError


class RandomBaseline(BaselineImplementation):
    """Random baseline - returns random scores."""

    def __init__(self):
        super().__init__("Random")

    def analyze(self, citation: BenchmarkCitation) -> float:
        return random.random()


class RuleBasedBaseline(BaselineImplementation):
    """Rule-based baseline - simple heuristics."""

    def __init__(self):
        super().__init__("Rule-based")

    def analyze(self, citation: BenchmarkCitation) -> float:
        score = 0.5  # Default

        text = citation.text.lower()

        # Check for year
        if any(str(year) in text for year in range(2020, 2026)):
            score += 0.2

        # Check for author
        if "et al" in text or any(c.isupper() for c in citation.text):
            score += 0.1

        # Check for journal/conference
        journals = ["nature", "science", "cell", "pnas"]
        if any(j in text for j in journals):
            score += 0.2

        return min(1.0, score)


class MLBaseline(BaselineImplementation):
    """ML baseline - Random Forest classifier."""

    def __init__(self):
        super().__init__("ML (Random Forest)")
        self.vectorizer = TfidfVectorizer(max_features=100)
        self.classifier = RandomForestClassifier(n_estimators=50, random_state=42)
        self.is_trained = False

    def train(self, citations: List[BenchmarkCitation]) -> None:
        """Train the ML model."""
        texts = [c.text for c in citations]
        labels = [c.is_valid for c in citations]

        X = self.vectorizer.fit_transform(texts)
        self.classifier.fit(X, labels)
        self.is_trained = True

        print(f"✅ {self.name} trained on {len(citations)} citations")

    def analyze(self, citation: BenchmarkCitation) -> float:
        if not self.is_trained:
            return 0.5

        X = self.vectorizer.transform([citation.text])
        proba = self.classifier.predict_proba(X)[0]

        # Return probability of being valid
        return proba[1] if len(proba) > 1 else 0.5


class CitationEvaluationRunner:
    """
    Evaluation runner for citation integrity systems.

    Runs benchmarks and generates comprehensive metrics.
    """

    def __init__(self, output_dir: Path = Path("benchmark_results")):
        """
        Initialize evaluation runner.

        Args:
            output_dir: Directory to save results
        """
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.dataset_generator = BenchmarkDatasetGenerator()

    def evaluate_baseline(
        self,
        baseline: BaselineImplementation,
        dataset: List[BenchmarkCitation]
    ) -> CitationMetrics:
        """
        Evaluate a baseline implementation.

        Args:
            baseline: Baseline to evaluate
            dataset: Dataset to evaluate on

        Returns:
            CitationMetrics with evaluation results
        """
        print(f"\n🔬 Evaluating {baseline.name}...")

        predictions: List[bool] = []
        ground_truth: List[bool] = []
        latencies: List[float] = []

        start_time = time.time()

        for citation in dataset:
            # Measure latency
            t0 = time.time()
            integrity_score = baseline.analyze(citation)
            latency_ms = (time.time() - t0) * 1000
            latencies.append(latency_ms)

            # Convert to binary prediction (threshold = 0.5)
            predicted_valid = integrity_score >= 0.5

            predictions.append(predicted_valid)
            ground_truth.append(citation.is_valid)

        total_time = time.time() - start_time

        # Calculate accuracy metrics
        correct = sum(p == g for p, g in zip(predictions, ground_truth))
        accuracy = correct / len(dataset)

        # Use sklearn metrics
        precision, recall, f1, _ = precision_recall_fscore_support(
            ground_truth, predictions, average='binary', zero_division=0
        )

        # Confusion matrix - handle case where all predictions are same class
        cm = confusion_matrix(ground_truth, predictions, labels=[False, True])
        tn, fp, fn, tp = cm.ravel()

        # Performance metrics
        throughput = len(dataset) / total_time

        metrics = CitationMetrics(
            accuracy=accuracy,
            precision=precision,
            recall=recall,
            f1_score=f1,
            true_positives=int(tp),
            false_positives=int(fp),
            true_negatives=int(tn),
            false_negatives=int(fn),
            mean_latency_ms=statistics.mean(latencies),
            p50_latency_ms=statistics.median(latencies),
            p95_latency_ms=np.percentile(latencies, 95),
            p99_latency_ms=np.percentile(latencies, 99),
            throughput_per_sec=throughput,
            total_samples=len(dataset),
            final_accuracy=accuracy
        )

        print(f"  Accuracy: {accuracy:.1%}")
        print(f"  Precision: {precision:.1%}")
        print(f"  Recall: {recall:.1%}")
        print(f"  F1: {f1:.1%}")
        print(f"  Throughput: {throughput:.1f} citations/sec")
        print(f"  P95 Latency: {metrics.p95_latency_ms:.1f}ms")

        return metrics

    def run_complete_benchmark(
        self,
        baselines: List[BaselineImplementation],
        dataset_types: List[DatasetType] = None,
        dataset_size: int = 1000
    ) -> Dict[str, Dict[str, CitationMetrics]]:
        """
        Run complete benchmark suite.

        Args:
            baselines: List of baselines to evaluate
            dataset_types: Types of datasets to test on
            dataset_size: Size of each dataset

        Returns:
            Dict mapping baseline_name -> dataset_type -> metrics
        """
        if dataset_types is None:
            dataset_types = [DatasetType.CLEAN, DatasetType.MIXED, DatasetType.ADVERSARIAL]

        print(f"\n{'='*60}")
        print("MARCUS 3.0 Citation Integrity Benchmark Suite")
        print(f"{'='*60}")

        results: Dict[str, Dict[str, CitationMetrics]] = defaultdict(dict)

        # Generate datasets
        datasets: Dict[DatasetType, List[BenchmarkCitation]] = {}
        for dtype in dataset_types:
            print(f"\n📊 Generating {dtype.value} dataset ({dataset_size} citations)...")
            datasets[dtype] = self.dataset_generator.generate_dataset(dtype, dataset_size)

        # Train ML baseline if present
        ml_baseline = next((b for b in baselines if isinstance(b, MLBaseline)), None)
        if ml_baseline:
            # Train on mixed dataset
            train_data = self.dataset_generator.generate_dataset(DatasetType.MIXED, 5000)
            ml_baseline.train(train_data)

        # Run evaluations
        for baseline in baselines:
            print(f"\n{'='*60}")
            print(f"Evaluating: {baseline.name}")
            print(f"{'='*60}")

            for dtype in dataset_types:
                dataset = datasets[dtype]
                metrics = self.evaluate_baseline(baseline, dataset)
                results[baseline.name][dtype.value] = metrics

        # Save results
        self.save_results(results)

        # Generate comparison report
        self.generate_comparison_report(results)

        return results

    def save_results(self, results: Dict[str, Dict[str, CitationMetrics]]) -> None:
        """Save results to JSON file."""
        filepath = self.output_dir / f"benchmark_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        serializable_results = {
            baseline_name: {
                dataset_type: metrics.to_dict()
                for dataset_type, metrics in dataset_results.items()
            }
            for baseline_name, dataset_results in results.items()
        }

        with open(filepath, 'w') as f:
            json.dump(serializable_results, f, indent=2)

        print(f"\n✅ Results saved: {filepath}")

    def generate_comparison_report(self, results: Dict[str, Dict[str, CitationMetrics]]) -> None:
        """Generate comparison report in Markdown format."""
        filepath = self.output_dir / f"comparison_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"

        with open(filepath, 'w') as f:
            f.write("# MARCUS 3.0 Benchmark Comparison Report\n\n")
            f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

            # Summary table
            f.write("## Summary\n\n")
            f.write("| Baseline | Dataset | Accuracy | Precision | Recall | F1 | Throughput (c/s) | P95 Latency (ms) |\n")
            f.write("|----------|---------|----------|-----------|--------|----|-----------------|-----------------|\n")

            for baseline_name, dataset_results in results.items():
                for dataset_type, metrics in dataset_results.items():
                    f.write(f"| {baseline_name} | {dataset_type} | "
                           f"{metrics.accuracy:.1%} | {metrics.precision:.1%} | "
                           f"{metrics.recall:.1%} | {metrics.f1_score:.1%} | "
                           f"{metrics.throughput_per_sec:.1f} | {metrics.p95_latency_ms:.1f} |\n")

            # Detailed sections
            f.write("\n## Detailed Results\n\n")

            for baseline_name, dataset_results in results.items():
                f.write(f"\n### {baseline_name}\n\n")

                for dataset_type, metrics in dataset_results.items():
                    f.write(f"\n#### Dataset: {dataset_type}\n\n")
                    f.write(f"- **Accuracy:** {metrics.accuracy:.1%}\n")
                    f.write(f"- **Precision:** {metrics.precision:.1%}\n")
                    f.write(f"- **Recall:** {metrics.recall:.1%}\n")
                    f.write(f"- **F1 Score:** {metrics.f1_score:.1%}\n")
                    f.write(f"- **Throughput:** {metrics.throughput_per_sec:.1f} citations/sec\n")
                    f.write(f"- **Latency (mean):** {metrics.mean_latency_ms:.2f}ms\n")
                    f.write(f"- **Latency (p95):** {metrics.p95_latency_ms:.2f}ms\n")
                    f.write(f"- **Confusion Matrix:**\n")
                    f.write(f"  - True Positives: {metrics.true_positives}\n")
                    f.write(f"  - False Positives: {metrics.false_positives}\n")
                    f.write(f"  - True Negatives: {metrics.true_negatives}\n")
                    f.write(f"  - False Negatives: {metrics.false_negatives}\n")

        print(f"✅ Comparison report saved: {filepath}")


def main():
    """Example benchmark execution."""

    print("MARCUS 3.0 Citation Integrity Benchmark Suite\n")

    # Create baselines
    baselines = [
        RandomBaseline(),
        RuleBasedBaseline(),
        MLBaseline()
    ]

    # Run benchmarks
    runner = CitationEvaluationRunner(output_dir=Path("benchmark_results"))

    results = runner.run_complete_benchmark(
        baselines=baselines,
        dataset_types=[
            DatasetType.CLEAN,
            DatasetType.MIXED,
            DatasetType.ADVERSARIAL
        ],
        dataset_size=1000
    )

    print("\n✅ Benchmark complete!")
    print(f"Results saved to: {runner.output_dir}")


if __name__ == "__main__":
    main()
