var module = angular.module('Constants');

module.constant('CONTRACT_TYPES_CONSTANTS', {
    'CROWD_SALE': 4,
    'TOKEN': 5
}).constant('CONTRACT_TYPES_NAMES_CONSTANTS', {
    4: 'crowdSale',
    5: 'token'
}).service('CONTRACT_TYPES_FOR_CREATE', function(CONTRACT_TYPES_NAMES_CONSTANTS) {

    var ducx = {
        'networks': [26483, 26482],
        'list':[{
            'icon': 'icon-token',
            'title': 'PAGES.CREATE_CONTRACT.TOKEN.TITLE',
            'description': 'PAGES.CREATE_CONTRACT.TOKEN.DESCRIPTION',
            'typeNumber': 5,
            'type': CONTRACT_TYPES_NAMES_CONSTANTS[5],
            'price': true
        }, {
            'icon': 'icon-crowdsale',
            'title': 'PAGES.CREATE_CONTRACT.CROWDSALE.TITLE',
            'description': 'PAGES.CREATE_CONTRACT.CROWDSALE.DESCRIPTION',
            'typeNumber': 4,
            'type': CONTRACT_TYPES_NAMES_CONSTANTS[4],
            'price': true
        }]
    };

    return {
        DUCX: ducx
    };
});
