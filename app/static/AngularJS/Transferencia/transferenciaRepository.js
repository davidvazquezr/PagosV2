var pagoUrl = global_settings.urlCORS + '/api/pagoapi/';

registrationModule.factory('transferenciaRepository', function($http) {
    return {

        //MANDA EL JSON AL API CON LA LISTA DE AGRUPADORES CONTENIENDO A SU VEZ LOS PROVEDORES EN EL ORDEN DADO
        getEmpresas: function(id) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '9|' + id }
            });
        },

        getTransferenciasxEmpresa: function(id) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '18|' + id }
            });
        },

        getTransferenciaxlote: function(id) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '22|' + id }
            });

        },

        getTransferenciaxFecha: function(idEmpresa,fechaIni,fechaFin) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '25|' + idEmpresa + '|' + fechaIni + '|' + fechaFin }
            });

        },

        setEdicionTrans: function(idLote, nmonto) {
            return $http({
                url: pagoUrl,
                method: "POST",
                params: { id: '8|' + idLote + '|' + nmonto }
            });
        }, //FAL  

        setAplicacionTrans: function(idLote, nmonto) {
                return $http({
                    url: pagoUrl,
                    method: "POST",
                    params: { id: '9|' + idLote + '|' + nmonto }
                });
            } //FA        
    };
});
