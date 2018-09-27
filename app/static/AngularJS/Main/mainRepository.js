var mainUrl = global_settings.urlNode + 'main/';

registrationModule.factory('mainRepository', function($http) {
    return {
        obtieneUsuario: function(idUsuario) {
            return $http({
                url: mainUrl + 'usuario/',
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