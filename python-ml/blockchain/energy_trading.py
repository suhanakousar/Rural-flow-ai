import hashlib
import json
import time
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

class Block:
    """A block in the energy trading blockchain"""
    
    def __init__(self, index: int, timestamp: float, transactions: List[Dict[str, Any]], 
                 previous_hash: str, proof: int = 0):
        """
        Initialize a new block
        
        Args:
            index: Position of the block in the chain
            timestamp: When the block was created
            transactions: List of energy trading transactions
            previous_hash: Hash of the previous block
            proof: Proof of work number
        """
        self.index = index
        self.timestamp = timestamp
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.proof = proof
        self.hash = self.compute_hash()
        
    def compute_hash(self) -> str:
        """Compute SHA-256 hash of the block"""
        block_string = json.dumps({
            'index': self.index,
            'timestamp': self.timestamp,
            'transactions': self.transactions,
            'previous_hash': self.previous_hash,
            'proof': self.proof
        }, sort_keys=True).encode()
        
        return hashlib.sha256(block_string).hexdigest()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert block to dictionary"""
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'transactions': self.transactions,
            'previous_hash': self.previous_hash,
            'proof': self.proof,
            'hash': self.hash
        }

class Blockchain:
    """Energy trading blockchain implementation"""
    
    def __init__(self):
        """Initialize the blockchain with a genesis block"""
        self.chain: List[Block] = []
        self.pending_transactions: List[Dict[str, Any]] = []
        self.nodes = set()
        
        # Create genesis block
        self.create_genesis_block()
        
    def create_genesis_block(self) -> None:
        """Create the first block in the chain"""
        genesis_block = Block(0, time.time(), [], "0")
        genesis_block.hash = genesis_block.compute_hash()
        self.chain.append(genesis_block)
        
    @property
    def last_block(self) -> Block:
        """Get the last block in the chain"""
        return self.chain[-1]
    
    def proof_of_work(self, block: Block) -> int:
        """
        Simple Proof of Work algorithm:
        - Find a number p' such that hash(pp') contains 4 leading zeroes
        - p is the previous proof, p' is the new proof
        """
        block.proof = 0
        computed_hash = block.compute_hash()
        
        while not computed_hash.startswith('0000'):
            block.proof += 1
            computed_hash = block.compute_hash()
            
        return block.proof
    
    def add_transaction(self, sender: str, receiver: str, amount: float, 
                         price: float, timestamp: Optional[float] = None) -> Dict[str, Any]:
        """
        Add a new energy trading transaction
        
        Args:
            sender: Address of the energy seller
            receiver: Address of the energy buyer
            amount: Amount of energy in kWh
            price: Price per kWh
            timestamp: When the transaction occurred (default: current time)
        
        Returns:
            Transaction details
        """
        if timestamp is None:
            timestamp = time.time()
            
        transaction = {
            'id': str(uuid.uuid4()).replace('-', ''),
            'sender': sender,
            'receiver': receiver,
            'amount': amount,
            'price': price,
            'total': round(amount * price, 2),
            'timestamp': timestamp,
            'energy_type': 'solar',  # Default to solar energy
            'status': 'pending'
        }
        
        self.pending_transactions.append(transaction)
        return transaction
    
    def mine_pending_transactions(self, miner_address: str) -> Block:
        """
        Create a new block with all pending transactions and add it to the chain
        
        Args:
            miner_address: Address that will receive mining reward
        
        Returns:
            The new Block
        """
        if not self.pending_transactions:
            return None
            
        # Create mining reward transaction
        self.add_transaction(
            sender="SYSTEM",
            receiver=miner_address,
            amount=1.0,
            price=0.0
        )
        
        # Create a new block
        block = Block(
            index=len(self.chain),
            timestamp=time.time(),
            transactions=self.pending_transactions,
            previous_hash=self.last_block.hash
        )
        
        # Find the proof of work
        self.proof_of_work(block)
        
        # Add the new block to the chain
        self.chain.append(block)
        
        # Update transaction status
        for tx in self.pending_transactions:
            tx['status'] = 'confirmed'
        
        # Reset pending transactions
        self.pending_transactions = []
        
        return block
    
    def is_chain_valid(self) -> bool:
        """
        Check if the blockchain is valid:
        1. Each block's hash is correctly computed
        2. Each block's previous_hash matches the hash of the previous block
        3. All blocks have valid proofs
        """
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i-1]
            
            # Check if current block's hash is correctly computed
            if current.hash != current.compute_hash():
                return False
                
            # Check if current block points to previous block's hash
            if current.previous_hash != previous.hash:
                return False
                
            # Check if current block has a valid proof
            if not current.hash.startswith('0000'):
                return False
                
        return True
    
    def get_transactions_for_address(self, address: str) -> List[Dict[str, Any]]:
        """Get all transactions where the specified address is sender or receiver"""
        transactions = []
        
        # Check all blocks in the chain
        for block in self.chain:
            for tx in block.transactions:
                if tx['sender'] == address or tx['receiver'] == address:
                    transactions.append(tx)
                    
        # Also check pending transactions
        for tx in self.pending_transactions:
            if tx['sender'] == address or tx['receiver'] == address:
                transactions.append(tx)
                
        return transactions
    
    def get_balance(self, address: str) -> float:
        """Calculate the balance of energy tokens for an address"""
        balance = 0.0
        
        # Check all blocks in the chain
        for block in self.chain:
            for tx in block.transactions:
                if tx['receiver'] == address:
                    balance += tx['total']
                if tx['sender'] == address:
                    balance -= tx['total']
                    
        return balance
    
    def export_chain(self) -> List[Dict[str, Any]]:
        """Export the entire blockchain as a list of dictionaries"""
        return [block.to_dict() for block in self.chain]
    
    def get_transaction(self, tx_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific transaction by ID"""
        # Check all blocks in the chain
        for block in self.chain:
            for tx in block.transactions:
                if tx['id'] == tx_id:
                    return tx
                    
        # Also check pending transactions
        for tx in self.pending_transactions:
            if tx['id'] == tx_id:
                return tx
                
        return None

class EnergyTrading:
    """Energy trading system using blockchain"""
    
    def __init__(self):
        """Initialize energy trading system"""
        self.blockchain = Blockchain()
        self.users = {}  # Address -> User info mapping
        
    def register_user(self, user_id: str, name: str, energy_type: str = 'solar') -> Dict[str, Any]:
        """Register a new user in the energy trading system"""
        address = hashlib.sha256(f"{user_id}:{int(time.time())}".encode()).hexdigest()
        
        user = {
            'id': user_id,
            'name': name,
            'address': address,
            'energy_type': energy_type,
            'registered_at': datetime.now().isoformat(),
            'energy_produced': 0.0,
            'energy_consumed': 0.0
        }
        
        self.users[address] = user
        return user
    
    def create_energy_transaction(self, seller_address: str, buyer_address: str, 
                                 amount: float, price: float) -> Dict[str, Any]:
        """Create an energy trading transaction"""
        # Validate addresses
        if seller_address not in self.users or buyer_address not in self.users:
            raise ValueError("Invalid seller or buyer address")
            
        # Add transaction to the blockchain
        transaction = self.blockchain.add_transaction(
            sender=seller_address,
            receiver=buyer_address,
            amount=amount,
            price=price
        )
        
        # Update user stats
        self.users[seller_address]['energy_produced'] += amount
        self.users[buyer_address]['energy_consumed'] += amount
        
        return transaction
    
    def process_transactions(self) -> Dict[str, Any]:
        """Process pending transactions and create a new block"""
        # Choose a random miner (in a real system, this would be more complex)
        miner = list(self.users.keys())[0] if self.users else "SYSTEM"
        
        # Mine the block
        block = self.blockchain.mine_pending_transactions(miner)
        
        if block:
            return {
                'success': True,
                'block': block.to_dict(),
                'transactions_count': len(block.transactions)
            }
        else:
            return {
                'success': False,
                'error': 'No pending transactions to process'
            }
    
    def get_user_transactions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all transactions for a user"""
        # Find user address by ID
        user_address = None
        for address, user in self.users.items():
            if user['id'] == user_id:
                user_address = address
                break
                
        if not user_address:
            return []
            
        return self.blockchain.get_transactions_for_address(user_address)
    
    def get_user_balance(self, user_id: str) -> float:
        """Get the energy token balance for a user"""
        # Find user address by ID
        user_address = None
        for address, user in self.users.items():
            if user['id'] == user_id:
                user_address = address
                break
                
        if not user_address:
            return 0.0
            
        return self.blockchain.get_balance(user_address)
    
    def get_market_stats(self) -> Dict[str, Any]:
        """Get market statistics for energy trading"""
        total_energy_traded = 0.0
        total_value_traded = 0.0
        transaction_count = 0
        
        # Calculate statistics from confirmed transactions
        for block in self.blockchain.chain:
            for tx in block.transactions:
                if tx['sender'] != "SYSTEM" and tx['receiver'] != "SYSTEM":
                    total_energy_traded += tx['amount']
                    total_value_traded += tx['total']
                    transaction_count += 1
        
        # Calculate average price
        avg_price = total_value_traded / total_energy_traded if total_energy_traded > 0 else 0
        
        return {
            'total_energy_traded': round(total_energy_traded, 2),
            'total_value_traded': round(total_value_traded, 2),
            'transaction_count': transaction_count,
            'average_price': round(avg_price, 4),
            'active_users': len(self.users),
            'pending_transactions': len(self.blockchain.pending_transactions)
        }

# Create a singleton instance
energy_trading = EnergyTrading()

# Add some initial users for testing
def initialize_test_data():
    """Initialize test data for the energy trading system"""
    # Register sample users
    user1 = energy_trading.register_user("user1", "Solar Farm A", "solar")
    user2 = energy_trading.register_user("user2", "Wind Farm B", "wind")
    user3 = energy_trading.register_user("user3", "Home Consumer C", "consumer")
    
    # Create sample transactions
    energy_trading.create_energy_transaction(
        user1['address'], user3['address'], 10.5, 0.12
    )
    
    energy_trading.create_energy_transaction(
        user2['address'], user3['address'], 8.3, 0.10
    )
    
    # Process transactions
    energy_trading.process_transactions()
    
    return {
        'users': [user1, user2, user3],
        'market_stats': energy_trading.get_market_stats()
    }