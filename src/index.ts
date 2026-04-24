import { WhaleTracker } from './tracker/WhaleTracker';
import { TradeStrategy } from './strategy/TradeStrategy';
import { config } from './config';

import { DashboardServer } from './server/DashboardServer';

async function main() {
    console.log("===================================");
    console.log("   Whale Trading Agent Started     ");
    console.log("===================================");
    console.log(`RPC: ${config.rpcUrl}`);
    console.log(`Whale Threshold: $${config.whaleUsdThreshold}`);

    const dashboard = new DashboardServer();
    dashboard.start();

    const strategy = new TradeStrategy();
    const tracker = new WhaleTracker(strategy, dashboard);

    // Start tracking
    
    await tracker.start();
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
