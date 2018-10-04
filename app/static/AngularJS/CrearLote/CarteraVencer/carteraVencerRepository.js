var carteraVencerUrl = global_settings.urlNode + 'carteraVencer/';

registrationModule.factory('carteraVencerRepository', function($http) {
    return {
        getDatosxvencer: function(idEmpresa) {
            return $http({
                url: crealLoteUrl + 'datosxvencer/',
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