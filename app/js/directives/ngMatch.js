angular.module('Directives').directive('ngMatch', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            ngMatch: "="
        },
        link: function(scope, elem, attrs, ctrl) {
            if (!ctrl) return;
            if (!attrs['ngMatch']) return;

            var validator = function (value) {
                var v = value === scope.ngMatch;
                ctrl.$setValidity('pattern', v);
                return value;
            };

            ctrl.$parsers.unshift(validator);
            ctrl.$formatters.push(validator);

            scope.$watch('ngMatch', function() {
                validator(ctrl.$viewValue);
            });

        }
    }
}]);
