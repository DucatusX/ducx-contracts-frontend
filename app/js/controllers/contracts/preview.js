angular.module('app').controller('contractsPreviewController', function($scope, $rootScope, CONTRACT_STATUSES_CONSTANTS, FileSaver, web3Service) {
    $scope.statuses = CONTRACT_STATUSES_CONSTANTS;
    $scope.contract = false;

    $scope.selectedContract = false;
    $scope.showedTab = 'info';

    $scope.goTo = function(tab, contractType) {
        $scope.showedTab = tab;
        $scope.selectedContract = contractType;
    };
    $scope.saveAsFile = function(data, name) {
        data = new Blob([data], { type: 'text/plain;charset=utf-8' });
        FileSaver.saveAs(data, name + '.sol');
    };

    $scope.changePromoCode = function(contract) {
        contract.discountError = false;
        contract.cost = contract.original_cost;
    };
});
