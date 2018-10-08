var flujoEfectivoUrl = global_settings.urlNode + 'flujoEfectivo/';

registrationModule.factory('flujoEfectivoRepository', function($http) {
    return {
        obtieneBancoPagadorLote: function(idLote) {
            return $http({
                url: flujoEfectivoUrl + 'bancoPagadorLote/',
                method: "GET",
                params: {
                    idLote: idLote
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        obtieneIngresos: function(idLote, idEmpresa) {
            return $http({
                url: flujoEfectivoUrl + 'ingresos/',
                method: "GET",
                params: {
                    idLote: idLote,
                    idEmpresa: idEmpresa
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});