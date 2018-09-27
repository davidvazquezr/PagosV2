registrationModule.controller('mainController', function($scope, $rootScope, localStorageService, alertFactory, mainRepository) {

    $scope.init = function() {
        console.log('Logre entrar al main :D')
        $scope.obtieneUsuario();

    };
    $scope.obtieneUsuario = function() {
        if (!($('#lgnUser').val().indexOf('[') > -1)) {
            localStorageService.set('lgnUser', $('#lgnUser').val());
        } else {
            if (($('#lgnUser').val().indexOf('[') > -1) && !localStorageService.get('lgnUser')) {
                if (getParameterByName('employee') != '') {
                    $rootScope.currentEmployee = getParameterByName('employee');
                } else {
                    alert('Inicie sesión desde panel de aplicaciones.');
                }

            }
        }
        //Solo desarrollo Comentar cuando pase a produccion 
        if (!$rootScope.currentEmployee) {
            $rootScope.currentEmployee = 77
        }
        mainRepository.obtieneUsuario($rootScope.currentEmployee).then(function successCallback(result) {           
            $rootScope.empleado = result.data[0];
             console.log($scope.empleado);
        }, function errorCallback(result) {
            alertFactory.error('Ocurrio un error al obtener el usuario');
        });
    };


    $scope.salir = function() {};
});