"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WhaleTracker_1 = require("./tracker/WhaleTracker");
const TradeStrategy_1 = require("./strategy/TradeStrategy");
const config_1 = require("./config");
async function main() {
    console.log("===================================");
    console.log("   Whale Trading Agent Started     ");
    console.log("===================================");
    console.log(`RPC: ${config_1.config.rpcUrl}`);
    console.log(`Whale Threshold: $${config_1.config.whaleUsdThreshold}`);
    const strategy = new TradeStrategy_1.TradeStrategy();
    const tracker = new WhaleTracker_1.WhaleTracker(strategy);
    // Start tracking
    await tracker.start();
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
