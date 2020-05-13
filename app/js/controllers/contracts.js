angular.module('app').controller('contractsController', function(CONTRACT_STATUSES_CONSTANTS, $rootScope, ENV_VARS,
                                                                 contractsList, $scope, $state, contractService, APP_CONSTANTS) {

    $scope.statuses = CONTRACT_STATUSES_CONSTANTS;
    $scope.stateData  = $state.current.data;

    var contractsData = contractsList.data;
    $scope.contractsList = contractsData ? contractsData.results : [];


    $scope.testAddresses = APP_CONSTANTS.TEST_ADDRESSES;


    $scope.goToContract = function(contract, $event) {
        var target = angular.element($event.target);
        if (!(target.is('[click-ignore]') || target.parents('[click-ignore]').length) &&  (target.is('.btn') || target.parents('.btn').length)) return;
        var contractId = contract.id;
        if ((contract.contract_type === 5) && (contract.state === 'UNDER_CROWDSALE')) {
            contractId = contract.contract_details.crowdsale || contractId;
        }
        $state.go('main.contracts.preview.byId', {id: contractId});
    };

    var updateList = function() {
        $rootScope.commonOpenedPopupParams = false;
        $rootScope.commonOpenedPopup = false;
        $state.transitionTo($state.current, {}, {
            reload: true,
            inherit: false,
            notify: true
        });
    };

    $scope.$on('$userUpdated', updateList);

    $scope.deleteContract = function(contract) {
        $scope.$parent.deleteContract(contract, function() {
            $scope.contractsList = $scope.contractsList.filter(function(contractItem) {
                return contract !== contractItem;
            });
        });
    };

    $scope.unConfirmContract = function(contract) {
        $scope.$parent.unConfirmContract(contract, function() {
            $scope.contractsList = $scope.contractsList.filter(function(contractItem) {
                return contract !== contractItem;
            });
        });
    };

    var contractsUpdateProgress = false;
    var getContracts = function() {
        if (contractsUpdateProgress) return;
        if (contractsData.count === $scope.contractsList.length) return;
        contractsUpdateProgress = true;
        contractService.getContractsList({
            limit: 8,
            offset: $scope.contractsList.length
        }).then(function(response) {
            contractsData = response.data;
            $scope.contractsList = $scope.contractsList.concat(response.data.results);
            contractsUpdateProgress = false;
        });
    };

    $scope.contractsListParams = {
        updater: getContracts,
        offset: 100
    };

}).controller('baseContractsController', function($scope, $state, $timeout, contractService, $cookies,
                                                  web3Service, WebSocketService, CONTRACT_TYPES_FOR_CREATE,
                                                  $rootScope, $interval, CONTRACT_STATUSES_CONSTANTS) {

    $scope.contractTypesIcons = {};

    for (var i in CONTRACT_TYPES_FOR_CREATE) {
        CONTRACT_TYPES_FOR_CREATE[i]['list'].map(function(contractType) {
            $scope.contractTypesIcons[contractType['typeNumber']] = contractType['icon'];
        });
    }

    var deletingProgress;
    $scope.refreshInProgress = {};
    $scope.timeoutsForProgress = {};
    $scope.statuses = CONTRACT_STATUSES_CONSTANTS;

    /* (Click) Deleting contract */
    $scope.deleteContract = function(contract, callback) {
        if (deletingProgress) return;
        deletingProgress = true;
        contractService.deleteContract(contract.id).then(function() {
            deletingProgress = false;
            callback ? callback() : $state.go('main.contracts.list');
        }, function() {
            deletingProgress = false;
            callback ? callback() : false;
        });
    };


    /* (Click) Deleting contract */
    $scope.unConfirmContract = function(contract, callback) {
        if (deletingProgress) return;
        deletingProgress = true;
        contractService.unConfirmContract(contract.id).then(function() {
            deletingProgress = false;
            callback ? callback() : $state.go('main.contracts.list');
        }, function() {
            deletingProgress = false;
            callback ? callback() : false;
        });
    };


    var setContractStatValues = function(contract) {
        contract.stateValue = $scope.statuses[contract.state]['value'];
        contract.stateTitle = $scope.statuses[contract.state]['title'];
    };

    var iniSocketHandler = function(contract) {
        var updateContract = function(newContractData) {
            angular.merge(contract, newContractData);
            WebSocketService.offUpdateContract(contract.id, updateContract);
            $scope.iniContract(contract, true);
            $scope.$apply();
        };
        WebSocketService.onUpdateContract(contract.id, updateContract);
        $scope.$on('$destroy', function() {
            WebSocketService.offUpdateContract(contract.id, updateContract);
        });
    };

    var iniDUCContract = function(contract) {
        $scope.isAuthor = contract.user === $rootScope.currentUser.id;
        switch (contract.contract_type) {
            case 4:
                if (contract.contract_details.duc_contract) {
                    contract.currency = 'USDC';
                    $scope.networkName = contract.currency;
                    if (contract.contract_details.duc_contract.address) {
                        web3Service.setProviderByNumber(contract.network);
                        web3Service.getBalance(contract.contract_details.duc_contract.address).then(function(result) {
                            contract.balance = Web3.utils.fromWei(result, 'ether');
                        });
                    }
                }
            break;
        }
    };

    $scope.iniContract = function(contract, fullScan, noWS) {
        contract.original_cost = contract.cost;
        if (!noWS) {
            iniSocketHandler(contract);
        }
        contract.original_cost = contract.cost;
        switch (contract.network) {
            case 26483:
            case 26482:
                iniDUCContract(contract, fullScan);
                setContractStatValues(contract);
                break;
        }
    };

    /* (Click) Contract refresh */
    $scope.refreshContract = function(contract) {
        var contractId = contract.id;
        if ($scope.timeoutsForProgress[contractId]) return;
        $scope.refreshInProgress[contractId] = true;
        $scope.timeoutsForProgress[contractId] = $interval(function() {
            if (!$scope.refreshInProgress[contractId]) {
                $interval.cancel($scope.timeoutsForProgress[contractId]);
                $scope.timeoutsForProgress[contractId] = false;
            }
        }, 1000);
        contractService.getContract(contractId).then(function(response) {
            angular.merge(contract, response.data);
            $scope.iniContract(contract, true);
            $scope.refreshInProgress[contractId] = false;
        }, function() {
            $scope.refreshInProgress[contractId] = false;
        });
    };

    // var contractsTypesForLayer = {
    //     4: 'crowdsale',
    //     5: 'token'
    // };

    var launchContract = function(contract) {
        if (contract.launchProgress) return;
        contract.launchProgress = true;

        $rootScope.closeCommonPopup();

        contractService.deployContract(contract.id, contract.promo).then(function() {
            contract.launchProgress = false;
            // var testNetwork = [2].indexOf(contract.network) > -1;
            // var contractType = contractsTypesForLayer[contract.contract_type] || 'unknown';
            // if (window['dataLayer']) {
            //     window['dataLayer'].push({'event': contractType + '_contract_launch_success' + (testNetwork ? '_test' : '')});
            // }
            if ($state.current.name === 'main.contracts.list') {
                $scope.refreshContract(contract);
            } else {
                $state.go('main.contracts.list');
            }
        }, function(data) {
            $rootScope.closeCommonPopup();
            contract.launchProgress = false;
            switch(data.status) {
                case 400:
                    switch(data.data.result) {
                        case 1:
                        case '1':
                            $rootScope.commonOpenedPopupParams = {
                                newPopupContent: true
                            };
                            $rootScope.commonOpenedPopup = 'errors/contract_date_incorrect';
                            break;
                        case 2:
                        case '2':
                            $rootScope.commonOpenedPopupParams = {
                                newPopupContent: true
                            };
                            $rootScope.commonOpenedPopup = 'errors/contract_freeze_date_incorrect';
                            break;
                        case 3:
                        case '3':
                            $rootScope.commonOpenedPopupParams = {
                                noBackgroundCloser: true,
                                newPopupContent: true
                            };
                            $rootScope.commonOpenedPopup = 'errors/less-balance';

                            break;
                    }
                    break;
            }
        });
    };

    /* (Click) Launch contract */
    $scope.payContract = function(contract) {
        if ($rootScope.currentUser.is_ghost) {
            $rootScope.commonOpenedPopup = 'alerts/ghost-user-alarm';
            $rootScope.commonOpenedPopupParams = {
                newPopupContent: true
            };
            return;
        }


        var openConditionsPopUp = function() {
            $rootScope.commonOpenedPopupParams = {
                contract: contract,
                class: 'conditions',
                newPopupContent: true,
                actions: {
                    showPriceLaunchContract: function(contract) {
                        if ($rootScope.currentUser.is_ducx_admin) {
                            launchContract(contract);
                        } else {
                            showPriceLaunchContract(contract);
                        }
                    }
                }
            };
            $rootScope.commonOpenedPopup = 'disclaimers/conditions';
        };

        var promoIsEntered = $scope.getDiscount(contract);
        if (promoIsEntered) {
            promoIsEntered.then(openConditionsPopUp, openConditionsPopUp);
        } else {
            openConditionsPopUp();
        }
    };

    var showPriceLaunchContract = function(contract) {

        if (contract.cost.USDC == 0) {
            launchContract(contract);
            return;
        }

        var price = new BigNumber(contract.cost.USDC).div(Math.pow(10, 6));
        var currency = 'USDC';

        $rootScope.commonOpenedPopup = 'confirmations/contract-confirm-pay';

        $rootScope.commonOpenedPopupParams = {
            newPopupContent: true,
            currency: currency,
            class: 'deleting-contract',
            contract: contract,
            confirmPayment: launchContract,
            contractCost: price.toString(10)
        };
    };

    $scope.getDiscount = function(contract, noPopUp) {

        if (!contract.promo) return;
        contract.checkPromoProgress = true;


        return contractService.getDiscount({
            contract_type: contract.contract_type,
            contract_id: contract.id,
            promo: contract.promo
        }).then(function(response) {
            contract.cost = response.data.discount_price;

            var price = new BigNumber(contract.cost.USDC).div(Math.pow(10, 6));
            var currency = 'USDC';

            $rootScope.commonOpenedPopupParams = {
                currency: currency,
                price: price,
                contract: contract,
                newPopupContent: true
            };
            if (!noPopUp) {
                $rootScope.commonOpenedPopup = 'alerts/promo-code-activated';
            }
            contract.checkPromoProgress = false;
        }, function(response) {
            switch (response.status) {
                case 403:
                    contract.discountError = response.data.detail;
                    break;
            }
            contract.checkPromoProgress = false;
        });
    };
});
