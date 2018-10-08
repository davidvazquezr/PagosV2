var carteraVencerUrl = global_settings.urlNode + 'carteraVencer/';

registrationModule.factory('carteraVencerRepository', function($http) {
    return {
        getDatosxvencer: function(idEmpresa) {
            return $http({
                url: carteraVencerUrl + 'datosxvencer/',
                method: "GET",
                params: {
                    idEmpresa: idEmpresa
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
          getDatosAprob: function(idLote) {
            return $http({
                url: carteraVencerUrl + 'datosAprob/',
                method: "GET",
                params: {
                    idLote: idLote
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
          getOtrosIngresos: function(idLote) {
            return $http({
                url: carteraVencerUrl + 'otrosIngresos/',
                method: "GET",
                params: {
                    idLote: idLote
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },        
          getTransferencias: function(idLote) {
            return $http({
                url: carteraVencerUrl + 'transferencias/',
                method: "GET",
                params: {
                    idLote: idLote
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },    
          getIngresos: function(idEmpresa,idLote) {
            return $http({
                url: carteraVencerUrl + 'ingresos/',
                method: "GET",
                params: {
                    idEmpresa:idEmpresa,
                    idLote: idLote
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getParametrosEscenarios: function(idEmpresa,idLote) {
            return $http({
                url: carteraVencerUrl + 'parametrosEscenarios/',
                method: "GET",
                params: {
                    idEmpresa:idEmpresa,
                    idLote: idLote
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});