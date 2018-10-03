registrationModule.controller('crearLoteController', function($scope, $rootScope, alertFactory, crearLoteRepository) {
	openCloseNav();
    $scope.init = function() {
        console.log('Logre entrar al Crear Lote :D')  
        var idLote = getParameterByName('idLote');
        console.log('Soy el lote', idLote)      
        $scope.datosEmpresa = {
	        idEmpresa: 0,
	        idLote: idLote
	    };
        
    };
    $scope.empresaSeleccion = function(empresa) {
    	limpiaVariables();
        $rootScope.empresa = empresa;
        $scope.datosEmpresa.idEmpresa = empresa.emp_idempresa
	    obtenerEgresos(empresa.emp_idempresa);
	    traeBancosCompleta(empresa.emp_idempresa);
    };
    var limpiaVariables = function(){
    	$scope.bancoPago = null;
    }
    var obtenerEgresos = function(idEmpresa){
    	crearLoteRepository.obtenerEgresos(idEmpresa).then(function successCallback(result){
    		console.log(result)
    		$scope.egresos = result.data;
    	},function errorCallback(result){
    		console.log(result)
    	});
    };
    $scope.selBancoPago = function(egreso) {
        $scope.bancoPago = egreso;
    };
    var traeBancosCompleta =  function(idEmpresa){
    	crearLoteRepository.obtenerBancosCompleta(idEmpresa).then(function successCallback(result){
    		console.log(result)
    		$scope.tipoTotal = 'Total cartera'
    		var bancosCompletas = result.data[0];
    		$scope.GranTotalaPagar = bancosCompletas.sumaSaldo;
            $scope.GranTotalnoPagable = bancosCompletas.sumaSaldoNoPagable;
            $scope.GranTotalPagable = bancosCompletas.sumaSaldoPagable;

    	},function errorCallback(result){
    		console.log(result)
    	})
    };
    
});
/*$scope.formData.nombreLoteNuevo = ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + date.getFullYear() + '-' + $scope.rfc + '-' + ('0' + ($scope.noLotes.data.length + 1)).slice(-2);*/