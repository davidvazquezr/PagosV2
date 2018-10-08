registrationModule.controller('flujoEfectivoController', function($scope, $rootScope, $q, alertFactory, flujoEfectivoRepository) {
    /*console.log('Entre al controller de la directiva yuju')
    $scope.$watch("customer.idEmpresa", function(newValue, oldValue) {
        console.log($scope.customer.idEmpresa)
        console.log('SERA', $scope.customer)
        initEmpresa($scope.customer);
    }, true);*/
    $scope.$watch("customer.cuentaPagadora", function(newValue, oldValue) {
        console.log('Cuenta PAGAORA??', $scope.customer)
        initCuentaPagadora($scope.customer.cuentaPagadora)
    }, true);
    $scope.init = function() {
        console.log($scope.customer)
        initEmpresa($scope.customer)
    };
    var initCuentaPagadora = function(egreso) {
        $scope.bancoPago = egreso;
        var promiseIngresos = ingresos($scope.customer.idLote, $scope.customer.idEmpresa);
        promiseIngresos.then(function(res) {
            $scope.ingresos = res;
            console.log('Soy los ingresos', res)
        });
    };
    var initEmpresa = function(encabezado) {
        if (encabezado.idLote != 0) {
            var promiseBancoPagadorLote = BancoPagadorLote(encabezado.idLote);
            promiseBancoPagadorLote.then(function(res) {
                $scope.bancoPago = res[0];
            });
        }
        var promiseIngresos = ingresos(encabezado.idLote, encabezado.idEmpresa);
        promiseIngresos.then(function(res) {
            $scope.ingresos = res;
            console.log('Soy los ingresos', res)
        });
    };
    var BancoPagadorLote = function(idLote) {
        var bancoPagadorLote = $q.defer();
        flujoEfectivoRepository.obtieneBancoPagadorLote(idLote).then(function successCallback(result) {
            bancoPagadorLote.resolve(result.data);
        }, function errorCallback(result) {
            bancoPagadorLote.reject(result);
        });
        return bancoPagadorLote.promise;
    };
    var ingresos = function(idLote, idEmpresa) {
        var ingresos = $q.defer();
        flujoEfectivoRepository.obtieneIngresos(idLote, idEmpresa).then(function successCallback(result) {
            ingresos.resolve(result.data);
        }, function errorCallback(result) {
            ingresos.reject(result);
        });
        return ingresos.promise;
    };
});
//1000