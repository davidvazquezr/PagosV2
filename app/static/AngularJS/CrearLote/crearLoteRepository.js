var crealLoteUrl = global_settings.urlNode + 'crearLote/';

registrationModule.factory('crearLoteRepository', function($http) {
    return {
        obtenerEgresos: function(idEmpresa) {
            return $http({
                url: crealLoteUrl + 'egresos/',
                method: "GET",
                params: {
                    idEmpresa: idEmpresa
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        obtenerBancosCompleta: function(idEmpresa) {
            return $http({
                url: crealLoteUrl + 'bancosCompleta/',
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