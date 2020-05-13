var module = angular.module('Constants');
module.constant('APP_CONSTANTS', {
    'TEMPLATES': {
        'PATH': '/templates'
    },
    'TEST_ADDRESSES': {
        "DUCX": "0xD0593B233Be4411A236F22b42087345E1137170b"
    },
    'INFURA_ADDRESS': "http://212.24.108.89:8546",
    'ROPSTEN_INFURA_ADDRESS': 'http://89.40.14.180:8545',

    'ETHERSCAN_ADDRESS': 'https://etherscan.io/',
    'ROPSTEN_ETHERSCAN_ADDRESS': 'https://ropsten.etherscan.io/',
    'TOKENS_ADDRESSES': {
        'USDC': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    },
    'EMPTY_PROFILE': {
        "email":"",
        "username":"",
        "contracts":0,
        "is_ghost":true,
        "balance":"0",
        "usdt_balance":"0",
        "eos_balance":"0",
        "visibleBalance":"0",
        "internal_btc_address":null,
        "use_totp":false,
        "internal_address":null
    },

    // For production
    'SOCIAL_APP_ID': {
        'GOOGLE': '448526667030-rfiiqfee3f0eils8nha266n43kp1pbac.apps.googleusercontent.com',
        'FACEBOOK': '438113386623173'
    },

    'PROMO_CODES': {}
});

