var monitorUrl = global_settings.urlNode + 'monitor/';

registrationModule.factory('monitorRepository', function($http) {
    return {
        obtieneUsuario: function(idUsuario) {
            return $http({
                url: monitorUrl + 'usuario/',
                method: "GET",
                params: {
                    idUsuario: idUsuario
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
          getLotesxFecha: function(idEmpresa, idUsuario, fechaini, fechafin, estatus) {
            return $http({
                url: monitorUrl + 'lotesxFechas/',
                method: "GET",
                params: {
                    idEmpresa: idEmpresa,
                    idUsuario: idUsuario,
                    fechaini: fechaini,
                    fechafin: fechafin,
                    estatus: estatus
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        
    };
});