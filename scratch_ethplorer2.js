const axios = require('axios');
async function test() {
    try {
        const res = await axios.get('https://api.ethplorer.io/getAddressInfo/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?apiKey=freekey');
        if (res.data.tokens) {
            const tokenWithPrice = res.data.tokens.find(t => t.tokenInfo && t.tokenInfo.price && t.tokenInfo.price.rate);
            if (tokenWithPrice) {
                console.log("Token:", tokenWithPrice.tokenInfo.symbol, "Balance:", tokenWithPrice.balance, "Price:", tokenWithPrice.tokenInfo.price.rate);
            } else {
                console.log("No token with price found.");
            }
        }
    } catch(e) {
        console.error(e.message);
    }
}
test();
