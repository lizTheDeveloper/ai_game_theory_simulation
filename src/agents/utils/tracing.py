"""
OpenTelemetry Distributed Tracing for Python Citation Agents

Provides trace instrumentation for citation agents with automatic
context propagation and Jaeger integration.

Usage:
    from agents.utils.tracing import tracer, traced_operation

    @traced_operation("citation.evaluate")
    def evaluate_citation(citation_text: str) -> float:
        return integrity_score

    # Or manually:
    with tracer.start_as_current_span("agent.analyze") as span:
        span.set_attribute("citation.id", citation_id)
        result = analyze(citation_id)
        span.set_attribute("result.integrity", result)
"""

import os
from typing import Any, Callable, Optional
from functools import wraps

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.resources import Resource, SERVICE_NAME, SERVICE_VERSION
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.trace import Status, StatusCode
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

# Environment configuration
SERVICE_NAME_VALUE = os.getenv("SERVICE_NAME", "marcus-citation-agent")
SERVICE_VERSION_VALUE = os.getenv("VERSION", "dev")
JAEGER_AGENT_HOST = os.getenv("JAEGER_AGENT_HOST", "localhost")
JAEGER_AGENT_PORT = int(os.getenv("JAEGER_AGENT_PORT", "6831"))
NODE_ENV = os.getenv("NODE_ENV", "development")

# Create resource with service metadata
resource = Resource(attributes={
    SERVICE_NAME: SERVICE_NAME_VALUE,
    SERVICE_VERSION: SERVICE_VERSION_VALUE,
    "deployment.environment": NODE_ENV,
})

# Configure Jaeger exporter
jaeger_exporter = JaegerExporter(
    agent_host_name=JAEGER_AGENT_HOST,
    agent_port=JAEGER_AGENT_PORT,
)

# Set up tracer provider
provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(jaeger_exporter)
provider.add_span_processor(processor)

# Register as global tracer provider
trace.set_tracer_provider(provider)

# Instrument HTTP requests automatically
RequestsInstrumentor().instrument()

# Get tracer instance
tracer = trace.get_tracer(SERVICE_NAME_VALUE, SERVICE_VERSION_VALUE)

# Configure trace context propagation
propagator = TraceContextTextMapPropagator()


def traced_operation(operation_name: str, attributes: Optional[dict] = None):
    """
    Decorator to automatically trace a function execution.

    Args:
        operation_name: Name of the operation for the span
        attributes: Optional dict of attributes to add to the span

    Example:
        @traced_operation("citation.evaluate", {"agent.type": "neural"})
        def evaluate_citation(text: str) -> float:
            return compute_integrity(text)
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            with tracer.start_as_current_span(operation_name) as span:
                # Add custom attributes
                if attributes:
                    for key, value in attributes.items():
                        span.set_attribute(key, value)

                # Add function metadata
                span.set_attribute("function.name", func.__name__)
                span.set_attribute("function.module", func.__module__)

                try:
                    result = func(*args, **kwargs)
                    span.set_status(Status(StatusCode.OK))
                    return result
                except Exception as e:
                    span.record_exception(e)
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                    raise

        return wrapper
    return decorator


def add_span_attribute(key: str, value: Any) -> None:
    """
    Add attribute to the current active span.

    Args:
        key: Attribute key
        value: Attribute value (str, int, float, bool)

    Example:
        add_span_attribute("citation.behavior", "proper_attribution")
        add_span_attribute("citation.integrity", 0.95)
    """
    span = trace.get_current_span()
    if span and span.is_recording():
        span.set_attribute(key, value)


def add_span_event(name: str, attributes: Optional[dict] = None) -> None:
    """
    Add event to the current active span.

    Args:
        name: Event name
        attributes: Optional dict of event attributes

    Example:
        add_span_event("cache.miss", {"key": "citation:abc123"})
        add_span_event("retry.attempt", {"attempt": 2, "max_retries": 3})
    """
    span = trace.get_current_span()
    if span and span.is_recording():
        span.add_event(name, attributes or {})


def get_trace_context() -> Optional[dict]:
    """
    Get current trace and span IDs for log correlation.

    Returns:
        Dict with traceId and spanId, or None if no active span

    Example:
        context = get_trace_context()
        if context:
            logger.info(f"Processing citation", extra=context)
    """
    span = trace.get_current_span()
    if span and span.is_recording():
        span_context = span.get_span_context()
        return {
            "trace_id": format(span_context.trace_id, "032x"),
            "span_id": format(span_context.span_id, "016x"),
        }
    return None


def inject_trace_context(carrier: dict) -> None:
    """
    Inject trace context into carrier for cross-process propagation.

    Args:
        carrier: Dict to inject trace context into (e.g., HTTP headers)

    Example:
        headers = {}
        inject_trace_context(headers)
        response = requests.get(url, headers=headers)
    """
    propagator.inject(carrier)


def extract_trace_context(carrier: dict):
    """
    Extract trace context from carrier and set as active context.

    Args:
        carrier: Dict containing trace context (e.g., HTTP headers)

    Example:
        # In request handler
        ctx = extract_trace_context(request.headers)
        with trace.use_span(tracer.start_span("process.request", context=ctx)):
            process_request()
    """
    return propagator.extract(carrier)


# Example usage patterns
if __name__ == "__main__":
    # Example 1: Traced operation decorator
    @traced_operation("citation.analyze", {"agent.id": "agent-1"})
    def analyze_citation(text: str) -> dict:
        add_span_attribute("citation.length", len(text))
        add_span_event("analysis.started")

        # Simulate analysis
        integrity = 0.85
        behavior = "proper_attribution"

        add_span_attribute("citation.integrity", integrity)
        add_span_attribute("citation.behavior", behavior)
        add_span_event("analysis.completed")

        return {"integrity": integrity, "behavior": behavior}

    # Example 2: Manual span creation
    def evaluate_with_context(citation_id: str) -> float:
        with tracer.start_as_current_span("citation.evaluate") as span:
            span.set_attribute("citation.id", citation_id)

            # Get trace context for logging
            trace_ctx = get_trace_context()
            print(f"Trace context: {trace_ctx}")

            # Simulate evaluation
            score = 0.92
            span.set_attribute("evaluation.score", score)

            return score

    # Example 3: Cross-process context propagation
    def call_remote_service(citation_id: str):
        headers = {}
        inject_trace_context(headers)

        # In real code: requests.post(url, json=data, headers=headers)
        print(f"Propagating trace context: {headers}")

    # Run examples
    print("Running tracing examples...")
    analyze_citation("This is a test citation")
    evaluate_with_context("citation-123")
    call_remote_service("citation-456")
    print("✅ Tracing examples complete")
