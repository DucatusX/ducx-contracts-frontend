angular.module('Directives').directive('ngChecksumAddressValidator', function($filter, APP_CONSTANTS) {
    return {
        require: 'ngModel',
        scope: {},
        link: function(scope, elem, attrs, ctrl) {

            elem.attr('placeholder', elem.attr('placeholder') || APP_CONSTANTS.TEST_ADDRESSES.ETH);

            var validator = function(value) {
                if (!value) return;
                var val = $filter('toCheckSum')(value);
                var validAddress = WAValidator.validate(val, 'ETH');
                ctrl.$setValidity('valid-address', validAddress);
                return validAddress ? value : false;
            };

            ctrl.$parsers.unshift(validator);
            ctrl.$formatters.unshift(validator);

        }
    }
});
