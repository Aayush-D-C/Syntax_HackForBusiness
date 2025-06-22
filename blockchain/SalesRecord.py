import hashlib
import time
import json
from datetime import datetime
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
import matplotlib.cm as cm
import matplotlib.colors as mcolors
import random
import string

class Product:
    """Represents a product with barcode and details"""
    def _init_(self, name, price, category):
        self.barcode = self.generate_barcode()
        self.name = name
        self.price = price
        self.category = category
        
    def generate_barcode(self):
        """Generate a random 12-digit barcode"""
        return ''.join(random.choices(string.digits, k=12))
    
    def to_dict(self):
        return {
            'barcode': self.barcode,
            'name': self.name,
            'price': self.price,
            'category': self.category
        }

class SaleTransaction:
    """Represents a sales transaction from POS system"""
    def _init_(self, store_id, products):
        self.store_id = store_id
        self.products = products  # List of Product objects
        self.total = sum(p.price for p in products)
        self.timestamp = time.time()
        self.txid = hashlib.sha256(f"{store_id}{self.total}{time.time()}".encode()).hexdigest()[:16]
    
    def to_dict(self):
        return {
            'txid': self.txid,
            'store_id': self.store_id,
            'total': self.total,
            'timestamp': datetime.fromtimestamp(self.timestamp).strftime('%Y-%m-%d %H:%M:%S'),
            'products': [p.to_dict() for p in self.products]
        }

class Block:
    def _init_(self, index, transaction, previous_hash):
        self.index = index
        self.transaction = transaction  # SaleTransaction object
        self.previous_hash = previous_hash
        self.nonce = 0
        self.timestamp = time.time()
        self.hash = self.calculate_hash()
    
    def calculate_hash(self):
        block_data = {
            'index': self.index,
            'transaction': self.transaction.to_dict(),
            'previous_hash': self.previous_hash,
            'nonce': self.nonce,
            'timestamp': self.timestamp
        }
        block_string = json.dumps(block_data, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()
    
    def mine_block(self, difficulty):
        target = "0" * difficulty
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
    
    def get_short_hash(self, length=6):
        return f"{self.hash[:length]}...{self.hash[-length:]}"
    
    def get_short_prev_hash(self, length=6):
        return "Genesis" if self.previous_hash == "0" else f"{self.previous_hash[:length]}...{self.hash[-length:]}"
    
    def to_dict(self):
        return {
            'index': self.index,
            'hash': self.get_short_hash(),
            'previous_hash': self.get_short_prev_hash(),
            'nonce': self.nonce,
            'timestamp': datetime.fromtimestamp(self.timestamp).strftime('%Y-%m-%d %H:%M:%S'),
            'transaction': self.transaction.to_dict()
        }

class SalesBlockchain:
    """Blockchain for storing sales records"""
    def _init_(self, difficulty=2):
        self.chain = [self.create_genesis_block()]
        self.difficulty = difficulty
    
    def create_genesis_block(self):
        genesis_tx = SaleTransaction("System", [])
        return Block(0, genesis_tx, "0")
    
    def get_last_block(self):
        return self.chain[-1]
    
    def get_last_transaction_hash(self):
        return self.get_last_block().hash
    
    def add_sale(self, store_id, products):
        """Add a new sale to the blockchain"""
        # Create sales transaction
        sale = SaleTransaction(store_id, products)
        
        # Create new block
        new_block = Block(
            index=len(self.chain),
            transaction=sale,
            previous_hash=self.get_last_block().hash
        )
        
        # Mine the block
        new_block.mine_block(self.difficulty)
        
        # Add to chain
        self.chain.append(new_block)
        return new_block
    
    def is_chain_valid(self):
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i-1]
            
            # Verify current block's hash
            if current.hash != current.calculate_hash():
                return False
            
            # Verify chain linkage
            if current.previous_hash != previous.hash:
                return False
        return True
    
    def verify_sale(self, txid):
        """Verify if a sale exists and hasn't been tampered with"""
        for block in self.chain:
            if block.transaction.txid == txid:
                # Recalculate hash to verify integrity
                if block.hash == block.calculate_hash():
                    return True, block
                return False, block
        return False, None
    
    def get_sales_summary(self, store_id=None):
        """Get summary of all sales"""
        summary = {
            'total_sales': 0,
            'total_revenue': 0,
            'transactions': 0,
            'store_sales': {}
        }
        
        for block in self.chain[1:]:  # Skip genesis block
            tx = block.transaction
            
            # Filter by store if requested
            if store_id and tx.store_id != store_id:
                continue
                
            summary['total_sales'] += len(tx.products)
            summary['total_revenue'] += tx.total
            summary['transactions'] += 1
            
            # Track store-specific sales
            if tx.store_id not in summary['store_sales']:
                summary['store_sales'][tx.store_id] = {
                    'sales_count': 0,
                    'revenue': 0
                }
            summary['store_sales'][tx.store_id]['sales_count'] += len(tx.products)
            summary['store_sales'][tx.store_id]['revenue'] += tx.total
        
        return summary
    
    def visualize_blockchain(self):
        """Create a visual representation of the sales blockchain"""
        fig = plt.figure(figsize=(14, 10))
        ax = fig.add_subplot(111)
        ax.set_title("Sales Blockchain", fontsize=16, fontweight='bold')
        ax.set_axis_off()
        
        # Draw blocks
        block_width = 200
        block_height = 120
        x_spacing = 250
        y_position = 300
        
        for i, block in enumerate(self.chain):
            # Calculate position
            x_position = 100 + i * x_spacing
            
            # Block color based on store
            store_id = block.transaction.store_id
            color = self.get_store_color(store_id)
            
            # Draw block
            block_rect = plt.Rectangle((x_position, y_position), block_width, block_height, 
                                      facecolor=color, edgecolor='black', linewidth=2)
            ax.add_patch(block_rect)
            
            # Draw block text
            block_info = f"Block #{block.index}\n"
            block_info += f"Hash: {block.get_short_hash()}\n"
            block_info += f"Prev: {block.get_short_prev_hash()}\n"
            
            # Add transaction info for sales blocks
            if block.index > 0:
                tx = block.transaction
                block_info += f"Store: {tx.store_id}\n"
                block_info += f"Items: {len(tx.products)}\n"
                block_info += f"Total: ${tx.total:.2f}"
            
            plt.text(x_position + block_width/2, y_position + block_height/2, 
                    block_info, ha='center', va='center', fontsize=10)
            
            # Draw arrows between blocks
            if i > 0:
                plt.arrow(x_position - x_spacing + block_width, y_position + block_height/2, 
                         x_spacing - block_width, 0, 
                         head_width=15, head_length=20, fc='black', ec='black')
        
        # Add legend for store colors
        legend_elements = []
        for store_id, color in self.store_colors.items():
            legend_elements.append(plt.Rectangle((0, 0), 1, 1, facecolor=color, label=store_id))
        
        ax.legend(handles=legend_elements, loc='lower center', ncol=len(self.store_colors), 
                 bbox_to_anchor=(0.5, -0.1), fontsize=10)
        
        plt.xlim(50, 100 + len(self.chain) * x_spacing)
        plt.ylim(0, 400)
        plt.tight_layout()
        plt.show()
    
    def get_store_color(self, store_id):
        """Assign consistent color to each store"""
        if not hasattr(self, 'store_colors'):
            self.store_colors = {}
        
        if store_id not in self.store_colors:
            # Generate a random color for new stores
            color = "#" + ''.join(random.choices('0123456789ABCDEF', k=6))
            self.store_colors[store_id] = color
        
        return self.store_colors[store_id]
    
    def print_blockchain(self):
        """Print the blockchain to console"""
        print("\n" + "="*80)
        print("SALES BLOCKCHAIN LEDGER")
        print("="*80)
        
        for block in self.chain:
            print(f"\nBlock #{block.index} [Hash: {block.get_short_hash()}]")
            print(f"  Previous: {block.get_short_prev_hash()}")
            print(f"  Nonce: {block.nonce}")
            print(f"  Timestamp: {datetime.fromtimestamp(block.timestamp).strftime('%Y-%m-%d %H:%M:%S')}")
            
            if block.index > 0:
                tx = block.transaction
                print(f"  Store: {tx.store_id}")
                print(f"  Total: ${tx.total:.2f}")
                print(f"  Products:")
                for product in tx.products:
                    print(f"    - {product.name} (${product.price:.2f}) [Barcode: {product.barcode}]")
        
        # Print verification status
        print("\nBlockchain Valid:", self.is_chain_valid())
        
        # Print summary
        summary = self.get_sales_summary()
        print("\nSALES SUMMARY:")
        print(f"Total Transactions: {summary['transactions']}")
        print(f"Total Products Sold: {summary['total_sales']}")
        print(f"Total Revenue: ${summary['total_revenue']:.2f}")

# Sample product catalog
product_catalog = [
    Product("Milk", 2.99, "Dairy"),
    Product("Bread", 3.49, "Bakery"),
    Product("Eggs", 4.99, "Dairy"),
    Product("Apples", 1.99, "Produce"),
    Product("Chicken", 8.99, "Meat"),
    Product("Cereal", 5.49, "Breakfast"),
    Product("Soda", 1.49, "Beverages"),
    Product("Chips", 2.99, "Snacks")
]

# Create and simulate the blockchain
if _name_ == "_main_":
    # Create blockchain with low difficulty for demonstration
    sales_blockchain = SalesBlockchain(difficulty=2)
    
    # Simulate POS sales
    print("Simulating POS sales...")
    
    # Store 1 sales
    sales_blockchain.add_sale("Store-1", [product_catalog[0], product_catalog[1], product_catalog[2]])
    sales_blockchain.add_sale("Store-1", [product_catalog[3], product_catalog[4]])
    
    # Store 2 sales
    sales_blockchain.add_sale("Store-2", [product_catalog[5], product_catalog[6]])
    sales_blockchain.add_sale("Store-2", [product_catalog[7]])
    sales_blockchain.add_sale("Store-2", [product_catalog[0], product_catalog[7], product_catalog[3]])
    
    # Store 3 sales
    sales_blockchain.add_sale("Store-3", [product_catalog[4], product_catalog[5]])
    sales_blockchain.add_sale("Store-3", [product_catalog[1], product_catalog[2], product_catalog[3], product_catalog[6]])
    
    # Print blockchain to console
    sales_blockchain.print_blockchain()
    
    # Verify a specific sale
    tx_to_verify = sales_blockchain.chain[3].transaction.txid
    valid, block = sales_blockchain.verify_sale(tx_to_verify)
    print(f"\nVerifying transaction {tx_to_verify}:", "Valid" if valid else "Tampered")
    
    if valid:
        print("Transaction details:")
        tx = block.transaction
        print(f"  Store: {tx.store_id}")
        print(f"  Total: ${tx.total:.2f}")
        print(f"  Products:")
        for product in tx.products:
            print(f"    - {product.name} (${product.price:.2f})")
    
    # Visualize the blockchain
    print("\nGenerating blockchain visualization...")
    sales_blockchain.visualize_blockchain()