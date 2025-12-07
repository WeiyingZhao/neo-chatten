"""
Test Configuration and Fixtures

Provides mock infrastructure for SpoonOS SDK and Neo3 SDK to enable
unit testing without external dependencies.
"""

import pytest
from unittest.mock import MagicMock, AsyncMock
from dataclasses import dataclass
from typing import Any, Optional


# =============================================================================
# MOCK SPOON SDK
# =============================================================================

class MockBaseTool:
    """Mock SpoonOS BaseTool."""
    name: str = "mock_tool"
    description: str = "Mock tool for testing"

    def __init__(self):
        pass


class MockToolCallAgent:
    """Mock SpoonOS ToolCallAgent."""

    def __init__(
        self,
        name: str = "MockAgent",
        system_prompt: str = "",
        tools: list = None,
        **kwargs
    ):
        self.name = name
        self.system_prompt = system_prompt
        self.tools = tools or []

    async def run(self, prompt: str) -> str:
        return "Mock response"


# =============================================================================
# MOCK NEO3 SDK
# =============================================================================

class MockUInt160:
    """Mock Neo3 UInt160."""

    def __init__(self, data: bytes = b'\x00' * 20):
        self._data = data

    @classmethod
    def from_string(cls, hex_string: str) -> 'MockUInt160':
        return cls()

    def __eq__(self, other):
        if isinstance(other, MockUInt160):
            return self._data == other._data
        return False


class MockAccount:
    """Mock Neo3 Account."""

    def __init__(self):
        self.script_hash = MockUInt160()
        self.address = "NXjtd123..."

    @classmethod
    def from_wif(cls, wif: str) -> 'MockAccount':
        return cls()


class MockInvokeResult:
    """Mock result from test_invoke."""

    def __init__(self, stack=None):
        self.stack = stack or []


class MockChainFacade:
    """Mock Neo3 ChainFacade."""

    def __init__(self, client=None):
        self.client = client

    async def test_invoke(self, contract, method, params):
        return MockInvokeResult([500000])

    async def invoke(self, contract, method, params, signers=None):
        return {"hash": "0xabc123"}


class MockNeoRpcClient:
    """Mock Neo3 RPC Client."""

    def __init__(self, url: str):
        self.url = url


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def sample_performance_metrics():
    """Fixture providing sample performance metrics for testing."""
    from tools.market_tools import PerformanceMetrics
    return PerformanceMetrics(
        avg_latency_ms=50.0,
        p95_latency_ms=100.0,
        p99_latency_ms=200.0,
        tokens_per_second=1000.0,
        requests_per_minute=600.0,
        accuracy_score=0.95,
        benchmark_score=85.0,
        uptime_percentage=99.9,
        error_rate=0.001,
        cost_per_1k_tokens=0.002,
        sample_size=1000
    )


@pytest.fixture
def sample_poor_metrics():
    """Fixture providing poor performance metrics for testing edge cases."""
    from tools.market_tools import PerformanceMetrics
    return PerformanceMetrics(
        avg_latency_ms=500.0,
        p95_latency_ms=1000.0,
        p99_latency_ms=2000.0,
        tokens_per_second=100.0,
        requests_per_minute=60.0,
        accuracy_score=0.60,
        benchmark_score=40.0,
        uptime_percentage=90.0,
        error_rate=0.10,
        cost_per_1k_tokens=0.01,
        sample_size=100
    )


@pytest.fixture
def excellent_metrics():
    """Fixture providing excellent performance metrics."""
    from tools.market_tools import PerformanceMetrics
    return PerformanceMetrics(
        avg_latency_ms=25.0,
        p95_latency_ms=50.0,
        p99_latency_ms=75.0,
        tokens_per_second=1500.0,
        requests_per_minute=900.0,
        accuracy_score=0.99,
        benchmark_score=95.0,
        uptime_percentage=99.99,
        error_rate=0.001,
        cost_per_1k_tokens=0.001,
        sample_size=10000
    )
