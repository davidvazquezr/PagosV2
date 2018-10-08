registrationModule.controller('crearLoteController', function($scope, $rootScope, $filter, alertFactory, crearLoteRepository) {
    openCloseNav();
    $scope.fechaHoy = new Date();
    $scope.init = function() {
        var idLote = getParameterByName('idLote');
        if (idLote == '') {
            $scope.editar = false;
            $scope.datosEmpresa = {
                idEmpresa: 0,
                idLote: 0
            };
        } else {
            $scope.editar = true;
            $scope.datosEmpresa = {
                idEmpresa: 0,
                idLote: idLote
            };
            obtenerLotes($scope.datosEmpresa.idEmpresa, $rootScope.currentEmployee, $scope.datosEmpresa.idLote);
        }
    };
    $scope.empresaSeleccion = function(empresa) {
        limpiaVariables();
        $rootScope.empresa = empresa;
        $scope.datosEmpresa.idEmpresa = empresa.emp_idempresa;
        obtenerEgresos(empresa.emp_idempresa);
        traeBancosCompleta(empresa.emp_idempresa);
        // obtenerLotes($scope.datosEmpresa.idEmpresa, $rootScope.currentEmployee, $scope.datosEmpresa.idLote);
    };
    var limpiaVariables = function() {
        $scope.bancoPago = null;
    }
    var obtenerEgresos = function(idEmpresa) {
        crearLoteRepository.obtenerEgresos(idEmpresa).then(function successCallback(result) {
            console.log(result)
            $scope.egresos = result.data;
        }, function errorCallback(result) {
            console.log(result)
        });
    };
    $scope.selBancoPago = function(egreso) {
        $scope.bancoPago = egreso;
    };
    var traeBancosCompleta = function(idEmpresa) {
        crearLoteRepository.obtenerBancosCompleta(idEmpresa).then(function successCallback(result) {
            console.log(result)
            $scope.tipoTotal = 'Total cartera'
            var bancosCompletas = result.data[0];
            $scope.GranTotalaPagar = bancosCompletas.sumaSaldo;
            $scope.GranTotalnoPagable = bancosCompletas.sumaSaldoNoPagable;
            $scope.GranTotalPagable = bancosCompletas.sumaSaldoPagable;

        }, function errorCallback(result) {
            console.log(result)
        })
    };
    /*-----------------------------------
    Si se envia el idLote obtendra el encabezado de dicho lote puede o no enviarse la empresa
    Si se envia el idLote = 0 verifica si hay algun Lote Editable es necesario enviar el idEmpresa
    -------------------------------------*/
    var obtenerLotes = function(idEmpresa, idUsuario, idLote) {
        var params = {
            idEmpresa: idEmpresa,
            idUsuario: idUsuario,
            idLote: idLote
        };
        crearLoteRepository.obtieneEncabezadoLote(params).then(function successCallback(result) {
            var encabezadoLote = result.data[0];
            if (encabezadoLote.nombre) {
                $scope.nombreLote = encabezadoLote.nombre;
                var promiseEmpresas = $rootScope.obtieneEmpresas();
                promiseEmpresas.then(function(res) {
                    var empresa = res.filter(function(empresa) {
                        return empresa.emp_idempresa === encabezadoLote.idEmpresa;
                    })[0];
                    $scope.nombreEmpresa = empresa.emp_nombre;
                });
                //
            } else {
                $scope.nombreLote = 'Soy nuevo';
            }
            console.log(result);
        }, function errorCallback(result) {
            console.log(result)
        });
        console.log(idEmpresa, idUsuario, idLote, 'Soy lo de obtenerLotes')
    };

});
/*$scope.formData.nombreLoteNuevo = ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + date.getFullYear() + '-' + $rootScope.empresarfc + '-' + ('0' + ($scope.noLotes.data.length + 1)).slice(-2);*/