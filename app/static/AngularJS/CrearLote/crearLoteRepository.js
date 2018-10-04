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
        },
        obtieneEncabezadoLote: function(params) {
            return $http({
                url: crealLoteUrl + 'encabezadoLote/',
                method: "GET",
                params: params,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
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