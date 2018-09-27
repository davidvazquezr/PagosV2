var unificacionUrl = global_settings.urlNode + 'unificacion/';

registrationModule.factory('unificacionRepository', function($http) {
    return {
        obtieneProveedor: function(id, nombre, rfc) {
            return $http({
                url: unificacionUrl + 'proveedor/',
                method: "GET",
                params: {
                    id: id,
                    nombre: nombre,
                    rfc: rfc
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        obtieneCuentas: function(idProveedor) {
            return $http({
                url: unificacionUrl + 'cuentas/',
                method: "GET",
                params: {
                    idProveedor: idProveedor
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        comparaCuenta: function(cuenta) {
            return $http({
                url: unificacionUrl + 'comparaCuenta/',
                method: "GET",
                params: cuenta,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        unificacion: function(cuenta) {
            return $http({
                url: unificacionUrl + 'unificacion/',
                method: "GET",
                params: cuenta,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});