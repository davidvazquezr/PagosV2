registrationModule.controller("empresasController", function($scope, $rootScope,$q, empresasRepository, alertFactory) {

    $scope.init = function() {
        empresasRepository.obtieneEmpresas($rootScope.currentEmployee).then(function(result) {
            $rootScope.empresas = result.data;
        });
    };
    $rootScope.obtieneEmpresas= function(){
    	var deferred = $q.defer();
    	empresasRepository.obtieneEmpresas($rootScope.currentEmployee).then(function successCallback(result) {
            deferred.resolve(result.data);
        }, function errorCallback(result){
        	deferred.reject(result);
        });
        return deferred.promise;
    };

});