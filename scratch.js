const { ethers } = require('ethers');
async function test() {
    const provider = new ethers.JsonRpcProvider('https://ethereum-rpc.publicnode.com');
    const blockNum = await provider.getBlockNumber();
    console.log("Current block:", blockNum);
    const block = await provider.getBlock(blockNum, true);
    console.log("Has prefetched transactions?", !!block.prefetchedTransactions);
    if (block.prefetchedTransactions) {
        console.log("Tx count:", block.prefetchedTransactions.length);
        if (block.prefetchedTransactions.length > 0) {
            console.log("Sample tx value:", block.prefetchedTransactions[0].value.toString());
        }
    }
}
test().catch(console.error);
