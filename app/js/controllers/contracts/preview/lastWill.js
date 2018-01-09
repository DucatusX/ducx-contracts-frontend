angular.module('app').controller('lastWillPreviewController', function($timeout, $rootScope, contractService, openedContract, $scope, exRate, CONTRACT_STATUSES_CONSTANTS, $state) {
    $scope.contract = openedContract.data;
    $scope.statuses = CONTRACT_STATUSES_CONSTANTS;
    $scope.setContract($scope.contract);
    var contractDetails = $scope.contract.contract_details;

    $scope.wishCost = new BigNumber($scope.contract.cost).div(Math.pow(10, 18)).round(2).toString(10);

    $scope.stateValue = $scope.statuses[$scope.contract.state]['value'];
    $scope.stateTitle = $scope.statuses[$scope.contract.state]['title'];


    var durationList = [
        {
            value: 365,
            name: 'years'
        }, {
            value: 30,
            name: 'months'
        }, {
            value: 1,
            name: 'days'
        }
    ];
    var checkInterval = durationList.filter(function(check) {
        return !(contractDetails.check_interval % (check.value * 24 * 3600));
    })[0];

    contractDetails.check_interval = {
        period: contractDetails.check_interval / (checkInterval.value * 24 * 3600),
        periodUnit: checkInterval.name
    };

});