import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
    rpcUrl: process.env.RPC_URL || 'https://cloudflare-eth.com', // Default to public RPC for testing
    privateKey: process.env.PRIVATE_KEY || '',
    whaleUsdThreshold: parseFloat(process.env.WHALE_USD_THRESHOLD || '5000000'), // $5M default
    dexRouterAddress: process.env.DEX_ROUTER_ADDRESS || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
    slippageTolerance: parseFloat(process.env.SLIPPAGE_TOLERANCE || '0.5'), // 0.5% default
    maxTradeSizeUsd: parseFloat(process.env.MAX_TRADE_SIZE_USD || '100'),
};
