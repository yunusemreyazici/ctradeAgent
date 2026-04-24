const axios = require('axios');
async function test() {
    try {
        const res = await axios.get('https://api.ethplorer.io/getAddressInfo/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?apiKey=freekey');
        console.log("Tokens count:", res.data.tokens ? res.data.tokens.length : 0);
        console.log("ETH Balance:", res.data.ETH.balance);
        if (res.data.tokens && res.data.tokens.length > 0) {
            console.log("Sample token:", res.data.tokens[0].tokenInfo.symbol, "Price:", res.data.tokens[0].tokenInfo.price.rate);
        }
    } catch(e) {
        console.error(e.message);
    }
}
test();
