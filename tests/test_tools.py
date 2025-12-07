"""
Tests for SpoonOS Tools
"""

import pytest
from tools import NeoBridgeTool, TokenBalanceTool, QScoreAnalyzerTool
from tools.neo_bridge import NeoConfig, TransactionResult
from tools.token_tools import TokenTransferTool
from tools.market_tools import PerformanceMetrics, QScoreResult, ModelCategory, MarketAnalysis


class TestNeoBridgeTool:
    """Test suite for the Neo Bridge Tool."""

    def test_initialization(self):
        """Test tool initialization with default config."""
        tool = NeoBridgeTool()

        assert tool.name == "neo_bridge"
        assert tool.config is not None
        assert tool.config.rpc_url == "https://mainnet1.neo.coz.io:443"

    def test_custom_config(self):
        """Test tool initialization with custom config."""
        config = NeoConfig(
            rpc_url="https://testnet1.neo.coz.io:443",
            network_magic=894710606
        )
        tool = NeoBridgeTool(config=config)

        assert tool.config.rpc_url == "https://testnet1.neo.coz.io:443"
        assert tool.config.network_magic == 894710606

    def test_not_connected_initially(self):
        """Test that tool is not connected on init."""
        tool = NeoBridgeTool()
        assert not tool.is_connected()

    def test_get_address_returns_none_without_wallet(self):
        """Test get_address returns None when no wallet loaded."""
        tool = NeoBridgeTool()
        assert tool.get_address() is None

    @pytest.mark.asyncio
    async def test_connect_returns_false_stub(self):
        """Test connect() stub returns False."""
        tool = NeoBridgeTool()
        result = await tool.connect()
        assert result is False

    @pytest.mark.asyncio
    async def test_get_block_height_returns_zero_stub(self):
        """Test get_block_height() stub returns 0."""
        tool = NeoBridgeTool()
        result = await tool.get_block_height()
        assert result == 0

    @pytest.mark.asyncio
    async def test_get_transaction_returns_none_stub(self):
        """Test get_transaction() stub returns None."""
        tool = NeoBridgeTool()
        result = await tool.get_transaction("0xabc123")
        assert result is None

    @pytest.mark.asyncio
    async def test_wait_for_transaction_returns_result(self):
        """Test wait_for_transaction() returns TransactionResult."""
        tool = NeoBridgeTool()
        result = await tool.wait_for_transaction("0xabc123")
        assert isinstance(result, TransactionResult)
        assert result.tx_hash == "0xabc123"

    @pytest.mark.asyncio
    async def test_invoke_contract_returns_result(self):
        """Test invoke_contract() stub returns TransactionResult."""
        tool = NeoBridgeTool()
        result = await tool.invoke_contract("0xcontract", "method", [])
        assert isinstance(result, TransactionResult)

    @pytest.mark.asyncio
    async def test_test_invoke_returns_dict(self):
        """Test test_invoke() stub returns empty dict."""
        tool = NeoBridgeTool()
        result = await tool.test_invoke("0xcontract", "method", [])
        assert isinstance(result, dict)
        assert "stack" in result
        assert "gas_consumed" in result

    @pytest.mark.asyncio
    async def test_run_unknown_action(self):
        """Test run() with unknown action returns error."""
        tool = NeoBridgeTool()
        result = await tool.run(action="unknown")
        assert "error" in result


class TestTokenBalanceTool:
    """Test suite for the Token Balance Tool."""

    def test_initialization(self):
        """Test tool initialization."""
        tool = TokenBalanceTool(
            contract_hash="0x1234567890abcdef"
        )

        assert tool.name == "token_balance"
        assert tool.contract_hash == "0x1234567890abcdef"

    def test_neo_bridge_created_if_not_provided(self):
        """Test that NeoBridgeTool is created if not provided."""
        tool = TokenBalanceTool(contract_hash="0x123")

        assert tool.neo_bridge is not None
        assert isinstance(tool.neo_bridge, NeoBridgeTool)

    def test_neo_bridge_injected(self):
        """Test that NeoBridgeTool can be injected."""
        bridge = NeoBridgeTool()
        tool = TokenBalanceTool(contract_hash="0x123", neo_bridge=bridge)

        assert tool.neo_bridge is bridge

    @pytest.mark.asyncio
    async def test_get_balance_returns_zero_stub(self):
        """Test get_balance() stub returns 0."""
        tool = TokenBalanceTool(contract_hash="0x123")
        balance = await tool.get_balance("NXjtd...")
        assert balance == 0

    @pytest.mark.asyncio
    async def test_get_tokens_returns_empty_stub(self):
        """Test get_tokens() stub returns empty list."""
        tool = TokenBalanceTool(contract_hash="0x123")
        tokens = await tool.get_tokens("NXjtd...")
        assert tokens == []

    @pytest.mark.asyncio
    async def test_get_token_info_returns_none_stub(self):
        """Test get_token_info() stub returns None."""
        tool = TokenBalanceTool(contract_hash="0x123")
        info = await tool.get_token_info("token123")
        assert info is None

    @pytest.mark.asyncio
    async def test_get_owner_returns_none_stub(self):
        """Test get_owner() stub returns None."""
        tool = TokenBalanceTool(contract_hash="0x123")
        owner = await tool.get_owner("token123")
        assert owner is None

    @pytest.mark.asyncio
    async def test_run_returns_balance(self):
        """Test run() with balance action returns balance dict."""
        tool = TokenBalanceTool(contract_hash="0x123")
        result = await tool.run(action="balance", address="NXjtd...")
        assert "balance" in result


class TestTokenTransferTool:
    """Test suite for Token Transfer Tool."""

    def test_initialization(self):
        """Test tool initialization."""
        tool = TokenTransferTool(contract_hash="0x123abc")

        assert tool.name == "token_transfer"
        assert tool.contract_hash == "0x123abc"

    @pytest.mark.asyncio
    async def test_transfer_returns_not_implemented(self):
        """Test transfer() stub returns not implemented error."""
        tool = TokenTransferTool(contract_hash="0x123")
        result = await tool.transfer(to="NXjtd...", token_id="abc")

        assert result["success"] is False
        assert "Not implemented" in result["error"]

    @pytest.mark.asyncio
    async def test_approve_returns_not_implemented(self):
        """Test approve() stub returns not implemented error."""
        tool = TokenTransferTool(contract_hash="0x123")
        result = await tool.approve(approved="NXjtd...", token_id="abc")

        assert result["success"] is False
        assert "Not implemented" in result["error"]

    @pytest.mark.asyncio
    async def test_batch_transfer_returns_empty(self):
        """Test batch_transfer() stub returns empty list."""
        tool = TokenTransferTool(contract_hash="0x123")
        result = await tool.batch_transfer([{"to": "NXjtd...", "token_id": "abc"}])

        assert result == []

    @pytest.mark.asyncio
    async def test_run_transfer_action(self):
        """Test run() with transfer action."""
        tool = TokenTransferTool(contract_hash="0x123")
        result = await tool.run(action="transfer", to="NXjtd...", token_id="abc")

        assert result["success"] is False

    @pytest.mark.asyncio
    async def test_run_unknown_action(self):
        """Test run() with unknown action returns error."""
        tool = TokenTransferTool(contract_hash="0x123")
        result = await tool.run(action="unknown")

        assert "error" in result


class TestQScoreAnalyzerTool:
    """Test suite for the Q-Score Analyzer Tool."""

    def test_initialization(self):
        """Test tool initialization."""
        tool = QScoreAnalyzerTool()

        assert tool.name == "q_score_analyzer"
        assert tool.MIN_SCORE_FOR_MINT == 50

    def test_thresholds(self):
        """Test Q-score thresholds."""
        tool = QScoreAnalyzerTool()

        assert tool.EXCELLENT_THRESHOLD == 80
        assert tool.GOOD_THRESHOLD == 60
        assert tool.MIN_SCORE_FOR_MINT == 50

    def test_weights_sum_to_one(self):
        """Test that scoring weights sum to 1.0."""
        tool = QScoreAnalyzerTool()

        total = (
            tool.LATENCY_WEIGHT +
            tool.THROUGHPUT_WEIGHT +
            tool.QUALITY_WEIGHT +
            tool.RELIABILITY_WEIGHT
        )
        assert total == 1.0

    @pytest.mark.asyncio
    async def test_calculate_q_score_returns_result(self):
        """Test calculate_q_score returns QScoreResult."""
        tool = QScoreAnalyzerTool()
        result = await tool.calculate_q_score("test-model")

        assert isinstance(result, QScoreResult)
        assert result.model_id == "test-model"

    @pytest.mark.asyncio
    async def test_compare_models_returns_sorted_list(self):
        """Test compare_models returns sorted list by q_score."""
        tool = QScoreAnalyzerTool()
        results = await tool.compare_models(["model-a", "model-b"])

        assert len(results) == 2
        # Results should be sorted by q_score (highest first)
        assert results[0].q_score >= results[1].q_score

    @pytest.mark.asyncio
    async def test_get_market_analysis_returns_analysis(self):
        """Test get_market_analysis returns MarketAnalysis."""
        tool = QScoreAnalyzerTool()
        result = await tool.get_market_analysis()

        assert isinstance(result, MarketAnalysis)

    @pytest.mark.asyncio
    async def test_run_calculate_action(self):
        """Test run with calculate action."""
        tool = QScoreAnalyzerTool()
        result = await tool.run(action="calculate", model_id="test")

        assert "model_id" in result
        assert "q_score" in result
        assert "mint_eligible" in result

    @pytest.mark.asyncio
    async def test_run_compare_action(self):
        """Test run with compare action."""
        tool = QScoreAnalyzerTool()
        result = await tool.run(action="compare", model_ids=["a", "b"])

        assert "rankings" in result
        assert len(result["rankings"]) == 2

    @pytest.mark.asyncio
    async def test_run_market_action(self):
        """Test run with market action."""
        tool = QScoreAnalyzerTool()
        result = await tool.run(action="market")

        assert "total_models" in result
        assert "avg_q_score" in result
        assert "trend" in result

    @pytest.mark.asyncio
    async def test_run_unknown_action(self):
        """Test run with unknown action returns error."""
        tool = QScoreAnalyzerTool()
        result = await tool.run(action="unknown")

        assert "error" in result


class TestScoringFunctions:
    """Test Q-score component scoring functions."""

    @pytest.fixture
    def analyzer(self):
        return QScoreAnalyzerTool()

    def test_latency_score_excellent(self, analyzer, sample_performance_metrics):
        """Test excellent latency score (<50ms)."""
        sample_performance_metrics.avg_latency_ms = 25.0
        score = analyzer._calculate_latency_score(sample_performance_metrics)
        assert score == 1.0

    def test_latency_score_good(self, analyzer, sample_performance_metrics):
        """Test good latency score (50-100ms)."""
        sample_performance_metrics.avg_latency_ms = 75.0
        score = analyzer._calculate_latency_score(sample_performance_metrics)
        assert score == 0.8

    def test_latency_score_acceptable(self, analyzer, sample_performance_metrics):
        """Test acceptable latency score (100-200ms)."""
        sample_performance_metrics.avg_latency_ms = 150.0
        score = analyzer._calculate_latency_score(sample_performance_metrics)
        assert score == 0.6

    def test_latency_score_fair(self, analyzer, sample_performance_metrics):
        """Test fair latency score (200-500ms)."""
        sample_performance_metrics.avg_latency_ms = 350.0
        score = analyzer._calculate_latency_score(sample_performance_metrics)
        assert score == 0.4

    def test_latency_score_poor(self, analyzer, sample_performance_metrics):
        """Test poor latency score (500-1000ms)."""
        sample_performance_metrics.avg_latency_ms = 750.0
        score = analyzer._calculate_latency_score(sample_performance_metrics)
        assert score == 0.2

    def test_latency_score_unacceptable(self, analyzer, sample_performance_metrics):
        """Test unacceptable latency score (>=1000ms)."""
        sample_performance_metrics.avg_latency_ms = 2000.0
        score = analyzer._calculate_latency_score(sample_performance_metrics)
        assert score == 0.0

    def test_latency_score_zero_latency(self, analyzer, sample_performance_metrics):
        """Test zero latency returns 0.0 (invalid)."""
        sample_performance_metrics.avg_latency_ms = 0.0
        score = analyzer._calculate_latency_score(sample_performance_metrics)
        assert score == 0.0

    def test_throughput_score_excellent(self, analyzer, sample_performance_metrics):
        """Test excellent throughput score (>=1000 tps)."""
        sample_performance_metrics.tokens_per_second = 1500.0
        score = analyzer._calculate_throughput_score(sample_performance_metrics)
        assert score == 1.0

    def test_throughput_score_good(self, analyzer, sample_performance_metrics):
        """Test good throughput score (500-1000 tps)."""
        sample_performance_metrics.tokens_per_second = 750.0
        score = analyzer._calculate_throughput_score(sample_performance_metrics)
        assert score == 0.8

    def test_throughput_score_poor(self, analyzer, sample_performance_metrics):
        """Test poor throughput score (<50 tps)."""
        sample_performance_metrics.tokens_per_second = 25.0
        score = analyzer._calculate_throughput_score(sample_performance_metrics)
        assert score == 0.0

    def test_quality_score_calculation(self, analyzer, sample_performance_metrics):
        """Test quality score calculation."""
        sample_performance_metrics.accuracy_score = 0.95
        sample_performance_metrics.benchmark_score = 85.0
        score = analyzer._calculate_quality_score(sample_performance_metrics)
        # 0.95 * 0.6 + 0.85 * 0.4 = 0.57 + 0.34 = 0.91
        assert 0.90 <= score <= 0.92

    def test_quality_score_clamped(self, analyzer, sample_performance_metrics):
        """Test quality score is clamped to valid range."""
        sample_performance_metrics.accuracy_score = 1.5  # Invalid, should be clamped
        sample_performance_metrics.benchmark_score = 150.0  # Invalid, should be clamped
        score = analyzer._calculate_quality_score(sample_performance_metrics)
        assert score <= 1.0

    def test_reliability_score_high_uptime(self, analyzer, sample_performance_metrics):
        """Test reliability score with high uptime."""
        sample_performance_metrics.uptime_percentage = 99.9
        sample_performance_metrics.error_rate = 0.001
        score = analyzer._calculate_reliability_score(sample_performance_metrics)
        assert score >= 0.9

    def test_reliability_score_poor(self, analyzer, sample_poor_metrics):
        """Test reliability score with poor metrics."""
        score = analyzer._calculate_reliability_score(sample_poor_metrics)
        assert score < 0.5


class TestPerformanceMetricsDataclass:
    """Test PerformanceMetrics dataclass."""

    def test_default_values(self):
        """Test default values are set correctly."""
        metrics = PerformanceMetrics()

        assert metrics.avg_latency_ms == 0.0
        assert metrics.tokens_per_second == 0.0
        assert metrics.accuracy_score == 0.0
        assert metrics.uptime_percentage == 0.0

    def test_custom_values(self):
        """Test custom values are stored correctly."""
        metrics = PerformanceMetrics(
            avg_latency_ms=50.0,
            tokens_per_second=1000.0,
            accuracy_score=0.95,
            uptime_percentage=99.9
        )

        assert metrics.avg_latency_ms == 50.0
        assert metrics.tokens_per_second == 1000.0
        assert metrics.accuracy_score == 0.95
        assert metrics.uptime_percentage == 99.9


class TestModelCategories:
    """Test model category enum."""

    def test_category_values(self):
        """Test ModelCategory enum values."""
        assert ModelCategory.LLM.value == "llm"
        assert ModelCategory.IMAGE_GEN.value == "image_generation"
        assert ModelCategory.EMBEDDING.value == "embedding"
        assert ModelCategory.AUDIO.value == "audio"
        assert ModelCategory.MULTIMODAL.value == "multimodal"


class TestQScoreResult:
    """Test QScoreResult dataclass."""

    def test_qscore_result_creation(self):
        """Test QScoreResult can be created."""
        metrics = PerformanceMetrics()
        result = QScoreResult(
            model_id="test-model",
            q_score=75.0,
            category=ModelCategory.LLM,
            metrics=metrics
        )

        assert result.model_id == "test-model"
        assert result.q_score == 75.0
        assert result.category == ModelCategory.LLM
        assert result.mint_eligible is False  # default

    def test_qscore_result_recommendations_default(self):
        """Test QScoreResult has empty recommendations by default."""
        metrics = PerformanceMetrics()
        result = QScoreResult(
            model_id="test",
            q_score=50.0,
            category=ModelCategory.LLM,
            metrics=metrics
        )
        assert result.recommendations == []


class TestNeoBridgeDataclasses:
    """Test neo_bridge dataclasses."""

    def test_neo_config_defaults(self):
        """Test NeoConfig default values."""
        config = NeoConfig()

        assert config.rpc_url == "https://mainnet1.neo.coz.io:443"
        assert config.network_magic == 860833102  # MainNet

    def test_neo_config_custom(self):
        """Test NeoConfig custom values."""
        config = NeoConfig(
            rpc_url="http://localhost:50012",
            network_magic=12345,
            wallet_path="/path/to/wallet.json",
            wallet_password="secret"
        )

        assert config.rpc_url == "http://localhost:50012"
        assert config.network_magic == 12345
        assert config.wallet_path == "/path/to/wallet.json"
        assert config.wallet_password == "secret"

    def test_transaction_result_defaults(self):
        """Test TransactionResult default values."""
        result = TransactionResult(tx_hash="0xabc123")

        assert result.tx_hash == "0xabc123"
        assert result.block_height is None
        assert result.gas_consumed == 0.0
        assert result.state == "NONE"
        assert result.notifications == []

    def test_transaction_result_custom(self):
        """Test TransactionResult custom values."""
        result = TransactionResult(
            tx_hash="0xdef456",
            block_height=12345,
            gas_consumed=1.5,
            state="HALT",
            notifications=["event1", "event2"]
        )

        assert result.tx_hash == "0xdef456"
        assert result.block_height == 12345
        assert result.gas_consumed == 1.5
        assert result.state == "HALT"
        assert result.notifications == ["event1", "event2"]
