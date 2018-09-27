var registrationModule = angular.module("registrationModule", ['ui.sortable', 'ui.sortable.multiselection', 'ngAnimate', 'ngTouch', 'ui.grid', 'ui.grid.grouping', 'ui.grid.edit', 'ui.grid.selection', 'ui.grid.cellNav', "ngRoute", "cgBusy", "ui.bootstrap", "LocalStorageModule"])

    .config(function($routeProvider, $locationProvider) {

        // $routeProvider.when('/', {
        //     templateUrl: '/AngularJS/Templates/Pago.html',
        //     controller: 'pagoController'
        // });
        $routeProvider.when('/', {
            templateUrl: '/AngularJS/Templates/crearLote.html',
            controller: 'crearLoteController'
        });
        $routeProvider.when('/consultaLote', {
            templateUrl: '/AngularJS/Templates/consultaLote.html',
            controller: 'consultaLoteController'
        });
        $routeProvider.when('/monitor', {
            templateUrl: '/AngularJS/Templates/monitor.html',
            controller: 'monitorController'
        });
        $routeProvider.when('/unificacion', {
            templateUrl: '/AngularJS/Templates/Unificacion.html',
            controller: 'unificacionController'
        });
        $routeProvider.when('/administracionCartera', {
            templateUrl: '/AngularJS/Templates/AdministracionCartera.html',
            controller: 'admonCarteraController'
        });
        //
        $routeProvider.when('/pago', {
            templateUrl: '/AngularJS/Templates/Pago.html',
            controller: 'pagoController'
        });

        $routeProvider.when('/transferencia', {
            templateUrl: '/AngularJS/Templates/Transferencia.html',
            controller: 'transferenciaController'
        });

        $routeProvider.when('/:idLote', {
            templateUrl: '/AngularJS/Templates/Pago.html',
            controller: 'pagoController'
        });

        $routeProvider.when('/cuentas', {
            templateUrl: '/AngularJS/Templates/CuentasProveedor.html',
            controller: 'CuentasProveedorController'
        });

        $routeProvider.when('/loteAdmin', {
            templateUrl: '/AngularJS/Templates/LotesAdmin.html',
            controller: 'lotesadminController'
        });

        $routeProvider.when('/empresas', {
            templateUrl: '/AngularJS/Templates/empresas.html',
            controller: 'empresasController'
        });
        $locationProvider.html5Mode(true);
    });

registrationModule.run(function($rootScope) {
    $rootScope.var = "full";

})