var carteraRojoUrl = global_settings.urlNode + 'carteraRojo/';

registrationModule.factory('carteraRojoRepository', function($http) {
    return {
        getDatosenRojo: function(idEmpresa) {
            return $http({
                url: carteraRojoUrl + 'datosEnRojo/',
                method: "GET",
                params: {
                    idEmpresa: idEmpresa
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }       
      
    };
});