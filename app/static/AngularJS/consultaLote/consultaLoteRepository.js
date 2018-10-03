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
          getliberar: function(idLote) {
            return $http({
                url: consultaLoteUrl + 'liberarDocs/',
                method: "GET",
                params: {
                    idLote: idLote
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});