"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeStrategy = void 0;
const config_1 = require("../config");
const DexTrader_1 = require("../execution/DexTrader");
class TradeStrategy {
    trader;
    constructor() {
        this.trader = new DexTrader_1.DexTrader();
    }
    async evaluateTrade(whaleAddress, txHash, toAddress, value) {
        console.log(`Evaluating trade for Tx: ${txHash}`);
        // Basic strategy logic:
        // 1. Check if the 'toAddress' is a known DEX Router.
        if (toAddress.toLowerCase() === config_1.config.dexRouterAddress.toLowerCase()) {
            console.log(`[STRATEGY] Whale ${whaleAddress} is interacting with the DEX.`);
            // 2. Here we would parse the transaction data to figure out which token is being bought.
            // For simplicity, we just log it and trigger a mock execution.
            console.log(`[STRATEGY] Triggering execution...`);
            // Example execution call: buy a token
            // await this.trader.executeTrade("0xTokenAddress", "buy");
        }
        else {
            console.log(`[STRATEGY] Ignoring. Not interacting with the main DEX.`);
        }
    }
}
exports.TradeStrategy = TradeStrategy;
