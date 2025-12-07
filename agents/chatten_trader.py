"""
Chatten Trader Agent

A SpoonOS-powered AI agent that acts as an autonomous trader for the 
Compute Token DEX on Neo N3 blockchain. It checks on-chain prices and 
executes buy orders when prices are attractive.
"""

import os
import asyncio
from typing import Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# SpoonOS SDK imports
try:
    from spoon_ai_sdk import ToolCallAgent, Tool, ToolResult
    from spoon_ai_sdk.tools import BaseTool
    _SPOON_SDK_AVAILABLE = True
except ImportError:
    # Fallback for development/scaffolding
    ToolCallAgent = object
    Tool = object
    ToolResult = dict
    BaseTool = object
    _SPOON_SDK_AVAILABLE = False

# Neo3 Python SDK imports
try:
    from neo3.api.wrappers import ChainFacade, NeoRpcClient
    from neo3.wallet import Account
    from neo3.core.types import UInt160
    from neo3.contracts import CONTRACT_HASHES
    from neo3.network.payloads.transaction import Transaction
    NEO3_AVAILABLE = True
except ImportError:
    NEO3_AVAILABLE = False
    ChainFacade = object
    NeoRpcClient = object
    Account = object
    UInt160 = bytes
    CONTRACT_HASHES = {}
    Transaction = object


# GAS Token Contract Hash (Neo N3)
# This is the standard GAS token contract on Neo N3
GAS_TOKEN_HASH = "0xd2a4cff31913016155e38e472a4c06d08be276cf"


def get_contract_hash() -> str:
    """
    Helper function to get the deployed contract hash from user input.
    
    Returns:
        str: The contract hash (hex string with or without 0x prefix)
    """
    contract_hash = input("Please enter the deployed Chatten contract hash: ").strip()
    # Remove 0x prefix if present for consistency
    if contract_hash.startswith("0x") or contract_hash.startswith("0X"):
        contract_hash = contract_hash[2:]
    return contract_hash


class PriceCheckTool(BaseTool):
    """
    SpoonOS Tool for checking the current on-chain price of a model.
    
    Uses test_invoke (read-only) to avoid gas fees when checking prices.
    """
    
    name: str = "get_price"
    description: str = """
    Check the current on-chain price of a compute model.
    This is a read-only operation that does not consume gas.
    
    Args:
        model_id: The model identifier (e.g., "gpt-4")
    
    Returns:
        float: The current price in GAS units
    """
    
    def __init__(
        self,
        contract_hash: Optional[str] = None,
        rpc_url: Optional[str] = None
    ) -> None:
        """
        Initialize the Price Check Tool.
        
        Args:
            contract_hash: Chatten contract hash (will prompt if None)
            rpc_url: Neo N3 RPC URL
        """
        super().__init__()
        self.contract_hash = contract_hash
        self.rpc_url = rpc_url or os.getenv("NEO_RPC_URL", "http://localhost:50012")
        self._facade: Optional[ChainFacade] = None
    
    async def _get_facade(self) -> ChainFacade:
        """Get or create ChainFacade instance."""
        if self._facade is None:
            if not NEO3_AVAILABLE:
                raise ImportError("neo-mamba is not installed. Install it with: pip install neo-mamba")
            # Create RPC client and facade
            client = NeoRpcClient(self.rpc_url)
            self._facade = ChainFacade(client)
        return self._facade
    
    async def get_price(self, model_id: str) -> float:
        """
        Get the current price for a model.
        
        Args:
            model_id: The model identifier
            
        Returns:
            float: The current price in GAS units
        """
        if not NEO3_AVAILABLE:
            raise ImportError("neo-mamba is not installed")
        
        # Get contract hash if not set
        contract_hash = self.contract_hash
        if not contract_hash:
            contract_hash = get_contract_hash()
        
        # Convert contract hash to UInt160
        if len(contract_hash) == 40:  # Without 0x prefix
            contract_hash = "0x" + contract_hash
        contract_script_hash = UInt160.from_string(contract_hash)
        
        # Get facade and test invoke
        facade = await self._get_facade()
        
        # Convert model_id to bytes for the contract call
        model_id_bytes = model_id.encode('utf-8')
        
        # Test invoke get_current_price (read-only, no gas cost)
        try:
            result = await facade.test_invoke(
                contract_script_hash,
                "get_current_price",
                [model_id_bytes]
            )
            
            if result and hasattr(result, 'stack') and len(result.stack) > 0:
                # Extract price from stack (price is stored as int in contract)
                price_value = result.stack[0]
                # The contract returns price as int
                # Extract the integer value
                if hasattr(price_value, 'value'):
                    price_int = price_value.value
                elif isinstance(price_value, (int, str)):
                    price_int = int(price_value)
                else:
                    price_int = int(price_value)
                
                # The contract stores price as an integer
                # Based on the requirement "below 1,000,000", the price is likely
                # already in a reasonable unit (not smallest units)
                # Return as float for consistency, but keep the integer value
                return float(price_int)
            else:
                raise ValueError(f"No price data returned for model '{model_id}'")
        except Exception as e:
            raise RuntimeError(f"Failed to fetch price for '{model_id}': {str(e)}")
    
    async def run(self, **kwargs: Any) -> ToolResult:
        """SpoonOS tool execution entry point."""
        model_id = kwargs.get("model_id", "")
        if not model_id:
            return {"error": "model_id is required"}
        
        try:
            price = await self.get_price(model_id)
            return {
                "model_id": model_id,
                "price": price,
                "success": True
            }
        except Exception as e:
            return {
                "error": str(e),
                "success": False
            }


class BuyComputeTool(BaseTool):
    """
    SpoonOS Tool for buying compute credits by transferring GAS to the contract.
    
    This tool constructs a transaction that transfers GAS to the Chatten Contract,
    with the model_id as the data parameter. This triggers onNEP17Payment which
    processes the buy order.
    """
    
    name: str = "buy_credits"
    description: str = """
    Buy compute credits for a specific model by transferring GAS to the contract.
    
    This is a write transaction that requires GAS and will be broadcast to the blockchain.
    
    Args:
        model_id: The model identifier (e.g., "gpt-4")
        gas_amount: Amount of GAS to spend (e.g., 2.0)
    
    Returns:
        dict: Transaction result with tx_hash
    """
    
    def __init__(
        self,
        contract_hash: Optional[str] = None,
        rpc_url: Optional[str] = None,
        private_key: Optional[str] = None
    ) -> None:
        """
        Initialize the Buy Compute Tool.
        
        Args:
            contract_hash: Chatten contract hash (will prompt if None)
            rpc_url: Neo N3 RPC URL
            private_key: Private key for signing (from env if None)
        """
        super().__init__()
        self.contract_hash = contract_hash
        self.rpc_url = rpc_url or os.getenv("NEO_RPC_URL", "http://localhost:50012")
        self.private_key = private_key or os.getenv("NEO_PRIVATE_KEY")
        self._facade: Optional[ChainFacade] = None
        self._account: Optional[Account] = None
    
    async def _get_facade(self) -> ChainFacade:
        """Get or create ChainFacade instance."""
        if self._facade is None:
            if not NEO3_AVAILABLE:
                raise ImportError("neo-mamba is not installed. Install it with: pip install neo-mamba")
            # Create RPC client and facade
            client = NeoRpcClient(self.rpc_url)
            self._facade = ChainFacade(client)
        return self._facade
    
    def _get_account(self) -> Account:
        """Get or create Account from private key."""
        if self._account is None:
            if not self.private_key:
                raise ValueError("NEO_PRIVATE_KEY not set in environment or provided")
            if not NEO3_AVAILABLE:
                raise ImportError("neo-mamba is not installed")
            self._account = Account.from_wif(self.private_key)
        return self._account
    
    async def buy_credits(self, model_id: str, gas_amount: float) -> dict:
        """
        Execute a buy order by transferring GAS to the contract.
        
        Args:
            model_id: The model identifier
            gas_amount: Amount of GAS to spend
            
        Returns:
            dict: Transaction result with tx_hash and status
        """
        if not NEO3_AVAILABLE:
            raise ImportError("neo-mamba is not installed")
        
        # Get contract hash if not set
        contract_hash = self.contract_hash
        if not contract_hash:
            contract_hash = get_contract_hash()
        
        # Convert contract hash to UInt160
        if len(contract_hash) == 40:  # Without 0x prefix
            contract_hash = "0x" + contract_hash
        contract_script_hash = UInt160.from_string(contract_hash)
        
        # Get GAS token contract hash
        gas_token_hash = UInt160.from_string(GAS_TOKEN_HASH)
        
        # Get account and facade
        account = self._get_account()
        facade = await self._get_facade()
        
        # Convert gas_amount to contract units (GAS has 8 decimals)
        gas_amount_int = int(gas_amount * 100_000_000)  # 10^8
        
        # Prepare model_id as data (bytes)
        model_id_data = model_id.encode('utf-8')
        
        # Construct transfer transaction: transfer GAS from account to contract
        # The transfer's data parameter will be the model_id, triggering onNEP17Payment
        try:
            # Invoke transfer on GAS token contract
            # Parameters: [from, to, amount, data]
            # Note: The GAS token transfer method signature is:
            # transfer(from: UInt160, to: UInt160, amount: int, data: Any)
            tx = await facade.invoke(
                gas_token_hash,
                "transfer",
                [
                    account.script_hash,  # from
                    contract_script_hash,  # to (Chatten contract)
                    gas_amount_int,       # amount (in smallest units)
                    model_id_data         # data (model_id as bytes)
                ],
                signers=[account]
            )
            
            # Extract transaction hash
            tx_hash = None
            if hasattr(tx, 'hash'):
                tx_hash = str(tx.hash)
            elif hasattr(tx, 'tx_id'):
                tx_hash = str(tx.tx_id)
            elif isinstance(tx, str):
                tx_hash = tx
            else:
                tx_hash = str(tx)
            
            return {
                "success": True,
                "tx_hash": tx_hash,
                "gas_amount": gas_amount,
                "model_id": model_id,
                "message": f"Successfully initiated buy order for {gas_amount} GAS worth of {model_id} credits"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "gas_amount": gas_amount,
                "model_id": model_id
            }
    
    async def run(self, **kwargs: Any) -> ToolResult:
        """SpoonOS tool execution entry point."""
        model_id = kwargs.get("model_id", "")
        gas_amount = kwargs.get("gas_amount", 0.0)
        
        if not model_id:
            return {"error": "model_id is required", "success": False}
        
        if gas_amount <= 0:
            return {"error": "gas_amount must be greater than 0", "success": False}
        
        try:
            result = await self.buy_credits(model_id, gas_amount)
            return result
        except Exception as e:
            return {
                "error": str(e),
                "success": False
            }


class ChattenTraderAgent(ToolCallAgent):
    """
    Autonomous trader agent that monitors prices and executes buy orders.
    
    This agent uses SpoonOS ToolCallAgent to autonomously check prices
    and execute trades based on configured thresholds.
    """
    
    SYSTEM_PROMPT = """
    You are an AI Liquidity Manager operating on the Neo N3 blockchain.
    
    Your primary task:
    - Check the on-chain price of 'gpt-4' using the get_price tool
    - If the price is below 1,000,000, immediately execute a BUY order for 2.0 GAS worth of credits using the buy_credits tool
    
    Always verify the price before executing any buy orders.
    Report the price and your decision clearly.
    """
    
    def __init__(
        self,
        contract_hash: Optional[str] = None,
        rpc_url: Optional[str] = None,
        private_key: Optional[str] = None,
        **kwargs: Any
    ) -> None:
        """
        Initialize the Chatten Trader Agent.
        
        Args:
            contract_hash: Chatten contract hash (will prompt if None)
            rpc_url: Neo N3 RPC URL
            private_key: Private key for signing transactions
            **kwargs: Additional arguments for ToolCallAgent
        """
        if not _SPOON_SDK_AVAILABLE:
            raise ImportError(
                "spoon-ai-sdk is not installed. Install it with: pip install spoon-ai-sdk"
            )
        
        # Initialize tools
        price_tool = PriceCheckTool(contract_hash=contract_hash, rpc_url=rpc_url)
        buy_tool = BuyComputeTool(
            contract_hash=contract_hash,
            rpc_url=rpc_url,
            private_key=private_key
        )
        
        # Initialize parent with tools
        super().__init__(
            name=kwargs.get("name", "ChattenTrader"),
            system_prompt=self.SYSTEM_PROMPT,
            tools=[price_tool, buy_tool],
            **{k: v for k, v in kwargs.items() if k != "name"}
        )
        
        self.contract_hash = contract_hash
        self.rpc_url = rpc_url
        self.price_tool = price_tool
        self.buy_tool = buy_tool


async def run_trader_loop(contract_hash: Optional[str] = None) -> None:
    """
    Run the trader agent loop once to demonstrate a trade.
    
    Args:
        contract_hash: Optional contract hash (will prompt if None)
    """
    print("=" * 70)
    print("Chatten Trader Agent - Autonomous Trading Bot")
    print("=" * 70)
    print()
    
    # Get contract hash if not provided
    if not contract_hash:
        contract_hash = get_contract_hash()
    
    # Check environment variables
    rpc_url = os.getenv("NEO_RPC_URL", "http://localhost:50012")
    private_key = os.getenv("NEO_PRIVATE_KEY")
    
    if not private_key:
        print("⚠️  Warning: NEO_PRIVATE_KEY not set. Buy operations will fail.")
        print("   Set it in your .env file or environment variables.")
        print()
    
    print(f"📡 RPC URL: {rpc_url}")
    print(f"📝 Contract Hash: {contract_hash}")
    print()
    
    # Create agent
    try:
        agent = ChattenTraderAgent(
            contract_hash=contract_hash,
            rpc_url=rpc_url,
            private_key=private_key
        )
        
        print("🤖 Agent initialized successfully!")
        print()
        print("🔄 Running trading loop...")
        print()
        
        # Run the agent with a prompt to check price and buy if attractive
        prompt = "Check the price of 'gpt-4'. If it is below 1,000,000, BUY 2.0 GAS worth of credits immediately."
        
        print(f"💬 Agent Prompt: {prompt}")
        print()
        
        # Execute the agent
        response = await agent.run(prompt)
        
        print("=" * 70)
        print("Agent Response:")
        print("=" * 70)
        print(response)
        print()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print()
        import traceback
        traceback.print_exc()


def main() -> None:
    """Main entry point."""
    asyncio.run(run_trader_loop())


if __name__ == "__main__":
    main()
