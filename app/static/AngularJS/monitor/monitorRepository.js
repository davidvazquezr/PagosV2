var monitorUrl = global_settings.urlNode + 'main/';

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
        }
    };
});