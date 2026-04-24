import axios from 'axios';

export class PriceService {
    private currentEthPrice: number = 0;
    private lastUpdate: number = 0;
    private CACHE_DURATION_MS = 60000; // 1 minute

    public async getEthPriceUsd(): Promise<number> {
        const now = Date.now();
        if (this.currentEthPrice > 0 && (now - this.lastUpdate < this.CACHE_DURATION_MS)) {
            return this.currentEthPrice;
        }

        try {
            // Using Binance public API for ETH price
            const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
            this.currentEthPrice = parseFloat(response.data.price);
            this.lastUpdate = now;
            console.log(`[PRICE UPDATE] Live ETH Price: $${this.currentEthPrice}`);
            return this.currentEthPrice;
        } catch (error) {
            console.error('Failed to fetch ETH price:', error);
            // Fallback to cached price or 0
            return this.currentEthPrice;
        }
    }
}
