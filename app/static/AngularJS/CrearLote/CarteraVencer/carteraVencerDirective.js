registrationModule.directive('carteraVencerDirective', function() {
    return {
        scope: {
            customer: '=' //Two-way data binding
        },
        templateUrl: 'AngularJS/CrearLote/CarteraVencer/carteraVencer.html',
        controller: 'carteraVencerController'
    };
});