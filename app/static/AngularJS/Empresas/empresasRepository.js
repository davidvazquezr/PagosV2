var empresasUrl = global_settings.urlNode + 'empresas/';

registrationModule.factory('empresasRepository', function($http) {
    return {
        obtieneEmpresas: function(idUsuario) {
            return $http({
                url: empresasUrl + 'empresas/',
                method: "GET",
                params: {
                    idUsuario: idUsuario
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});