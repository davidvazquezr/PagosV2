var carteraPagarUrl = global_settings.urlNode + 'carteraPagar/';

registrationModule.factory('carteraPagarRepository', function($http) {
    return {
        getDatosCarteraPagar: function(idEmpresa) {
            return $http({
                url: carteraPagarUrl + 'datosCarteraPagar/',
                method: "GET",
                params: {
                    idEmpresa: idEmpresa
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});