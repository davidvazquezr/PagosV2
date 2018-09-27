var pagoNodeUrl = global_settings.urlNode + 'pago/';

registrationModule.factory('pagoNodeRepository', function($http) {
    return {
        putPagosPadre: function(idEmpresa, idEmpleado, nombreLote, idLote, esAplicacionDirecta, cifraControl, tipoLote) {
            return $http({
                url: pagoNodeUrl + 'pagosPadre/',
                method: "POST",
                data: {
                    idEmpresa: idEmpresa,
                    idEmpleado: idEmpleado,
                    nombreLote: nombreLote,
                    idLote: idLote,
                    esAplicacionDirecta: esAplicacionDirecta,
                    cifraControl: cifraControl,
                    tipoLote: tipoLote
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getProveedor: function(idProveedor) {
            return $http({
                url: pagoNodeUrl + 'proveedor/',
                method: "GET",
                params: {
                    idProveedor: idProveedor
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        sendNotification: function(idProc, nodo, idEmpresa, idLote) {
            return $http({
                url: pagoNodeUrl + 'revision/',
                method: "POST",
                data: {
                    idProc: idProc,
                    nodo: nodo,
                    idEmpresa: idEmpresa,
                    idLote: idLote
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getLotes: function(idEmpresa, idEmpleado, borraLote, idLote) {
            return $http({
                url: pagoNodeUrl + 'lotes/',
                method: "GET",
                params: {
                    idEmpresa: idEmpresa,
                    idEmpleado: idEmpleado,
                    borraLote: borraLote,
                    idLote: idLote
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getLotesxFecha: function(idEmpresa, idUsuario, fechaini, fechafin, estatus) {
            return $http({
                url: pagoNodeUrl + 'lotesxFechas/',
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
          getPermisosCreacionLT: function() {
            return $http({
                url: pagoNodeUrl + 'permisosCreacionLote/',
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});