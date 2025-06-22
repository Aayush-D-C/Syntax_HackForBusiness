const crypto = require('crypto');

class Product {
    constructor(name, price, category, barcode = null) {
        this.barcode = barcode || Math.random().toString().slice(2, 14);
        this.name = name;
        this.price = price;
        this.category = category;
    }
}

class SaleTransaction {
    constructor(storeId, products) {
        this.storeId = storeId;
        this.products = products;
        this.total = products.reduce((sum, p) => sum + p.price, 0);
        this.timestamp = Date.now();
        this.txid = crypto.createHash('sha256')
            .update(`${storeId}${this.total}${this.timestamp}`)
            .digest('hex')
            .substring(0, 16);
    }
}

class Block {
    constructor(index, transaction, previousHash) {
        this.index = index;
        this.transaction = transaction;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.timestamp = Date.now();
        this.hash = this.calculateHash();
    }
    
    calculateHash() {
        const blockString = JSON.stringify({
            index: this.index,
            transaction: this.transaction,
            previousHash: this.previousHash,
            nonce: this.nonce,
            timestamp: this.timestamp
        });
        return crypto.createHash('sha256').update(blockString).digest('hex');
    }
    
    mineBlock(difficulty) {
        const target = '0'.repeat(difficulty);
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

class SalesBlockchain {
    constructor(difficulty = 2) {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
    }
    
    createGenesisBlock() {
        const genesisTx = new SaleTransaction('System', []);
        return new Block(0, genesisTx, '0');
    }
    
    addSale(storeId, products) {
        const sale = new SaleTransaction(storeId, products);
        const newBlock = new Block(this.chain.length, sale, this.chain[this.chain.length - 1].hash);
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        return newBlock;
    }
    
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const current = this.chain[i];
            const previous = this.chain[i - 1];
            
            if (current.hash !== current.calculateHash()) {
                return false;
            }
            
            if (current.previousHash !== previous.hash) {
                return false;
            }
        }
        return true;
    }
    
    getSalesSummary(storeId = null) {
        const summary = {
            totalSales: 0,
            totalRevenue: 0,
            transactions: 0,
            storeSales: {}
        };
        
        for (let i = 1; i < this.chain.length; i++) {
            const tx = this.chain[i].transaction;
            
            if (storeId && tx.storeId !== storeId) {
                continue;
            }
            
            summary.totalSales += tx.products.length;
            summary.totalRevenue += tx.total;
            summary.transactions += 1;
            
            if (!summary.storeSales[tx.storeId]) {
                summary.storeSales[tx.storeId] = {
                    salesCount: 0,
                    revenue: 0
                };
            }
            summary.storeSales[tx.storeId].salesCount += tx.products.length;
            summary.storeSales[tx.storeId].revenue += tx.total;
        }
        
        return summary;
    }
    
    getBlockchainData() {
        return {
            chain: this.chain.map(block => ({
                index: block.index,
                hash: block.hash.substring(0, 8) + '...',
                previousHash: block.previousHash === '0' ? 'Genesis' : block.previousHash.substring(0, 8) + '...',
                nonce: block.nonce,
                timestamp: new Date(block.timestamp).toISOString(),
                transaction: {
                    txid: block.transaction.txid,
                    storeId: block.transaction.storeId,
                    total: block.transaction.total,
                    timestamp: new Date(block.transaction.timestamp).toISOString(),
                    products: block.transaction.products
                }
            })),
            isValid: this.isChainValid(),
            summary: this.getSalesSummary(),
            difficulty: this.difficulty,
            totalBlocks: this.chain.length
        };
    }
}

module.exports = { SalesBlockchain, Product, SaleTransaction }; 