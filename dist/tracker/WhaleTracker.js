"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhaleTracker = void 0;
const ethers_1 = require("ethers");
const config_1 = require("../config");
const PriceService_1 = require("./PriceService");
class WhaleTracker {
    provider;
    strategy;
    priceService;
    dashboardServer;
    constructor(strategy, dashboardServer) {
        this.provider = new ethers_1.ethers.JsonRpcProvider(config_1.config.rpcUrl);
        this.strategy = strategy;
        this.priceService = new PriceService_1.PriceService();
        this.dashboardServer = dashboardServer;
    }
    async start() {
        console.log(`Starting Autonomous Whale Discovery...`);
        console.log(`Scanning for transactions >= $${config_1.config.whaleUsdThreshold}`);
        // Listen to pending transactions (mempool)
        if (config_1.config.rpcUrl.startsWith('wss')) {
            const wsProvider = new ethers_1.ethers.WebSocketProvider(config_1.config.rpcUrl);
            wsProvider.on('pending', async (txHash) => {
                this.processTransaction(txHash, wsProvider);
            });
        }
        else {
            console.warn("Using HTTP Provider. Mempool tracking is limited. Polling blocks instead.");
            this.provider.on('block', async (blockNumber) => {
                await this.processBlock(blockNumber);
            });
        }
    }
    async processBlock(blockNumber) {
        try {
            const block = await this.provider.getBlock(blockNumber, true);
            if (!block || !block.prefetchedTransactions)
                return;
            const ethPrice = await this.priceService.getEthPriceUsd();
            if (ethPrice === 0)
                return; // Cannot calculate without price
            for (const tx of block.prefetchedTransactions) {
                if (tx.value && tx.value > 0n && tx.from) {
                    const ethValue = parseFloat(ethers_1.ethers.formatEther(tx.value));
                    const usdValue = ethValue * ethPrice;
                    if (usdValue >= config_1.config.whaleUsdThreshold) {
                        console.log(`\n🚨 [WHALE DISCOVERED] Block: ${blockNumber} 🚨`);
                        console.log(`Whale Wallet: ${tx.from}`);
                        console.log(`Tx Hash: ${tx.hash}`);
                        console.log(`Value: ${ethValue.toFixed(2)} ETH (~$${usdValue.toFixed(2)})`);
                        this.dashboardServer.broadcastWhale({
                            type: 'block',
                            wallet: tx.from,
                            hash: tx.hash,
                            ethValue: ethValue.toFixed(2),
                            usdValue: usdValue.toFixed(2),
                            timestamp: Date.now()
                        });
                        if (tx.to) {
                            await this.strategy.evaluateTrade(tx.from, tx.hash, tx.to, tx.value);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error(`Error processing block ${blockNumber}:`, error);
        }
    }
    async processTransaction(txHash, provider) {
        try {
            const tx = await provider.getTransaction(txHash);
            if (tx && tx.value && tx.value > 0n && tx.from) {
                const ethPrice = await this.priceService.getEthPriceUsd();
                if (ethPrice === 0)
                    return;
                const ethValue = parseFloat(ethers_1.ethers.formatEther(tx.value));
                const usdValue = ethValue * ethPrice;
                if (usdValue >= config_1.config.whaleUsdThreshold) {
                    console.log(`\n🚨 [WHALE DISCOVERED IN MEMPOOL] 🚨`);
                    console.log(`Whale Wallet: ${tx.from}`);
                    console.log(`Tx Hash: ${tx.hash}`);
                    console.log(`Value: ${ethValue.toFixed(2)} ETH (~$${usdValue.toFixed(2)})`);
                    this.dashboardServer.broadcastWhale({
                        type: 'mempool',
                        wallet: tx.from,
                        hash: tx.hash,
                        ethValue: ethValue.toFixed(2),
                        usdValue: usdValue.toFixed(2),
                        timestamp: Date.now()
                    });
                    if (tx.to) {
                        await this.strategy.evaluateTrade(tx.from, tx.hash, tx.to, tx.value);
                    }
                }
            }
        }
        catch (error) {
            // Ignore missing transactions in mempool
        }
    }
}
exports.WhaleTracker = WhaleTracker;
