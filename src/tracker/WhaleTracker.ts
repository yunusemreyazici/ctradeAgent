import { ethers } from 'ethers';
import { config } from '../config';
import { TradeStrategy } from '../strategy/TradeStrategy';
import { PriceService } from './PriceService';

export class WhaleTracker {
    private provider: ethers.Provider;
    private strategy: TradeStrategy;
    private priceService: PriceService;

    constructor(strategy: TradeStrategy) {
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.strategy = strategy;
        this.priceService = new PriceService();
    }

    public async start() {
        console.log(`Starting Autonomous Whale Discovery...`);
        console.log(`Scanning for transactions >= $${config.whaleUsdThreshold}`);
        
        // Listen to pending transactions (mempool)
        if (config.rpcUrl.startsWith('wss')) {
            const wsProvider = new ethers.WebSocketProvider(config.rpcUrl);
            wsProvider.on('pending', async (txHash) => {
                this.processTransaction(txHash, wsProvider);
            });
        } else {
            console.warn("Using HTTP Provider. Mempool tracking is limited. Polling blocks instead.");
            this.provider.on('block', async (blockNumber) => {
                await this.processBlock(blockNumber);
            });
        }
    }

    private async processBlock(blockNumber: number) {
        try {
            const block = await this.provider.getBlock(blockNumber, true);
            if (!block || !block.prefetchedTransactions) return;

            const ethPrice = await this.priceService.getEthPriceUsd();
            if (ethPrice === 0) return; // Cannot calculate without price

            for (const tx of block.prefetchedTransactions) {
                if (tx.value && tx.value > 0n && tx.from) {
                    const ethValue = parseFloat(ethers.formatEther(tx.value));
                    const usdValue = ethValue * ethPrice;

                    if (usdValue >= config.whaleUsdThreshold) {
                        console.log(`\n🚨 [WHALE DISCOVERED] Block: ${blockNumber} 🚨`);
                        console.log(`Whale Wallet: ${tx.from}`);
                        console.log(`Tx Hash: ${tx.hash}`);
                        console.log(`Value: ${ethValue.toFixed(2)} ETH (~$${usdValue.toFixed(2)})`);
                        
                        if (tx.to) {
                            await this.strategy.evaluateTrade(tx.from, tx.hash, tx.to, tx.value);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing block ${blockNumber}:`, error);
        }
    }

    private async processTransaction(txHash: string, provider: ethers.WebSocketProvider) {
        try {
            const tx = await provider.getTransaction(txHash);
            if (tx && tx.value && tx.value > 0n && tx.from) {
                const ethPrice = await this.priceService.getEthPriceUsd();
                if (ethPrice === 0) return;

                const ethValue = parseFloat(ethers.formatEther(tx.value));
                const usdValue = ethValue * ethPrice;

                if (usdValue >= config.whaleUsdThreshold) {
                    console.log(`\n🚨 [WHALE DISCOVERED IN MEMPOOL] 🚨`);
                    console.log(`Whale Wallet: ${tx.from}`);
                    console.log(`Tx Hash: ${tx.hash}`);
                    console.log(`Value: ${ethValue.toFixed(2)} ETH (~$${usdValue.toFixed(2)})`);
                    
                    if (tx.to) {
                        await this.strategy.evaluateTrade(tx.from, tx.hash, tx.to, tx.value);
                    }
                }
            }
        } catch (error) {
            // Ignore missing transactions in mempool
        }
    }
}
