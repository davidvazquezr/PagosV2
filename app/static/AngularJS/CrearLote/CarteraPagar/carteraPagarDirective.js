registrationModule.directive('carteraPagarDirective', function() {
    return {
        scope: {
            customer: '=' //Two-way data binding
        },
        templateUrl: 'AngularJS/CrearLote/CarteraPagar/carteraPagar.html',
        controller: 'carteraPagarController'
    };
});