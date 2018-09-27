var empleadoUrl = global_settings.urlCORS + '/api/empleadoapi/';

registrationModule.factory('empleadoRepository', function ($http) {

    var dominio = document.domain;  
    if(dominio == '189.204.141.196'){
        
        empleadoUrl = empleadoUrl.replace("192.168.20.89", dominio);
    }


    return {
        getFichaEmpleado: function (id) {
            return $http({
			  method: 'GET',
			  url: empleadoUrl,
			  params: { id: '1|' + id }
			});
            // $http.get(empleadoUrl + );
        },
        update: function (id) {
            return $http.post(empleadoUrl + '2|' + id);

        }
    };
});