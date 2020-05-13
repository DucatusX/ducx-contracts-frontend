angular.module('Constants').constant('MENU_CONSTANTS', [

    {
        titleUserPar: 'email',
        icon: 'icon-account',
        route: 'main.profile',
        hideForUser: 'is_ghost',
        noshow: true
    },{
        title: 'MAIN_MENU.SETTINGS',
        icon: 'icon-settings',
        route: 'main.settings',
        noactive: true,
        noshow: true
    }, {
        title: 'MAIN_MENU.CREATE_CONTRACT',
        icon: 'icon-create-contract',
        route: 'main.createcontract.types',
        parent: 'main.createcontract'
    }, {
        title: 'MAIN_MENU.MY_CONTRACTS',
        icon: 'icon-contracts',
        route: 'main.contracts.list',
        parent: 'main.contracts'
    }, {
        title: 'MAIN_MENU.BUY_TOKENS',
        icon: 'icon-but-tokens',
        route: 'main.buytokens',
        noactive: false
    }, {
        title: 'MAIN_MENU.SUPPORT',
        icon: 'icon-at',
        static: true,
        url: 'support@mywish.io',
        type: 'mail'
    }
]);
