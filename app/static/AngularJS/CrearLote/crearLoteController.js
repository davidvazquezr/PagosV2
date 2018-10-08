registrationModule.controller('crearLoteController', function($scope, $rootScope, $filter, alertFactory, crearLoteRepository) {
    openCloseNav();
    $scope.fechaHoy = new Date();
    $scope.init = function() {
        var idLote = getParameterByName('idLote');
        if (idLote == '') {
            $scope.editar = false;
            $scope.datosEmpresa = {
                idEmpresa: 0,
                idLote: 0,
                cuentaPagadora: null
            };
        } else {
            $scope.editar = true;
            $scope.datosEmpresa = {
                idEmpresa: 0,
                idLote: idLote,
                cuentaPagadora: null
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
        if ($scope.datosEmpresa.idLote == 0) {
            obtenerLotes(empresa.emp_idempresa, $rootScope.currentEmployee, $scope.datosEmpresa.idLote);
        }
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
        $scope.datosEmpresa.cuentaPagadora = egreso;
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
            var encabezadoLotes = result.data;
            if (encabezadoLotes.length > 0) { //Lote para editar
                var encabezadoLote = result.data[0];
                $scope.nombreLote = encabezadoLote.nombre;
                $scope.datosEmpresa.encabezadoLote = encabezadoLote;
                var promiseEmpresas = $rootScope.obtieneEmpresas();
                promiseEmpresas.then(function(res) {
                    var empresa = res.filter(function(empresa) {
                        return empresa.emp_idempresa === encabezadoLote.idEmpresa;
                    })[0];
                    $scope.empresaSeleccion(empresa);
                    $scope.nombreEmpresa = empresa.emp_nombre;
                });
            } else { //Lote Nuevo
                $scope.nombreLote = ("0" + ($scope.fechaHoy.getMonth() + 1)).slice(-2) + ("0" + $scope.fechaHoy.getDate()).slice(-2) + $scope.fechaHoy.getFullYear() + '-' + $rootScope.empresa.rfc + '-' + ('0' + (encabezadoLotes.length + 1)).slice(-2);;
                $scope.nombreEmpresa = $rootScope.empresa.emp_nombre;
            }
            console.log(result);
        }, function errorCallback(result) {
            console.log(result)
        });
        console.log(idEmpresa, idUsuario, idLote, 'Soy lo de obtenerLotes')
    };
    $scope.crearLote = function() {
        $scope.editar = true;
    };
});