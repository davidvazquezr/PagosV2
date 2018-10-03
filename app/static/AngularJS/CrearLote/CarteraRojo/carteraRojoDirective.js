registrationModule.directive('carteraRojoDirective', function() {
    return {
        scope: {
            customer: '=' //Two-way data binding
        },
        templateUrl: 'AngularJS/CrearLote/CarteraRojo/carteraRojo.html',
        controller: 'carteraRojoController'
    };
});