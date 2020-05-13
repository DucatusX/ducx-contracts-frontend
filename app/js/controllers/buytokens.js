angular.module('app').controller('buytokensController', function($scope, $timeout, $rootScope, $state, exRate) {

    $scope.exRate = exRate.data;

    $scope.copied = {};

    var resetForm = function() {
        $scope.formData = {};
        $scope.amountsValues = {};
    };

    resetForm();

    $scope.visibleForm = 'usdc';

    $scope.$watch('visibleForm', function() {
        resetForm();
    });

    $scope.payDone = function() {
        $state.go($rootScope.currentUser.contracts ? 'main.contracts.list' : 'main.createcontract.types');
    };

    $scope.convertAmountTo = function(toField) {
        var rate = $scope.exRate[toField] || 2;
        var currencyValue = new BigNumber($scope.amountsValues.USDC || 0);
        $scope.amountsValues[toField]  = currencyValue.times(rate).round(2).toString(10);
    };

    $scope.convertAmountFrom = function(fromField) {
        var rate = $scope.exRate[fromField] || 2;
        var currencyValue = new BigNumber($scope.amountsValues[fromField] || 0);
        $scope.amountsValues.USDC  = currencyValue.div(rate).round(2).toString(10);
    };

    $scope.paymentSelect = {
        methods: [
            {
                'label': 'USDC',
                'value': 'usdc',
                'select-icon': '/static/images/blockchain/usdc.svg'
            }, {
                'label': 'DucatusX',
                'value': 'ducx',
                'select-icon': '/static/images/blockchain/duc.svg'
            }
        ]
    };

}).controller('buyWishByDucXController', function($scope, web3Service) {

    $scope.wallets = {metamask: []};
    web3Service.setProvider(name, 26482);
    web3Service.getAccounts(26482).then(function(response) {
        $scope.wallets['metamask'] = response;
        $scope.$apply();
    });

    $scope.sendTransaction = function() {
        console.log($scope.formData.address, $scope.amountsValues['DUCX']);
        web3Service.web3().eth.sendTransaction({
            value: new BigNumber($scope.amountsValues['DUCX']).times(Math.pow(10, 18)).toString(10),
            from: $scope.formData.address,
            to: $scope.currentUser.ducx_address
        }, function() {
            console.log(arguments);
        });
    };


}).controller('buyWishByUSDCController', function($scope, $state, $rootScope, APP_CONSTANTS, web3Service) {

    $scope.wallets = {metamask: []};
    $scope.usdcAddress = APP_CONSTANTS.TOKENS_ADDRESSES.USDC;

    web3Service.setProvider('metamask', 1);
    web3Service.getAccounts(1).then(function(response) {
        console.log(response);
        response.map(function(wallet) {
            $scope.wallets['metamask'].push(wallet);
        });
        $scope.$apply();
    });

    $scope.$watch('amountsValues.USDC', function() {
        if (!$scope.amountsValues.USDC) return;

        $scope.checkedTransferData = (new Web3).eth.abi.encodeFunctionCall({
            name: 'transfer',
            type: 'function',
            inputs: [{
                type: 'address',
                name: 'to'
            }, {
                type: 'uint256',
                name: 'value'
            }]
        }, [
            $scope.currentUser.internal_address,
            new BigNumber($scope.amountsValues.USDC).times(Math.pow(10, 6)).toString(10)
        ]);
    });

    $scope.sendTransaction = function() {
        web3Service.web3().eth.sendTransaction({
            from: $scope.formData.address,
            to: APP_CONSTANTS.TOKENS_ADDRESSES.USDC,
            data: $scope.checkedTransferData
        }).then(console.log);
    };

});

