var pagoUrl = global_settings.urlCORS + '/api/pagoapi/';

registrationModule.factory('CuentasProveedorRepository', function ($http) {
    return {
         getCuentas: function (id, lote) {
        return $http({
            method: 'GET',
            url: pagoUrl,
            params: { id: '17|' + id + '|' + lote}
         });           
        },
         getProvedoresCuenta: function (id) {
        return $http({
            method: 'GET',
            url: pagoUrl,
            params: { id: '16|' + id }
         });           
        },
        update: function (id) {
            return $http.post(pagoUrl + '2|' + id);

        },

        //MANDA EL JSON AL API CON LA LISTA DE CUENTAS CONTENIENDO A SU VEZ LOS PROVEDORES EN EL ORDEN DADO
        setDatos: function(id,cuentasProveedores)
        {
            
            return $http({
                url: pagoUrl,
                method: "POST",
                params: { id: '3|' + id},
                //dataType: "json",
                data:JSON.stringify(cuentasProveedores)
               
            });            
        }//FAL
    };
});