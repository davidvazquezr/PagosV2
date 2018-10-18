var consultaLoteUrl = global_settings.urlNode + 'consultaLote/';

registrationModule.factory('consultaLoteRepository', function($http) {
    return {
        obtieneUsuario: function(idUsuario) {
            return $http({
                url: crealLoteUrl + 'usuario/',
                method: "GET",
                params: {
                    idUsuario: idUsuario
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
          getDocsliberar: function(idLote) {
            return $http({
                url: consultaLoteUrl + 'docsliberar/',
                method: "GET",
                params: {
                    idLote: idLote
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
          liberaDocumento: function(idLote,documento) {
            return $http({
                url: consultaLoteUrl + 'liberar/',
                method: "GET",
                params: {
                    idLote: idLote,
                    documento: documento
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});