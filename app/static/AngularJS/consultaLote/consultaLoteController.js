registrationModule.controller('consultaLoteController', function($scope, $rootScope, alertFactory, crearLoteRepository) {
    openCloseNav();
     
    $scope.init = function() {
        console.log('Logre entrar al Consulta Lote :D')
    };


    $scope.cambioEmpresa = function(empresa) {
        console.log('ID EMPRESA ACTUAL')
        console.log(empresa.emp_idempresa)
    }

});