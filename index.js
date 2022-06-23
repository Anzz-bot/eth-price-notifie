const express = require('express');
const notifier = require('node-notifier');
const app = express();
require('dotenv').config();

const monit = async() => {

    // Imports
    const perf = require('execution-time')()
    const { providers } = require('ethers')
    const Uniswap = require('./src/exchanges/uniswap')

    // Instances
    const provider = new providers.InfuraProvider('homestead', {
        projectId: process.env.INFURA_PROJECT_ID,
        projectSecret: process.env.INFURA_PROJECT_SECRET,
    })
    const uniswap = new Uniswap(provider)

    // Functions
    const logPrice = (message, price) => console.log(message, price.toSignificant(10))

    // Get prices
    perf.start()

    const wethDai = uniswap.getPrice({
        from: 'weth',
        to: 'dai',
    })
    const wbtcDai = uniswap.getPrice({
        from: 'wbtc',
        to: 'dai',
    })
    const btcEthTrade = uniswap.getTrade({
        from: 'wbtc',
        to: 'weth',
        amount: 1,
    })
    await Promise.all([
        wethDai,
        wbtcDai,
        btcEthTrade,
    ])

    const ethPrice = await wethDai;

    console.log(`Response delay: ${perf.stop().preciseWords}`)

    notifier.notify({
        'title': 'Current ETH Price',
        'ETH Price': 'ETH Price Notifier',
        'message': `Current ETH price is $${ethPrice.toSignificant(10)}`,
        'wait': true,
        'icon': './src/icon/ethereum.png',
    })
}

const main = () => {
    monit();
    setInterval(monit, 60000);
}

app.listen(5000, main);