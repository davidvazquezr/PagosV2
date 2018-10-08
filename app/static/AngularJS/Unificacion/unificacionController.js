registrationModule.controller("unificacionController", function($scope, $rootScope, unificacionRepository, alertFactory) {
    openCloseNav();
    $scope.activaBoton = false;
    $scope.limpiaBusqueda = function() {
        $scope.id = '';
        $scope.nombre = '';
        $scope.rfc = '';
        $scope.clientes = null;
        $scope.muestraLoading = false;
    };
    $scope.busqueda = function() {
        $scope.muestraLoading = true;
        unificacionRepository.obtieneProveedor($scope.id, $scope.nombre, $scope.rfc).then(function(result) {
            $scope.muestraLoading = false;
            $scope.clientes = result.data;
        });
    };
    $scope.obtieneCuentas = function(cliente) {
        $scope.alertDanger = false;
        $scope.cliente = cliente;
        $scope.limpiaBusqueda();
        $rootScope.cuentas = [];
        unificacionRepository.obtieneCuentas($scope.cliente.idProveedor).then(function(result) {
            $rootScope.cuentas = result.data;
            if ($rootScope.cuentas.length == 0) {
                $scope.alertDanger = true;
                $scope.mensaje = 'El proveedor no tine cuenta(s)'
            }
            console.log(result.data);
        });
    };
    $scope.verificaCuenta = function() {
        var cuenta = {
            cuenta: $scope.cuentaSel.BCO_NUMCUENTA,
            convenio: $scope.cuentaSel.BCO_CONVENIOCIE,
            idProveedor: $scope.cliente.idProveedor,
            idEmpresa: $scope.cuentaSel.idEmpresa,
            idUsuario: 71
        };
        unificacionRepository.comparaCuenta(cuenta).then(function(result) {
            $scope.compara = result.data[0];
            if ($scope.compara) {
                if ($scope.compara.estatus == 0) {
                    alertFactory.warning('El número de cuenta o convenio esta relacionado con el proveedor: ' + $scope.compara.idProveedor + ' ' + $scope.compara.Nombre + ' en la empresa: ' + $scope.compara.empresa);
                } else if ($scope.compara.estatus == 1) {
                    $rootScope.modalCuentaUni = cuenta;
                    $rootScope.modalCliente = $scope.cliente;
                    $('#modalUnifica').insertAfter($('body'));
                    $('#modalUnifica').modal('show')
                    //alertFactory.success('Exito total ');
                }
            } else {
                alertFactory.error('Ocurrio un error');
            }
            console.log(result.data)
        });
    };
    $scope.cuentaSeleccionada = function(cuenta) {
        $scope.cuentaSel = cuenta;
        $rootScope.modalCuenta = cuenta;
    };
    $scope.unifica = function() {
        unificacionRepository.unificacion($rootScope.modalCuentaUni).then(function(result) {
            console.log(result.data)
            var respuesta = result.data[0];
            if (respuesta.estatus == 1) {
                alertFactory.success('Se realizó la unificación exitosamente');
                $scope.obtieneCuentas($rootScope.modalCliente);
            } else if (respuesta.estatus == 0) {
                alertFactory.error('Ocurrio un problema')
            }
        });
    };
});