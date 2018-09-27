var crealLoteUrl = global_settings.urlNode + 'main/';

registrationModule.factory('crearLoteRepository', function($http) {
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
        }
    };
});