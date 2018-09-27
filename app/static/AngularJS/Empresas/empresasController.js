registrationModule.controller("empresasController", function($scope, $rootScope, empresasRepository, alertFactory) {

    $scope.init = function() {
        empresasRepository.obtieneEmpresas(77).then(function(result) {
            $rootScope.empresas = result.data;
        });
    }

});