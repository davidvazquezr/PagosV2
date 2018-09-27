registrationModule.controller("empresasController", function($scope, $rootScope, empresasRepository, alertFactory) {

    $scope.init = function() {
          
         empresasRepository.obtieneEmpresas(77).then(function(result) {
            $rootScope.empresas = result.data;
            $rootScope.empresas.unshift({ emp_idempresa:0 ,emp_nombre: "Seleccioné empresa..." });
            $rootScope.empresaActual = $rootScope.empresas[0];
        });

    }

});