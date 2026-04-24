"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceService = void 0;
const axios_1 = __importDefault(require("axios"));
class PriceService {
    currentEthPrice = 0;
    lastUpdate = 0;
    CACHE_DURATION_MS = 60000; // 1 minute
    async getEthPriceUsd() {
        const now = Date.now();
        if (this.currentEthPrice > 0 && (now - this.lastUpdate < this.CACHE_DURATION_MS)) {
            return this.currentEthPrice;
        }
        try {
            // Using Binance public API for ETH price
            const response = await axios_1.default.get('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
            this.currentEthPrice = parseFloat(response.data.price);
            this.lastUpdate = now;
            console.log(`[PRICE UPDATE] Live ETH Price: $${this.currentEthPrice}`);
            return this.currentEthPrice;
        }
        catch (error) {
            console.error('Failed to fetch ETH price:', error);
            // Fallback to cached price or 0
            return this.currentEthPrice;
        }
    }
}
exports.PriceService = PriceService;
