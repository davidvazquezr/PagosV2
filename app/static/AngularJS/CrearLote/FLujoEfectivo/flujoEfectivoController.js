registrationModule.controller('flujoEfectivoController', function($scope, $rootScope, alertFactory) {
	console.log('Entre al controller de la directiva yuju')
    $scope.$watch("customer.idEmpresa", function(newValue, oldValue) { 
        console.log($scope.customer.idEmpresa)
        console.log('SERA')
     },true);
    $scope.hola = function(){
        console.log($scope.customer.idEmpresa)
    };
    
});