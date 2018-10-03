registrationModule.directive('flujoEfectivoDirective', function() {
    return {
        scope: {
            customer: '=' //Two-way data binding
        },
        templateUrl: 'AngularJS/CrearLote/flujoEfectivo/flujoEfectivo.html',
        controller: 'flujoEfectivoController'
    };
});