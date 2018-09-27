registrationModule.controller("admonCarteraController", function($scope, $rootScope, admonCarteraRepository, unificacionRepository, alertFactory, $filter, globalFactory) {
    openCloseNav();
    $scope.empresaSeleccion = function(empresa) {

        $scope.empresa = empresa;
        $rootScope.datosEmpresa = empresa;
        $rootScope.carteras = null;
        $('#carteras').DataTable().clear();
    };
    $rootScope.busqueda = function(id, nombre) {
        unificacionRepository.obtieneProveedor(id, nombre, '').then(function(result) {
            $rootScope.clientes = result.data;
            globalFactory.tableBasica('proveedores');
        });
    };
    $scope.modalBusqueda = function() {
        $('#modalAdmoCuentas').modal('show')
    };
    $scope.proveedor = function(cliente) {
        $('#modalAdmoCuentas').modal('hide')

        $rootScope.cliente = cliente;
        $rootScope.carteras = null;
        $('#carteras').DataTable().clear();
    };
    $scope.buscaCartera = function() {
        $rootScope.carteras = null;
        $('#carteras').DataTable().clear();
        if (!$rootScope.vencida) {
            $rootScope.vencida = 0;
        }
        $rootScope.vencida == 1 ? $rootScope.vencida = 1 : $rootScope.vencida = 0;
        admonCarteraRepository.getCartera($rootScope.datosEmpresa.emp_idempresa, $rootScope.cliente.idProveedor, $rootScope.vencida).then(function(result) {
            $rootScope.carteras = result.data;

            if ($scope.selectedAll) {
                if ($scope.selectedAll.length > 0) {
                    $rootScope.carteras = $rootScope.carteras.filter(obj => {
                        const exists = $scope.selectedAll.some(obj2 => (
                            obj2.pbp_consCartera === obj.pbp_consCartera
                        ));
                        if (exists) {
                            return obj.unSelect = true;
                        } else {
                            return obj;
                        }
                    });
                }
            }
            globalFactory.filtrosTabla('carteras', 'CARTERA', 10);
        });
    };
    $scope.buscaCarteraVencida = function() {
        $rootScope.carteras = null;
        $('#carteras').DataTable().clear();

        $rootScope.vencida = $scope.carteraVencida == true ? 1 : 0;
        // $rootScope.carteraVencida == 1 ? $rootScope.carteraVencida = 1 : $rootScope.carteraVencida = 0;
        admonCarteraRepository.getCartera($rootScope.datosEmpresa.emp_idempresa, $rootScope.cliente.idProveedor, $rootScope.vencida).then(function(result) {
            $rootScope.carteras = result.data;

            if ($scope.selectedAll) {
                if ($scope.selectedAll.length > 0) {
                    $rootScope.carteras = $rootScope.carteras.filter(obj => {
                        const exists = $scope.selectedAll.some(obj2 => (
                            obj2.pbp_consCartera === obj.pbp_consCartera
                        ));
                        if (exists) {
                            return obj.unSelect = true;
                        } else {
                            return obj;
                        }
                    });
                }
            }
            globalFactory.filtrosTabla('carteras', 'CARTERA', 10);
        });
    };
    $scope.cambiarFecha = function() {

        var selectedRows = $filter("filter")($rootScope.carteras, {
            seleccionada: true
        }, true);
        var seleccionR = '';
        $scope.selectedRows = selectedRows;
        if (!$scope.selectedAll) {
            $scope.selectedAll = $scope.selectedRows;
        } else {
            angular.forEach($scope.selectedRows, function(value, key) {
                seleccionR = $scope.selectedAll.find(cartera);

                function cartera(car) {
                    return car.pbp_consCartera == value.pbp_consCartera;
                };
                if (!seleccionR) {
                    $scope.selectedAll.push(value)
                }
                seleccionR = '';

            });
        }
        if ($scope.selectedRows.length === 0) {
            alertFactory.warning("Debe seleccionar al menos un registro");
        } else {
            angular.forEach($scope.selectedRows, function(value, key) {
                admonCarteraRepository.pushCartera(value.pbp_consCartera, $rootScope.datosEmpresa.emp_idempresa, $rootScope.fechaPromesaPago, value.pbp_polAnnio).then(function(result) {

                    $scope.respuesta = result.data[0];
                });
            });
            setTimeout(function() {
                $('#modalAdminCartera').modal('hide')
                alertFactory.success("Se realizó la operación correctamente ");
                $scope.buscaCartera();
            }, 1000)
        }
    };
    $scope.SeleccionarTodo = function() {
        if ($scope.seleccionarTodo == true) {
            var table = $('#carteras').DataTable();
            var rowSelected = table.rows({ search: 'applied' }).data();
            var cartera = '';
            angular.forEach(rowSelected, function(value, key) {
                cartera = value[0];
                angular.forEach($rootScope.carteras, function(value, key) {
                    if (value.pbp_consCartera == cartera) {
                        value.seleccionada = true;
                    }
                });

            });
        } else if ($scope.seleccionarTodo == false) {
            angular.forEach($rootScope.carteras, function(value, key) {
                value.seleccionada = false;
            });
        }
        console.log($rootScope.carteras);
    };
    $scope.select = function(item) {
        item.seleccionada == false || item.seleccionada == undefined ? item.seleccionada = true : item.seleccionada = false;
    }

    $scope.MostrarMensaje = function(item) {
        var fechauno = new Date();
        var fechados = new Date(fechauno);
        var resultado = fechauno.getTime() === fechados.getTime();



        var fechaProm = $scope.fechaPromesa.format("dd/mm/yyyy");
        var hoy = new Date();
        if ($scope.fechaPromesa.setHours(0, 0, 0, 0) < hoy.setHours(0, 0, 0, 0)) {
            alertFactory.warning("Debe seleccionar una fecha mayor al dia de hoy");
        } else {
            $rootScope.fechaPromesaPago = fechaProm;
            $('#modalAdminCartera').modal('show')
        }


    }


});