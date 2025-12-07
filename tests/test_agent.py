"""
Tests for ChattenTraderAgent and its tools (PriceCheckTool, BuyComputeTool)
"""

import pytest
import os


class TestChattenTraderAgentImport:
    """Test that agent can be imported correctly."""

    def test_import_from_agents_module(self):
        """Test basic import works."""
        from agents import ChattenTraderAgent
        assert ChattenTraderAgent is not None

    def test_system_prompt_defined(self):
        """Test that SYSTEM_PROMPT class attribute exists."""
        from agents import ChattenTraderAgent
        assert hasattr(ChattenTraderAgent, 'SYSTEM_PROMPT')
        assert "Liquidity Manager" in ChattenTraderAgent.SYSTEM_PROMPT


class TestPriceCheckTool:
    """Tests for PriceCheckTool."""

    def test_tool_has_correct_name(self):
        """Test tool name is correctly set."""
        from agents.chatten_trader import PriceCheckTool
        tool = PriceCheckTool(contract_hash="0x1234")
        assert tool.name == "get_price"

    def test_tool_stores_contract_hash(self):
        """Test that tool stores contract_hash."""
        from agents.chatten_trader import PriceCheckTool
        tool = PriceCheckTool(contract_hash="0xabc123")
        assert tool.contract_hash == "0xabc123"

    def test_tool_stores_custom_rpc_url(self):
        """Test that tool stores custom rpc_url."""
        from agents.chatten_trader import PriceCheckTool
        tool = PriceCheckTool(
            contract_hash="0xabc123",
            rpc_url="http://test.local:50012"
        )
        assert tool.rpc_url == "http://test.local:50012"

    def test_default_rpc_url_from_env(self):
        """Test default RPC URL is used when not provided."""
        from agents.chatten_trader import PriceCheckTool

        # Save original and clear env var
        original = os.environ.get("NEO_RPC_URL")
        if "NEO_RPC_URL" in os.environ:
            del os.environ["NEO_RPC_URL"]

        try:
            tool = PriceCheckTool(contract_hash="0x123")
            assert tool.rpc_url == "http://localhost:50012"
        finally:
            if original:
                os.environ["NEO_RPC_URL"] = original

    def test_tool_has_description(self):
        """Test tool has a description for agent context."""
        from agents.chatten_trader import PriceCheckTool
        tool = PriceCheckTool(contract_hash="0x123")
        assert tool.description is not None
        assert len(tool.description) > 0

    @pytest.mark.asyncio
    async def test_run_requires_model_id(self):
        """Test that run returns error when model_id missing."""
        from agents.chatten_trader import PriceCheckTool
        tool = PriceCheckTool(contract_hash="0x123")
        result = await tool.run()
        assert result.get("success") is False or "error" in result


class TestBuyComputeTool:
    """Tests for BuyComputeTool."""

    def test_tool_has_correct_name(self):
        """Test tool name is correctly set."""
        from agents.chatten_trader import BuyComputeTool
        tool = BuyComputeTool(contract_hash="0x1234")
        assert tool.name == "buy_credits"

    def test_tool_stores_config(self):
        """Test that tool stores configuration."""
        from agents.chatten_trader import BuyComputeTool
        tool = BuyComputeTool(
            contract_hash="0xabc123",
            rpc_url="http://test.local:50012",
            private_key="test_key"
        )
        assert tool.contract_hash == "0xabc123"
        assert tool.rpc_url == "http://test.local:50012"
        assert tool.private_key == "test_key"

    def test_default_rpc_url(self):
        """Test default RPC URL is used when not provided."""
        from agents.chatten_trader import BuyComputeTool

        original = os.environ.get("NEO_RPC_URL")
        if "NEO_RPC_URL" in os.environ:
            del os.environ["NEO_RPC_URL"]

        try:
            tool = BuyComputeTool(contract_hash="0x123")
            assert tool.rpc_url == "http://localhost:50012"
        finally:
            if original:
                os.environ["NEO_RPC_URL"] = original

    def test_tool_has_description(self):
        """Test tool has a description for agent context."""
        from agents.chatten_trader import BuyComputeTool
        tool = BuyComputeTool(contract_hash="0x123")
        assert tool.description is not None
        assert len(tool.description) > 0

    @pytest.mark.asyncio
    async def test_run_requires_model_id(self):
        """Test that run returns error when model_id missing."""
        from agents.chatten_trader import BuyComputeTool
        tool = BuyComputeTool(contract_hash="0x123")
        result = await tool.run(gas_amount=1.0)
        assert result["success"] is False
        assert "model_id" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_run_requires_positive_gas(self):
        """Test that run returns error when gas_amount invalid."""
        from agents.chatten_trader import BuyComputeTool
        tool = BuyComputeTool(contract_hash="0x123")
        result = await tool.run(model_id="gpt-4", gas_amount=0)
        assert result["success"] is False
        assert "gas_amount" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_run_requires_negative_gas_rejected(self):
        """Test that run returns error when gas_amount is negative."""
        from agents.chatten_trader import BuyComputeTool
        tool = BuyComputeTool(contract_hash="0x123")
        result = await tool.run(model_id="gpt-4", gas_amount=-1.0)
        assert result["success"] is False


class TestGasTokenHash:
    """Test GAS token hash constant."""

    def test_gas_token_hash_format(self):
        """Test GAS token hash is in correct format."""
        from agents.chatten_trader import GAS_TOKEN_HASH
        assert GAS_TOKEN_HASH.startswith("0x")
        assert len(GAS_TOKEN_HASH) == 42  # 0x + 40 hex chars


class TestContractHashHelpers:
    """Test contract hash handling."""

    def test_contract_hash_without_prefix(self):
        """Test tool accepts contract hash without 0x prefix."""
        from agents.chatten_trader import PriceCheckTool
        tool = PriceCheckTool(contract_hash="abc123def456")
        assert tool.contract_hash == "abc123def456"

    def test_contract_hash_with_prefix(self):
        """Test tool accepts contract hash with 0x prefix."""
        from agents.chatten_trader import PriceCheckTool
        tool = PriceCheckTool(contract_hash="0xabc123def456")
        assert tool.contract_hash == "0xabc123def456"
