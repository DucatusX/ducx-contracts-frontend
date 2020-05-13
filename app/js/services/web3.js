angular.module('Services').service('web3Service', function($q, $rootScope, APP_CONSTANTS, $timeout, requestService, API) {

    if (!window.Web3) return;
    var web3 = new Web3(), _this = this;

    /* Определение провайдеров клиентов */
    var web3Providers = {};
    var createWeb3Providers = function() {
        try {
            var metaMaskProvider = Web3.givenProvider;
            if (metaMaskProvider.publicConfigStore) {
                web3Providers['metamask'] = metaMaskProvider;
            }
        } catch(err) {
            console.log('Metamask not found');
        }

        try {
            web3Providers['infura'] = new Web3.providers.HttpProvider(APP_CONSTANTS.INFURA_ADDRESS);
        } catch(err) {
            console.log('Infura not found');
        }
    };

    createWeb3Providers();
    /* Определение провайдеров клиентов */


    this.getMethodInterface = function(methodName, abi) {
        return abi.filter(function(m) {
            return m.name === methodName;
        })[0];
    };

    this.createContractFromAbi = function(contractAddress, abi) {
        var contract = new web3.eth.Contract(abi);
        contract.options.address = Web3.utils.toChecksumAddress(contractAddress);
        return contract;
    };

    var currentProvider;


    var isProduction = location.protocol === "https:";


    this.isProduction = function() {
        return isProduction;
    };


    this.setProviderByNumber = function(networkId) {
        networkId = networkId * 1;
        switch (networkId) {
            case 26483:
                web3.setProvider(new Web3.providers.HttpProvider(isProduction ? APP_CONSTANTS.INFURA_ADDRESS : APP_CONSTANTS.ROPSTEN_INFURA_ADDRESS));
                break;
            case 26482:
                web3.setProvider(new Web3.providers.HttpProvider(APP_CONSTANTS.ROPSTEN_INFURA_ADDRESS));
                break;
        }
    };


    this.setProvider = function(providerName, network) {

        switch (network) {
            case 26483:
                network = isProduction ? network : 26482;
                break;
            case 1:
                network = isProduction ? network : 3;
                break;
        }

        switch (providerName) {
            case 'metamask':
                var networkVersion = window['ethereum'].networkVersion;
                if (networkVersion == network) {
                    currentProvider = web3Providers[providerName];
                    web3.setProvider(currentProvider);
                }
                break;
            default:
                switch (network) {
                    case 26483:
                        web3.setProvider(new Web3.providers.HttpProvider(APP_CONSTANTS.INFURA_ADDRESS));
                        break;
                    case 26482:
                        web3.setProvider(new Web3.providers.HttpProvider(APP_CONSTANTS.ROPSTEN_INFURA_ADDRESS));
                        break;
                }
        }
    };

    var checkMetamaskNetwork = function(network) {
        var networkVersion = parseInt(window['ethereum'].networkVersion, 10);
        return networkVersion === network;
    };

    this.getAccounts = function(network) {
        switch (network) {
            case 26483:
                network = isProduction ? network : 26482;
                break;
            case 1:
                network = isProduction ? network : 3;
                break;
        }

        return new Promise(function(resolve) {
            if (window['ethereum'] && window['ethereum'].isMetaMask) {
                if (!checkMetamaskNetwork(network)) {
                    resolve([]);
                    return;
                }
                return window['ethereum'].enable().then(resolve);
            }
        });


    };

    this.getBalance = function(address) {
        var defer = $q.defer();
        web3.eth.getBalance(Web3.utils.toChecksumAddress(address)).then(defer.resolve, defer.resolve);
        return defer.promise;
    };

    this.web3 = function() {
        return web3;
    };

    this.callMethod = function(contract, method) {
        var defer = $q.defer();

        contract.methods[method] ? contract.methods[method]().call(function(error, result) {
            if (!error) {
                defer.resolve(result);
            } else {
                defer.reject(error);
            }
        }) : $timeout(function() {
            defer.reject('Method not defined');
        });
        return defer.promise;
    };

    var _this = this;



    this.getEthTokensForAddress = function(address, network) {
        var params = {
            path: API.GET_ETH_TOKENS_FOR_ADDRESS,
            query: {
                address: address,
                network: ((network === 1) && isProduction) ? 'mainnet' : 'testnet'
            }
        };
        return requestService.get(params);

    };

    this.getTokenInfo = function(network, token, wallet, customFields) {
        var defer = $q.defer();
        var tokenInfoFields = customFields || ['decimals', 'symbol', 'balanceOf'];
        var requestsCount = 0;
        var tokenInfo = {};

        this.setProviderByNumber(network);
        var web3Contract = this.createContractFromAbi(token, window.abi);

        var getTokenParamCallback = function(result, method) {
            requestsCount--;
            tokenInfo[method] = result;
            if (!requestsCount) {
                if (wallet && tokenInfo['balanceOf']) {
                    var decimalsValue = tokenInfo.decimals ? Math.pow(10, tokenInfo.decimals) : 1;
                    tokenInfo.balance = new BigNumber(tokenInfo.balanceOf).div(decimalsValue).round(2).toString(10);
                }
                defer.resolve(tokenInfo);
            }
        };

        tokenInfoFields.map(function(method) {
            switch (method) {
                case 'balanceOf':
                    if (wallet) {
                        requestsCount++;
                        _this.setProviderByNumber(network);
                        web3Contract.methods[method](wallet).call(function(err, result) {
                            getTokenParamCallback(result, method);
                        });
                    }
                    break;
                default:
                    requestsCount++;
                    _this.setProviderByNumber(network);
                    web3Contract.methods[method]().call(function(err, result) {
                        getTokenParamCallback(result, method);
                    });
            }
        });

        return defer.promise;
    };
});
