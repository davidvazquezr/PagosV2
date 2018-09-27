var pagoUrl = global_settings.urlCORS + '/api/pagoapi/';

registrationModule.factory('pagoRepository', function($http) {
    return {
        getDatos: function(id) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '1|' + id }
            });
        },

        getEmpresas: function(id) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '9|' + id }
            });
        },

        getTotalxEmpresa: function(id) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '10|' + id }
            });
        },
        getEncabezado: function(id) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '2|' + id }
            });

        },
        getParametrosEscenarios: function(id) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '20|' + id }
            });

        },
        update: function(id) {
            return $http.post(pagoUrl + '2|' + id);

        },
        setDatos: function(id, idEmpleado, idPadre, ingresos, transfer, caja, cobrar, total, operacion) {
            return $http({
                url: pagoUrl,
                method: 'POST',
                params: { id: '1|' + idEmpleado + '|' + idPadre + '|' + caja + '|' + cobrar + '|' + operacion },
                data: JSON.stringify(id) + '|' + ingresos + '|' + transfer + '|' + total
            });
        }, //LQMA
        getDatosAprob: function(id) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '5|' + id }
            });

        },
        getPagosPadre: function(idEmpresa, idEmpleado, nombreLote, idLote, esAplicacionDirecta) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '6|' + idEmpresa + '|' + idEmpleado + '|' + nombreLote + '|' + idLote + '|' + esAplicacionDirecta }
            });

        },
        getIngresos: function(idEmpresa, idLote) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '11|' + idEmpresa + '|' + idLote }
            });

        },
        getEgresos: function(idEmpresa, idLote) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '12|' + idEmpresa + '|' + idLote }
            });
        },
        getLotes: function(idEmpresa, idEmpleado, borraLote, idLote) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '13|' + idEmpresa + '|' + idEmpleado + '|' + borraLote + '|' + idLote }
            });
        },
        getTransferencias: function(idLote) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '14|' + idLote }
            });
        },
        getOtrosIngresos: function(idLote) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '15|' + idLote }
            });
        },

        //FAL 10042016 TRAE LOS BANCOS MAS COMPLETA

        getBancosCompleta: function(idEmpresa) {
            return $http({
                method: 'GET',
                url: pagoUrl,
                params: { id: '19|' + idEmpresa }
            });
        },

        //FAL 15032016 manda el json para generar el archivo
        setArchivo: function(id, dataArchivo, lotePadre) {

            return $http({
                url: pagoUrl,
                method: "POST",
                params: { id: '4|' + id + '|' + lotePadre },
                //dataType: "json",
                data: JSON.stringify(dataArchivo)

            });
        }, //FAL
        //LQMA
        setSolAprobacion: function(idProc, nodo, idEmpresa, idLote) {
            return $http({
                url: pagoUrl,
                method: "POST",
                params: { id: '5|' + idProc + '|' + nodo + '|' + idEmpresa + '|' + idLote }
                //dataType: "json",
                //data:JSON.stringify(dataArchivo)

            });
        },
        //LQMA
        setAprobacion: function(idProc, nodo, idEmpresa, idLote, idUsuario, idAprobador, idAprobacion, idNotify, Observacion) {
            return $http({
                url: pagoUrl,
                method: "POST",
                params: { id: '6|' + idProc + '|' + nodo + '|' + idEmpresa + '|' + idLote + '|' + idUsuario + '|' + idAprobador + '|' + Observacion + '|' + idAprobacion + '|' + idNotify }
            });
        },

        //FAL 07062016 inserta el lote en la tabla final de aplicación
            setAplicacion: function(idEmpresa, idLote, idUsuario) {
                return $http({
                    url: pagoUrl,
                    method: "POST",
                    params: { id: '7|'  + idEmpresa + '|' + idLote + '|' + idUsuario }
                });
            } //FAL

        //FAL

    };
});
