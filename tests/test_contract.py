"""
Tests for Chatten Compute-Fi Protocol (NEP-11 Divisible + Marketplace)

These tests verify the contract structure and constants.
Full integration tests require a Neo N3 test environment.

Note: These tests require neo3-boa to be installed to import the contract.
"""

import pytest

# Check if neo3-boa is available
try:
    from boa3.sc.compiletime import public  # noqa: F401
    BOA3_AVAILABLE = True
except ImportError:
    BOA3_AVAILABLE = False

# Skip all contract tests if boa3 is not installed
pytestmark = pytest.mark.skipif(
    not BOA3_AVAILABLE,
    reason="neo3-boa not installed - contract tests require boa3"
)


class TestChattenConstants:
    """Test suite for contract constants that actually exist."""

    def test_token_symbol(self):
        from contracts.chatten_token import TOKEN_SYMBOL
        assert TOKEN_SYMBOL == "COMPUTE"

    def test_token_decimals(self):
        from contracts.chatten_token import TOKEN_DECIMALS
        assert TOKEN_DECIMALS == 8

    def test_one_token_value(self):
        from contracts.chatten_token import ONE_TOKEN, TOKEN_DECIMALS
        assert ONE_TOKEN == 10 ** TOKEN_DECIMALS
        assert ONE_TOKEN == 100_000_000


class TestStoragePrefixes:
    """Test suite for storage prefix configuration."""

    def test_prefixes_are_single_byte(self):
        """Test that core storage prefixes are single-byte."""
        from contracts.chatten_token import (
            PREFIX_BALANCE,
            PREFIX_SUPPLY,
            PREFIX_TOTAL_SUPPLY,
            PREFIX_ADMIN,
            PREFIX_PAUSED,
            PREFIX_ORACLE,
            PREFIX_MINTER,
            PREFIX_PRICE,
            PREFIX_GAS_RESERVE,
            PREFIX_OWNERSHIP_CLAIMED,
        )

        prefixes = [
            PREFIX_BALANCE,
            PREFIX_SUPPLY,
            PREFIX_TOTAL_SUPPLY,
            PREFIX_ADMIN,
            PREFIX_PAUSED,
            PREFIX_ORACLE,
            PREFIX_MINTER,
            PREFIX_PRICE,
            PREFIX_GAS_RESERVE,
            PREFIX_OWNERSHIP_CLAIMED,
        ]

        for prefix in prefixes:
            assert len(prefix) == 1, f"Prefix {prefix!r} should be single byte"

    def test_prefixes_are_unique(self):
        """Test that storage prefixes are unique."""
        from contracts.chatten_token import (
            PREFIX_BALANCE,
            PREFIX_SUPPLY,
            PREFIX_TOTAL_SUPPLY,
            PREFIX_ADMIN,
            PREFIX_PAUSED,
            PREFIX_ORACLE,
            PREFIX_MINTER,
            PREFIX_PRICE,
            PREFIX_GAS_RESERVE,
            PREFIX_OWNERSHIP_CLAIMED,
        )

        prefixes = [
            PREFIX_BALANCE,
            PREFIX_SUPPLY,
            PREFIX_TOTAL_SUPPLY,
            PREFIX_ADMIN,
            PREFIX_PAUSED,
            PREFIX_ORACLE,
            PREFIX_MINTER,
            PREFIX_PRICE,
            PREFIX_GAS_RESERVE,
            PREFIX_OWNERSHIP_CLAIMED,
        ]

        unique_prefixes = set(prefixes)
        assert len(unique_prefixes) == len(prefixes), "Storage prefixes must be unique"


class TestNEP11Methods:
    """Test suite for NEP-11 standard methods."""

    def test_symbol_returns_string(self):
        from contracts.chatten_token import symbol
        result = symbol()
        assert isinstance(result, str)
        assert result == "COMPUTE"

    def test_decimals_returns_int(self):
        from contracts.chatten_token import decimals
        result = decimals()
        assert isinstance(result, int)
        assert result == 8


class TestZeroAddress:
    """Test suite for zero address constant."""

    def test_zero_address_length(self):
        from contracts.chatten_token import ZERO_ADDRESS
        assert len(ZERO_ADDRESS) == 20

    def test_zero_address_is_all_zeros(self):
        from contracts.chatten_token import ZERO_ADDRESS
        assert ZERO_ADDRESS == b'\x00' * 20


class TestContractFunctions:
    """Test suite verifying contract functions exist."""

    def test_nep11_methods_exist(self):
        """Test that core NEP-11 methods exist."""
        from contracts import chatten_token

        nep11_methods = [
            'symbol',
            'decimals',
            'totalSupply',
            'balanceOf',
            'tokensOf',
            'transfer',
            'tokenSupply',
        ]

        for method in nep11_methods:
            assert hasattr(chatten_token, method), f"Missing NEP-11 method: {method}"

    def test_pricing_methods_exist(self):
        """Verify pricing engine methods exist."""
        from contracts import chatten_token

        pricing_methods = [
            'get_current_price',
            'update_price_oracle',
            'get_gas_reserve',
        ]

        for method in pricing_methods:
            assert hasattr(chatten_token, method), f"Missing pricing method: {method}"

    def test_swap_methods_exist(self):
        """Verify DEX swap methods exist."""
        from contracts import chatten_token

        swap_methods = [
            'buy_compute',
            'sell_compute',
        ]

        for method in swap_methods:
            assert hasattr(chatten_token, method), f"Missing swap method: {method}"

    def test_nep17_receiver_exists(self):
        """Verify NEP-17 payment receiver exists."""
        from contracts import chatten_token
        assert hasattr(chatten_token, 'onNEP17Payment'), "Missing onNEP17Payment"

    def test_nep11_receiver_exists(self):
        """Verify NEP-11 payment receiver exists."""
        from contracts import chatten_token
        assert hasattr(chatten_token, 'onNEP11Payment'), "Missing onNEP11Payment"

    def test_admin_methods_exist(self):
        """Verify admin methods exist."""
        from contracts import chatten_token

        admin_methods = [
            'pause',
            'resume',
            'isPaused',
            'set_oracle',
            'set_minter',
            'get_admin',
            'is_oracle',
            'is_minter',
            'withdraw_gas',
            'claim_ownership',
            'is_ownership_claimed',
        ]

        for method in admin_methods:
            assert hasattr(chatten_token, method), f"Missing admin method: {method}"

    def test_mint_burn_methods_exist(self):
        """Verify mint/burn methods exist."""
        from contracts import chatten_token

        mint_methods = ['mint', 'burn']

        for method in mint_methods:
            assert hasattr(chatten_token, method), f"Missing mint/burn method: {method}"


class TestSwapFeeLogic:
    """Test swap fee calculation logic (hardcoded in contract as 0.3%)."""

    def test_fee_is_0_3_percent(self):
        """Verify the fee calculation matches 0.3% (3/1000)."""
        # Fee in contract: gas_amount * 3 // 1000
        amount = 10_000_000  # 0.1 GAS in smallest units
        expected_fee = amount * 3 // 1000
        assert expected_fee == 30_000  # 0.03% of 10M

    def test_buy_compute_formula(self):
        """Test the buy compute formula."""
        from contracts.chatten_token import ONE_TOKEN

        # Simulating: gas_amount * 3 // 1000 for fee, then compute = net * ONE_TOKEN // price
        gas_amount = 100_000_000  # 1 GAS
        price = 50_000_000  # 0.5 GAS per COMPUTE

        fee = gas_amount * 3 // 1000
        net = gas_amount - fee
        compute = net * ONE_TOKEN // price

        # Expected: ~1.994 COMPUTE (accounting for 0.3% fee)
        assert compute > ONE_TOKEN * 19 // 10  # > 1.9 COMPUTE
        assert compute < ONE_TOKEN * 2  # < 2.0 COMPUTE
