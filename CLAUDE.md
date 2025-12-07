# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chatten is a decentralized exchange for AI compute tokens on the Neo N3 blockchain, powered by the SpoonOS agent framework. It enables AI agents to buy and sell model compute capacity based on real-time Q-score (quality score) performance metrics.

## Development Commands

```bash
# Install dependencies
uv sync                       # Recommended
pip install -e ".[dev]"       # Alternative

# Run the application
python main.py                # Start the Chatten agent
chatten                       # Via installed command

# Testing
uv run pytest                                          # Full test suite
uv run pytest --cov=. --cov-report=term-missing       # With coverage
uv run pytest tests/test_example.py -k "scenario"     # Single test
uv run pytest -x --pdb                                # Debug on failure

# Linting and formatting
ruff check .                  # Lint
black .                       # Format
mypy .                        # Type check

# Contract compilation
neo3-boa compile contracts/chatten_token.py
```

## Architecture

### Core Components

**SpoonOS Agent** (`agents/chatten_trader.py`):
- `ChattenTraderAgent` extends SpoonOS `ToolCallAgent` for autonomous trading
- Uses `PriceCheckTool` (read-only via `test_invoke`) and `BuyComputeTool` (signed tx via GAS transfer)
- System prompt defines trading behavior: check `gpt-4` price, buy if < 1,000,000

**NEP-11 Smart Contract** (`contracts/chatten_token.py`):
- Divisible NEP-11 token with marketplace functionality
- Compiled with neo3-boa v1.4.x
- Key flows:
  - `mint()` - Oracle/minter creates tokens (requires Q-score >= 50)
  - `buy_compute()` - Users transfer GAS, receive COMPUTE tokens (0.3% fee)
  - `sell_compute()` - Users burn tokens, receive GAS from reserve
  - `claim_ownership()` - Must be called post-deployment to activate admin permissions

**SpoonOS Tools** (`tools/`):
- `NeoBridgeTool` - Core RPC communication, wallet loading, contract invocation
- `TokenBalanceTool` / `TokenTransferTool` - NEP-11 balance queries and transfers
- `QScoreAnalyzerTool` - Calculates composite Q-score (0-100) from latency, throughput, quality, reliability (25% each)

### Data Flow

1. Agent checks on-chain price via `test_invoke` (no gas cost)
2. If price attractive, agent constructs GAS transfer to contract with model_id as data
3. Contract's `onNEP17Payment` receives GAS, `buy_compute` mints COMPUTE tokens
4. Token supply/balance updated, transfer event emitted

### Key Configurations

- Network magic: TestNet=894710606, MainNet=860833102
- RPC endpoints: TestNet `https://testnet1.neo.coz.io:443`
- GAS token hash: `0xd2a4cff31913016155e38e472a4c06d08be276cf`
- Token symbol: `COMPUTE`, decimals: 8

## Environment Variables

Required:
- `NEO_RPC_URL` - Neo N3 RPC endpoint
- `OPENAI_API_KEY` - For agent LLM reasoning

Important:
- `NEO_PRIVATE_KEY` - WIF format for signing transactions
- `CHATTEN_CONTRACT_HASH` - Deployed contract script hash
- `DRY_RUN=true` - Simulate transactions without broadcast

## Contract Deployment Notes

After deploying `chatten_token.py`:
1. Record the contract hash in `.env`
2. Call `claim_ownership()` with the deployer wallet to activate oracle/minter permissions
3. Use `set_oracle()` and `set_minter()` to authorize additional addresses

## Testing Strategy

Tests use `pytest-asyncio` with `asyncio_mode = "auto"`. Test categories:
- `test_agent.py` - Agent lifecycle and tool integration
- `test_contract.py` - Contract function unit tests
- `test_tools.py` - SpoonOS tool behavior

See `docs/testnet_test_plan.md` for comprehensive TestNet validation scenarios.
