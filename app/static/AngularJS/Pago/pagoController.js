// -- =============================================
// -- Author: Fernando Alvarado Luna
// -- Create date: 27/04/2016
// -- Description: Controller para el sistema de programación de pagos
// -- Modificó:
// -- Fecha:
// -- =============================================
registrationModule.controller("pagoController", function($scope, $http, $interval, uiGridGroupingConstants, utils, uiGridConstants, $filter, $rootScope, localStorageService, alertFactory, pagoRepository, stats, $window, $routeParams, pagoNodeRepository, globalFactory) {

    //$scope.idCuenta = 4;
    $scope.idUsuario = 71;
    $rootScope.idEmpresa = 1;
    //LQMA 04032016
    if ($rootScope.currentEmployee == null) {
        $rootScope.currentEmployee = 71; //25:1;
        $rootScope.idEmpresa = 1;
    } else {
        $scope.idUsuario = $rootScope.currentEmployee;
    }
    $scope.currentId = null;
    $scope.currentIdOp = null;
    $scope.idLote = 0;
    $scope.formData = {};
    $scope.proceso = '';
    $scope.radioModel = '';
    $scope.radioTotales = 1;
    $scope.escenarios = [];
    $scope.fechaHoy = new Date();
    //FAL20042016
    $scope.blTotales = true;
    $scope.grdBancos = [];
    $scope.msgFiltros = '';
    $scope.tipoEmpresa = '';
    $scope.pagoDirecto = '';
    $scope.tipoEmpresaVarios = true;
    $scope.refMode = true;
    $scope.pagoDirectoSeleccion = false;
    $scope.pdPlanta = false;
    $scope.pdBanco = false;
    $scope.refPlanta = 0;
    $scope.refpdBanco = 0;
    $scope.selPagoDirecto = false;
    $scope.selPlantaBanco = false;
    $scope.buscarLotes = false;
    $scope.buscarTrasferencias = false;
    $scope.hidebuscando = false;
    $scope.hidenotifi = false;
    $scope.bancoPago = [];
    $scope.montominimo = 0;
    $scope.btnactualizar = 'Guardar';
    $scope.isDisabled = false;
    $rootScope.errorescxp = [];
    $rootScope.lgentra = 1;

    $rootScope.empleado = [];

     $('#btnCrealote').hide();

    var errorCallBack = function(data, status, headers, config) {
        alertFactory.error('Ocurrio un problema');
    };
    /***************************************************************************************************************
    Funciones de incio
    BEGIN
    ****************************************************************************************************************/
    $scope.iniciaCheck = function() {
        $('#switch-onText').bootstrapSwitch();
        $('#switch-onText').on('switchChange.bootstrapSwitch', function() {
            var chkSeleccionado = $('#switch-onText').bootstrapSwitch('state');
            if (chkSeleccionado)
                $scope.OcultaGridModal(false);
            else
                $scope.MuestraGridModal(true);
        });
    }
    $scope.isNumberKey = function(evt) {
        //var e = evt || window.event;
        var charCode = (evt.which) ? evt.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }

    $scope.init = function() {


        $scope.traeEmpresas();
        $scope.BuscarLotes();
        $scope.BuscarTesoreria();
        $scope.getPermisosCreacionLote();
        $scope.caja = 0;
        $scope.cobrar = 0;
        /***********************************************************/
        //LQMA 14032016
        ConfiguraGrid();
        ConfiguraGridxvencer();
        ConfiguraGridenRojo();
        $scope.accionPagina = false; //iniciarl el grid modal en llenagrid
        //Inicializamos el switch
        $.fn.bootstrapSwitch.defaults.offColor = 'info';
        $.fn.bootstrapSwitch.defaults.onText = 'Lote';
        $.fn.bootstrapSwitch.defaults.offText = 'Global';
        $('.switch-checkbox').bootstrapSwitch();
        $scope.showSelCartera = true;
        //$scope.llenaEncabezado();
        if (!($('#lgnUser').val().indexOf('[') > -1)) {
            localStorageService.set('lgnUser', $('#lgnUser').val());
        } else {
            if (($('#lgnUser').val().indexOf('[') > -1) && !localStorageService.get('lgnUser')) {
                if (getParameterByName('employee') != '') {
                    $rootScope.currentEmployee = getParameterByName('employee');
                } else {
                    //alert('Inicie sesión desde panel de aplicaciones.');
                }

            }
        }
        $scope.transferencias = [{ bancoOrigen: '', bancoDestino: '', importe: 0, disponibleOrigen: 0, index: 0 }];
        $scope.idOperacion = 0;
        if (getParameterByName('idOperacion') != '') {
            $scope.idOperacion = getParameterByName('idOperacion');
            var idLote = getParameterByName('idLote');
            $scope.idAprobador = getParameterByName('idAprobador');
            $scope.idAprobacion = getParameterByName('idAprobacion');
            $scope.idNotify = getParameterByName('idNotify');
            pagoNodeRepository.getLotes($rootScope.idEmpresa, $rootScope.currentEmployee, 0, idLote)
                .then(function successCallback(data) {
                        pagoRepository.getTotalxEmpresa($rootScope.idEmpresa)
                            .then(function successCallback(response) {
                                    $scope.GranTotal = 0;
                                    $scope.TotalxEmpresas = response.data;

                                    i = 0;
                                    $scope.TotalxEmpresas.forEach(function(cuentaPagadora, sumaSaldo) {
                                        $scope.GranTotal = $scope.GranTotal + $scope.TotalxEmpresas[i].sumaSaldo;
                                        i++;
                                    });
                                    $scope.showTotales = 1;
                                    $scope.showSelCartera = true;
                                    $scope.buscarLotes = true;
                                    //LQMA  07032016
                                    //LQMA 14032016
                                },
                                function errorCallback(response) {
                                    //oculta la información y manda el total a cero y llena el input del modal
                                    $scope.TotalxEmpresas = [];
                                    $scope.GranTotal = 0;
                                    $scope.showGrid = false;
                                    $scope.showSelCartera = false;
                                    $scope.showTotales = 0;
                                    $scope.traeTotalxEmpresa.emp_nombre = 'La empresa seleccionada no tiene información';
                                });
                        $scope.noLotes = data;
                        if ($scope.noLotes.data.length > 0) //mostrar boton crear lote
                        {
                            //$('#inicioModal').modal('hide');
                            alertFactory.success('Total de lotes: ' + $scope.noLotes.data.length);
                            $scope.idLotePadre = $scope.noLotes.data[$scope.noLotes.data.length - 1].idLotePago;
                            $scope.estatusLote = $scope.noLotes.data[$scope.noLotes.data.length - 1].estatus;
                            $scope.accionPagina = true;
                            $scope.ConsultaLote($scope.noLotes.data[$scope.noLotes.data.length - 1], $scope.noLotes.data.length, 0);
                            $scope.ProgPago = true;
                            $scope.selPagoDirecto = true;
                            $scope.traeBancosCompleta();

                            setTimeout(function() {
                                $("#btnSelectAll").click(); //$scope.selectAll();
                            }, 3000);
                        }
                    },
                    function errorCallback(response) {
                        alertFactory.error('Error al obtener el Lote');
                    });
            setTimeout(function() {
                if ($scope.idNotify != '') {
                    $rootScope.verlote = false;
                    $rootScope.vermodal = true;
                    $rootScope.verbusqueda = true;
                    $rootScope.vermonitor = true;
                    $rootScope.verunificacion = true;
                    $rootScope.veradministracionCartera = true;
                    $scope.hidenotifi = true;
                };
            }, 2000);


        }

        $scope.traeTrasferencias = false;


        pagoRepository.getUserTransferencia($scope.idUsuario)
            .then(function successCallback(response) {
                if (response.data.length > 0) //mostrar boton crear lote
                {
                    $scope.traeTrasferencias = true;

                } else {
                    $scope.traeTrasferencias = false;
                }


            }, function errorCallback(response) {
                $scope.traeTrasferencias = false;
            });

        setTimeout(function() {
            if ($scope.traeTrasferencias) {
                $window.location.href = '/transferencia';
            } else {
                // $('#inicioModal').modal('show');
            }
        }, 3000);




    };

    $scope.getPermisosCreacionLote = function(){
        pagoNodeRepository.getPermisosCreacionLT()
         .then(function successCallback(response) {
                if (response.data[0].verBtn == 'false')
                  $('#btnCrealote').hide()
              else
                 $('#btnCrealote').show()
            
        }, function errorCallback(response) {
           console.log('Error : getPermisosCreacionLote')
        });
    }
    //Fin funcion Init
    //-------------------------------------------
    //--Muestra modal donde se pedira al usuario ingresar su referencia por idProveedor
    $scope.RevisionLote = function() {
        if ($scope.tipoPago == 6) {
            var idProveedor = [];
            var compara;
            var contador = 0;
            $rootScope.proveedoresReferencia = [];
            console.log('Entre en revision lote', $scope.arrayPagos);
            angular.forEach($scope.arrayPagos, function(value, key) {
                if (value.agrupar == true) {
                    idProveedor.push(value);
                } else {
                    compara = idProveedor.filter(function(proveedor) {
                        return proveedor.idProveedor === value.idProveedor && proveedor.agrupar == false;
                    });
                    if (compara) {
                        if (compara.length == 0) {
                            idProveedor.push(value);
                        }
                    }
                }
                compara = []
            });
            angular.forEach(idProveedor, function(value, key) {
                pagoNodeRepository.getProveedor(value.idProveedor).then(function(result) {
                    contador++;
                    value.nombreProveedor = result.data[0].nombre;
                    if (idProveedor.length == contador) {
                        $rootScope.proveedoresReferencia = idProveedor;
                        globalFactory.tableBasica('referencias');
                        $('#modalProveedorRef').modal('show');
                    }
                });
            });
            // $rootScope.proveedoresReferencia = idProveedor;
            // $('#modalProveedorRef').modal('show');
        } else {
            $scope.GuardaLoteGeneral($scope.gridApi1.selection.getSelectedRows());
        }
    };
    //-------------------------------------------
    //-------------------------------------------
    //--se manda a revision el lote
    $rootScope.EnviaRevision = function() {
        var compara;
        var rowReferencia;
        var referencia = '';
        console.log($rootScope.proveedoresReferencia, 'Los que modificare')
        angular.forEach($rootScope.proveedoresReferencia, function(value, key) {
            rowReferencia = value;
            referencia = value.referencia;
            angular.forEach($scope.arrayPagos, function(value, key) {
                if (value.idProveedor == rowReferencia.idProveedor && value.agrupar == false && rowReferencia.agrupar == false) {
                    value.referencia = $scope.idLotePadre + '-' + value.idProveedor + '-' + referencia;
                } else if (value.idProveedor == rowReferencia.idProveedor && value.documento == rowReferencia.documento) {
                    value.referencia = $scope.idLotePadre + '-' + value.idProveedor + '-' + referencia;
                }
            });
        });
        var rows = $scope.arrayPagos;
        if (rows.length == 0 && $rootScope.verbusqueda == false) {
            alertFactory.warning('Debe seleccionar al menos un documento para guardar un lote.');
            $('#btnGuardando').button('reset');
            $('#btnAprobar').button('reset');
        } else {
            pagoNodeRepository.putPagosPadre($rootScope.idEmpresa, $rootScope.currentEmployee, $scope.formData.nombreLoteNuevo, $scope.idLotePadre, 0, ($scope.grdApagar).toFixed(2), $scope.tipoPago)
                .then(function successCallback(response) {
                    console.log(response.data)
                    $scope.idLotePadre = response.data[0].idPadre;
                    var array = [];
                    var count = 1;
                    rows.forEach(function(row, i) {
                        var elemento = {};
                        elemento.pal_id_lote_pago = $scope.idLotePadre; //response.data;
                        elemento.pad_polTipo = row.polTipo; //entity.polTipo;
                        elemento.pad_polAnnio = row.annio;
                        elemento.pad_polMes = row.polMes;
                        elemento.pad_polConsecutivo = row.polConsecutivo;
                        elemento.pad_polMovimiento = row.polMovimiento;
                        elemento.pad_fechaPromesaPago = (row.fechaPromesaPago == '' ? '1900-01-01T00:00:00' : row.fechaPromesaPago);
                        elemento.pad_saldo = parseFloat(row.Pagar) + .00000001;
                        if ((row.referencia == null) || (row.referencia == undefined) || (row.referencia == "")) {
                            row.referencia = "AUT";
                        }
                        elemento.pad_documento = row.documento;
                        elemento.pad_polReferencia = row.referencia;
                        elemento.tab_revision = 1;
                        if (row.agrupar == 1) {
                            elemento.pad_agrupamiento = count;
                        } else {
                            elemento.pad_agrupamiento = row.agrupar;
                        }
                        elemento.pad_bancoPagador = $scope.bancoPago.cuenta;
                        var lonbancodestino = row.cuentaDestino.length;
                        var primerparentesis = row.cuentaDestino.indexOf("(", 0)
                        var numcuentaDestino = row.cuentaDestino.substring(primerparentesis + 1, lonbancodestino)
                        var res = numcuentaDestino.replace("(", "");
                        res = res.replace(")", "");
                        res = res.replace(",", "");
                        res = res.replace(",", "");
                        res = res.replace(",", "");
                        res = res.replace(" ", "");
                        elemento.pad_bancoDestino = res;
                        array.push(elemento);
                        count = count + 1;
                    });
                    var jsIngresos = angular.toJson($scope.ingresos); //delete $scope.ingresos['$$hashKey'];
                    var jsTransf = angular.toJson($scope.transferencias);
                    var jsEgresos = angular.toJson($scope.egresos);
                    // $scope.jsIngresosM = angular.toJson($scope.ingresos); //delete $scope.ingresos['$$hashKey'];
                    // $scope.jsTransfM = angular.toJson($scope.transferencias);
                    // $scope.jsEgresosM = angular.toJson($scope.egresos);
                    // $scope.arrayPagos = rows;
                    pagoRepository.setDatos(array, $rootScope.currentEmployee, $scope.idLotePadre, jsIngresos, jsTransf, $scope.caja, $scope.cobrar, jsEgresos, ($scope.estatusLote == 0) ? 1 : 2)
                        .then(function successCallback(response) {
                            // alertFactory.success('Se guardaron los datos.');
                            pagoNodeRepository.sendNotification(1, 8, $rootScope.idEmpresa, $scope.idLotePadre).then(function(result) {
                                if (result.data[0].result == 1) {
                                    alertFactory.success('Se envio correctamente a revisión')
                                    setTimeout(function() {
                                        $('#modalProveedorRef').modal('show');
                                        $window.location.href = '/pago';
                                    }, 500);

                                }
                            });
                            $scope.estatusLote = 1;
                            angular.forEach($scope.noLotes.data, function(lote, key) {
                                if (lote.idLotePago == $scope.idLote) {
                                    lote.idLotePago = $scope.idLotePadre;
                                    lote.estatus = 1;
                                }
                            });
                            $('#btnGuardando').button('reset');
                        }, function errorCallback(response) {
                            alertFactory.error('Error al guardar Datos');
                            $('#btnGuardando').button('reset');
                            $('#btnAprobar').button('reset');
                        });
                    $('#btnguardando').button('reset');
                }, function errorCallback(response) {
                    alertFactory.error('Error al insertar en tabla padre.');
                    $('#btnguardando').button('reset');
                });
        }
        console.log($scope.arrayPagos, 'El modificado');

    };
    //-------------------------------------------
    //-------------------------------------------
    //--Guardar Lote a partir de un array 
    $scope.GuardaLoteGeneral = function(array) {
        var rows = array;
        if (rows.length == 0 && $rootScope.verbusqueda == false) {
            alertFactory.warning('Debe seleccionar al menos un documento para guardar un lote.');
            $('#btnGuardando').button('reset');
            $('#btnAprobar').button('reset');
        } else {
            pagoNodeRepository.putPagosPadre($rootScope.idEmpresa, $rootScope.currentEmployee, $scope.formData.nombreLoteNuevo, $scope.idLotePadre, 0, ($scope.grdApagar).toFixed(2), $scope.tipoPago)
                .then(function successCallback(response) {
                    console.log(response.data)
                    $scope.idLotePadre = response.data[0].idPadre;
                    var array = [];
                    var count = 1;
                    rows.forEach(function(row, i) {
                        var elemento = {};
                        elemento.pal_id_lote_pago = $scope.idLotePadre; //response.data;
                        elemento.pad_polTipo = row.polTipo; //entity.polTipo;
                        elemento.pad_polAnnio = row.annio;
                        elemento.pad_polMes = row.polMes;
                        elemento.pad_polConsecutivo = row.polConsecutivo;
                        elemento.pad_polMovimiento = row.polMovimiento;
                        elemento.pad_fechaPromesaPago = (row.fechaPromesaPago == '' ? '1900-01-01T00:00:00' : row.fechaPromesaPago);
                        elemento.pad_saldo = parseFloat(row.Pagar) + .00000001;
                        if ((row.referencia == null) || (row.referencia == undefined) || (row.referencia == "")) {
                            row.referencia = "AUT";
                        }
                        elemento.pad_documento = row.documento;
                        elemento.pad_polReferencia = row.referencia;
                        elemento.tab_revision = 1;
                        if (row.agrupar == 1) {
                            elemento.pad_agrupamiento = count;
                        } else {
                            elemento.pad_agrupamiento = row.agrupar;
                        }
                        elemento.pad_bancoPagador = $scope.bancoPago.cuenta;
                        var lonbancodestino = row.cuentaDestino.length;
                        var primerparentesis = row.cuentaDestino.indexOf("(", 0)
                        var numcuentaDestino = row.cuentaDestino.substring(primerparentesis + 1, lonbancodestino)
                        var res = numcuentaDestino.replace("(", "");
                        res = res.replace(")", "");
                        res = res.replace(",", "");
                        res = res.replace(",", "");
                        res = res.replace(",", "");
                        res = res.replace(" ", "");
                        elemento.pad_bancoDestino = res;
                        array.push(elemento);
                        count = count + 1;
                    });
                    var jsIngresos = angular.toJson($scope.ingresos); //delete $scope.ingresos['$$hashKey'];
                    var jsTransf = angular.toJson($scope.transferencias);
                    var jsEgresos = angular.toJson($scope.egresos);
                    // $scope.jsIngresosM = angular.toJson($scope.ingresos); //delete $scope.ingresos['$$hashKey'];
                    // $scope.jsTransfM = angular.toJson($scope.transferencias);
                    // $scope.jsEgresosM = angular.toJson($scope.egresos);
                    // $scope.arrayPagos = rows;
                    pagoRepository.setDatos(array, $rootScope.currentEmployee, $scope.idLotePadre, jsIngresos, jsTransf, $scope.caja, $scope.cobrar, jsEgresos, ($scope.estatusLote == 0) ? 1 : 2)
                        .then(function successCallback(response) {
                            // alertFactory.success('Se guardaron los datos.');
                            pagoNodeRepository.sendNotification(1, 8, $rootScope.idEmpresa, $scope.idLotePadre).then(function(result) {
                                if (result.data[0].result == 1) {
                                    alertFactory.success('Se envio correctamente a revisión')
                                    setTimeout(function() {
                                        $('#modalProveedorRef').modal('show');
                                        $window.location.href = '/pago';
                                    }, 500);

                                }
                            });
                            $scope.estatusLote = 1;
                            angular.forEach($scope.noLotes.data, function(lote, key) {
                                if (lote.idLotePago == $scope.idLote) {
                                    lote.idLotePago = $scope.idLotePadre;
                                    lote.estatus = 1;
                                }
                            });
                            $('#btnGuardando').button('reset');
                        }, function errorCallback(response) {
                            alertFactory.error('Error al guardar Datos');
                            $('#btnGuardando').button('reset');
                            $('#btnAprobar').button('reset');
                        });
                    $('#btnguardando').button('reset');
                }, function errorCallback(response) {
                    alertFactory.error('Error al insertar en tabla padre.');
                    $('#btnguardando').button('reset');
                });
        }

    };
    //-------------------------------------------
    //-------------------------------------------
    //--Funcion para guardar Lotes Modificados
    $scope.GuardaModificados = function() {
        // var rows = $scope.gridApi1.selection.getSelectedRows();
        console.log($scope.gridApi1.selection.getSelectedRows(), 'Soy lo que llego');
        var rows = $scope.gridApi1.selection.getSelectedRows();
        if (rows.length == 0 && $rootScope.verbusqueda == false) {
            alertFactory.warning('Debe seleccionar al menos un documento para guardar un lote.');
            $('#btnGuardando').button('reset');
            $('#btnAprobar').button('reset');
        } else {
            pagoRepository.getEgresos($rootScope.idEmpresa, $scope.idLotePadre)
                .then(function successCallback(response) {
                    $scope.egresos = response.data[0];
                    pagoNodeRepository.putPagosPadre($rootScope.idEmpresa, $rootScope.currentEmployee, $scope.formData.nombreLoteNuevo, $scope.idLotePadre, 0, ($scope.grdApagar).toFixed(2), $scope.tipoPago)
                        .then(function successCallback(response) {
                            console.log(response.data)
                            $scope.idLotePadre = response.data[0].idPadre;
                            var array = [];
                            var count = 1;
                            rows.forEach(function(row, i) {
                                var elemento = {};
                                elemento.pal_id_lote_pago = $scope.idLotePadre; //response.data;
                                elemento.pad_polTipo = row.polTipo; //entity.polTipo;
                                elemento.pad_polAnnio = row.annio;
                                elemento.pad_polMes = row.polMes;
                                elemento.pad_polConsecutivo = row.polConsecutivo;
                                elemento.pad_polMovimiento = row.polMovimiento;
                                elemento.pad_fechaPromesaPago = (row.fechaPromesaPago == '' ? '1900-01-01T00:00:00' : row.fechaPromesaPago);
                                elemento.pad_saldo = parseFloat(row.Pagar) + .00000001;
                                if ((row.referencia == null) || (row.referencia == undefined) || (row.referencia == "")) {
                                    row.referencia = "AUT";
                                }
                                elemento.pad_documento = row.documento;
                                elemento.pad_polReferencia = row.referencia;
                                elemento.tab_revision = 1;
                                if (row.agrupar == 1) {
                                    elemento.pad_agrupamiento = count;
                                } else {
                                    elemento.pad_agrupamiento = row.agrupar;
                                }
                                elemento.pad_bancoPagador = $scope.egresos.cuenta;
                                var lonbancodestino = row.cuentaDestino.length;
                                var primerparentesis = row.cuentaDestino.indexOf("(", 0)
                                var numcuentaDestino = row.cuentaDestino.substring(primerparentesis + 1, lonbancodestino)
                                var res = numcuentaDestino.replace("(", "");
                                res = res.replace(")", "");
                                res = res.replace(",", "");
                                res = res.replace(",", "");
                                res = res.replace(",", "");
                                res = res.replace(" ", "");
                                elemento.pad_bancoDestino = res;
                                array.push(elemento);
                                count = count + 1;
                            });
                            var jsIngresos = angular.toJson($scope.ingresos); //delete $scope.ingresos['$$hashKey'];
                            var jsTransf = angular.toJson($scope.transferencias);
                            var jsEgresos = angular.toJson($scope.egresos);
                            pagoRepository.setDatos(array, $rootScope.currentEmployee, $scope.idLotePadre, jsIngresos, jsTransf, $scope.caja, $scope.cobrar, jsEgresos, ($scope.estatusLote == 0) ? 1 : 2)
                                .then(function successCallback(response) {
                                    // alertFactory.success('Se guardaron los datos.');
                                    $scope.estatusLote = 1;
                                    angular.forEach($scope.noLotes.data, function(lote, key) {
                                        if (lote.idLotePago == $scope.idLote) {
                                            lote.idLotePago = $scope.idLotePadre;
                                            lote.estatus = 1;
                                        }
                                    });
                                    $('#btnGuardando').button('reset');
                                }, function errorCallback(response) {
                                    alertFactory.error('Error al guardar Datos');
                                    $('#btnGuardando').button('reset');
                                    $('#btnAprobar').button('reset');
                                });
                            $('#btnguardando').button('reset');
                        }, function errorCallback(response) {
                            alertFactory.error('Error al insertar en tabla padre.');
                            $('#btnguardando').button('reset');
                        });

                }, function errorCallback(response) {
                    alertFactory.error('Error al obtener los Egresos');
                });

        }
    };
    //-------------------------------------------
    /////////////////////////////////////////////
    //Obtiene ID de empleado
    //LQMA
    var GetEmpleado = function() {
        if (!($('#lgnUser').val().indexOf('[') > -1)) {
            localStorageService.set('lgnUser', $('#lgnUser').val());
        } else {
            if (($('#lgnUser').val().indexOf('[') > -1) && !localStorageService.get('lgnUser')) {
                if (getParameterByName('employee') != '') {
                    $rootScope.currentEmployee = getParameterByName('employee');
                    return;
                } else {
                    alert('Inicie sesión desde panel de aplicaciones.');
                    window.close();
                }
            }
        }
        //Obtengo el empleado logueado
        $rootScope.currentEmployee = localStorageService.get('lgnUser');
    };

    //LQMA obtiene el ID de padre para consultar pagos por aprobar
    var GetId = function() {
        if (getParameterByName('id') != '') {
            $scope.currentId = getParameterByName('id');
        }
        if ($scope.currentId != null)
            GetIdOp();
        else {
            ConfiguraGrid();
            GetEmpleado
            setTimeout(function() { Prepagos(); }, 500);
        }
    }
    //obtiene parametro de operacion para configurar el Grid en editable o no.
    var GetIdOp = function() {
        if (getParameterByName('idOp') != '') {
            $scope.currentIdOp = getParameterByName('idOp');
        }
        if ($scope.currentIdOp != null) {
            ConfiguraGrid();
            setTimeout(function() { Prepagos(); }, 500);
        } else {
            ConfiguraGrid();
            setTimeout(function() { Prepagos(); }, 500);
        }
    };
    //FAl--Llena los datos de la empresa dependiendo el usuario.
    $scope.llenaEncabezado = function() {
        pagoRepository.getEncabezado($rootScope.idEmpresa)
            .then(function successCallback(response) {
                $scope.scencabezado = response.data;
            }, function errorCallback(response) {
                alertFactory.error('Error al obtener los datos del encabezado.');
            });
    };
    //Trae las empresas para el modal de inicio
    $scope.traeEmpresas = function() {
        //Llamada a repository para obtener data
        //LQMA 03032016
        $scope.showGrid = false;
        pagoRepository.getEmpresas($scope.idUsuario)
            .then(function successCallback(response) {
                $scope.empresas = response.data;
                //
                $scope.showTotales = 0;
            }, function errorCallback(response) {
                alertFactory.error('Error en empresas.');
            });

    }





    $scope.traeTransferenciasUser = function(idUsuario) {

        pagoRepository.getEmpresas($scope.idUsuario)
            .then(function successCallback(response) {
                $scope.empresas = response.data;
                //
                $scope.showTotales = 0;
            }, function errorCallback(response) {
                alertFactory.error('Error en empresas.');
            });

    }


    // };
    //FAL 23052016 TRAE LOS PARAMETROS DE ESCENARIOS DE PAGOS.

    $scope.llenaParametroEscenarios = function() {
        pagoRepository.getParametrosEscenarios($scope.tipoEmpresa)
            .then(function successCallback(response) {
                $scope.escenarios = response.data;
                $scope.pdPlanta = $scope.escenarios.Pdbanco;
                $scope.pdBanco = $scope.escenarios.Pdplanta;
                $scope.refPlanta = $scope.escenarios.TipoRefPlanta;
                $scope.refpdBanco = $scope.escenarios.tipoRefBanco;
                if ($scope.pdPlanta || $scope.pdBanco) {
                    $scope.selPagoDirecto = true;
                } else {
                    $scope.selPagoDirecto = false;
                }
            }, function errorCallback(response) {
                alertFactory.error('Error al obtener los parametros del escenario de pagos.');
            });
    };


    //FAL Trae los bancos x empresa con todos sus saldos
    $scope.traeBancosCompleta = function() {
        //Llamada a repository para obtener data
        //FAL 10042016
        $scope.grdBancos = [];
        $scope.grdBancosoriginal = [];
        pagoRepository.getBancosCompleta($rootScope.idEmpresa)
            .then(function successCallback(response) {
                $scope.bancosCompletas = response.data;
                $scope.GranTotalaPagar = 0;
                $scope.GranTotalnoPagable = 0;
                $scope.GranTotalPagable = 0;
                i = 0;
                $scope.bancosCompletas.forEach(function(cuentaPagadora, sumaSaldo) {
                    $scope.GranTotalaPagar = $scope.GranTotalaPagar + $scope.bancosCompletas[i].sumaSaldo;
                    $scope.GranTotalnoPagable = $scope.GranTotalnoPagable + $scope.bancosCompletas[i].sumaSaldoNoPagable;
                    $scope.GranTotalPagable = $scope.GranTotalPagable + $scope.bancosCompletas[i].sumaSaldoPagable;
                    i++;
                });
                $scope.grdBancosoriginal = $scope.grdBancos;
            }, function errorCallback(response) {
                alertFactory.error('Error en bancos con todos sus saldos.');
            });
    };
    //FAl--Trae el total de bancos de la empresa seleccionada
    $scope.traeTotalxEmpresa = function(emp_idempresa, emp_nombre, emp_nombrecto, rfc, tipo, pagoDirecto, monto_minimo) {
        $('#btnTotalxEmpresa').button('loading');
        $scope.showTotales = 0;
        $scope.showSelCartera = false;
        //LQMA 14042016
        $scope.emp_nombrecto = emp_nombrecto;
        $scope.rfc = rfc;
        $scope.montominimo = monto_minimo;
        $scope.LlenaEgresos(emp_idempresa, 0);
        pagoRepository.getTotalxEmpresa(emp_idempresa)
            .then(function successCallback(response) {

                $scope.GranTotal = 0;
                $scope.TotalxEmpresas = response.data;
                $rootScope.idEmpresa = emp_idempresa;
                i = 0;
                $scope.TotalxEmpresas.forEach(function(cuentaPagadora, sumaSaldo) {
                    $scope.GranTotal = $scope.GranTotal + $scope.TotalxEmpresas[i].sumaSaldo;
                    i++;
                });
                $scope.traeTotalxEmpresa.emp_nombre = emp_nombre;
                $scope.showTotales = 1;
                $scope.tipoEmpresa = tipo;
                $scope.pagoDirecto = pagoDirecto;
                $scope.showSelCartera = true;
                $scope.buscarLotes = true;
                $scope.ObtieneLotes(0);
                $('#btnTotalxEmpresa').button('reset');
                $scope.llenaParametroEscenarios();

                $scope.traeBancosCompleta();


            }, function errorCallback(response) {
                //oculta la información y manda el total a cero y llena el input del modal
                $scope.TotalxEmpresas = [];
                $scope.GranTotal = 0;
                $scope.showGrid = false;
                $scope.showSelCartera = false;
                $scope.showTotales = 0;
                $scope.traeTotalxEmpresa.emp_nombre = 'La empresa seleccionada no tiene información';
                $('#btnTotalxEmpresa').button('reset');
            });

    };


    $scope.ObtieneLotes = function(newLote) //borraLote, 0 para borrar lotes sin relacion, 1 para conservarlos
    {
        var date = new Date();
        pagoNodeRepository.getLotes($rootScope.idEmpresa, $rootScope.currentEmployee, 0, 0)
            .then(function successCallback(data) {
                    var EsPagoDirecto = 0;
                    if ($scope.selPlantaBanco) {
                        EsPagoDirecto = 1;
                    }

                    $scope.noLotes = data;
                    if (newLote != 0) {
                        $scope.noLotes.data.push(newLote);
                        $scope.estatusLote = 0;
                    }
                    if ($scope.noLotes.data.length > 0) //mostrar boton crear lote
                    {
                        alertFactory.success('Total de lotes: ' + $scope.noLotes.data.length);
                        $scope.idLotePadre = $scope.noLotes.data[$scope.noLotes.data.length - 1].idLotePago;
                        $scope.estatusLote = $scope.noLotes.data[$scope.noLotes.data.length - 1].estatus;
                        $scope.ConsultaLote($scope.noLotes.data[$scope.noLotes.data.length - 1], $scope.noLotes.data.length, 0, EsPagoDirecto);
                        $scope.formData.nombreLoteNuevo = ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + date.getFullYear() + '-' + $scope.rfc + '-' + ('0' + ($scope.noLotes.data.length + 1)).slice(-2); //data.length + 1;
                        $scope.NuevoLote = true;
                        $scope.ProgPago = true;

                    } else {
                        //alertFactory.info('No existen Lotes');
                        $scope.NuevoLote = true;
                        $scope.formData.nombreLoteNuevo = ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + date.getFullYear() + '-' + $scope.rfc + '-' + ('0' + ($scope.noLotes.data.length + 1)).slice(-2); //data.length + 1;
                    }
                },
                function errorCallback(response) {
                    alertFactory.error('Error al obtener los Lotes');
                });
    };
    //LQMA 04032016 obtiene ingresos y egresos
    $scope.LlenaIngresos = function() {
        pagoRepository.getIngresos($rootScope.idEmpresa, $scope.idLote)
            .then(function successCallback(response) {
                $scope.bancoIngresos = [];
                //lleno ingresos sin
                $scope.ingresos = response.data;
                angular.forEach(response.data, function(varIngreso, key) {
                    var newIngreso = varIngreso;
                    if (newIngreso.cuenta != $scope.bancoPago.cuenta) {
                        $scope.bancoIngresos.push(newIngreso);
                    }
                });
                $scope.egresos = [];
                $scope.egresos.push($scope.bancoPago);
                $scope.calculaTotalOperaciones();
                recalculaIngresos();

                //$scope.LlenaEgresos();
            }, function errorCallback(response) {
                alertFactory.error('Error al obtener los Ingresos');
            });
    };

    $scope.LlenaEgresos = function(idempresa, lote) {
        pagoRepository.getEgresos(idempresa, lote)
            .then(function successCallback(response) {
                $scope.egresos = response.data;
                angular.forEach($scope.grdBancos, function(empresa, key) {


                    angular.forEach($scope.egresos, function(egreso, key) {
                        if (empresa.cuentaPagadora == egreso.cuenta)
                            egreso.totalPagar = empresa.subtotal;
                    });
                });
                angular.forEach($scope.egresos, function(egreso, key) {
                    angular.forEach($scope.ingresos, function(ingreso, key) {
                        if (ingreso.cuenta == egreso.cuenta)
                            egreso.ingreso = 1;
                    });
                });
                $scope.calculaTotalOperaciones();
                recalculaIngresos();
            }, function errorCallback(response) {
                alertFactory.error('Error al obtener los Egresos');
            });
    };

    $scope.cambiaCrear = function(idmenu) {

        $rootScope.lgentra = $rootScope.lgentra + 1;

        setTimeout(function() {
            $window.location.href = '/pago?idmenu=' + idmenu;
        }, 1000);

    };
    /***************************************************************************************************************
    Funciones de incio
    END
    ****************************************************************************************************************/
    /***************************************************************************************************************
    Funciones de GRID
    BEGIN
    ****************************************************************************************************************/
    //FAl--Muestra el div del grid en el Modal y
    //lo configura para que no se edite y solo presente los campos principales
    $scope.MuestraGridModal = function(value) {
        //LQMA 14032016
        setTimeout(function() {
            $scope.selectAllModal();
            //FAL evita que se alteren los datos al seleccionar todos
            $scope.showGrid = true;
        }, 5000);
        /************************************************************************************************************************/
    };
    //FAl--Oculta el grid del Modal y asigna la variable toda la cartera true
    $scope.OcultaGridModal = function(value) {
        $('#btnTodalaCartera').button('loading');
        $scope.selectAllModal();
        $scope.showGrid = value;
        $('#btnTodalaCartera').button('reset');
    };

    //FAL modal de errores.

    $scope.modalErrores = function(idempresa) {
        $('#modalerrores').modal('show');
        pagoRepository.getErrores(idempresa)
            .then(function successCallback(response) {
                $rootScope.errorescxp = response.data;
                //
            }, function errorCallback(response) {
                alertFactory.error('Error al traer los detalles.');
            });
    };

    $scope.modalLibera = function(idLote) {
        $('#modallibera').modal('show');
        pagoRepository.getliberar(idLote)
            .then(function successCallback(response) {
                $rootScope.liberarcxp = response.data;
                $rootScope.idloteliberar = idLote;
                //
            }, function errorCallback(response) {
                alertFactory.error('Los documentos estan aplicados.');
            });
    };

    $scope.liberarlote = function(idLote, documento) {
        $scope.isDisabled = true;
        pagoRepository.LiberaDocumento(idLote, documento).then(function successCallback(response) {
            console.log(response.data);
            if (response.data.length == 0) {
                $scope.isDisabled = false;
            }
            $scope.isDisabled = false;
        }, function errorCallback(response) {
            $scope.isDisabled = false;

        });

        $scope.modalLibera(idLote);
    }




    //LQMA 07032016
    $scope.IniciaLote = function() {


        $scope.crearLote = true;
        $scope.selPlantaBanco = false;

        if ($scope.formData.nombreLoteNuevo == null) {
            alertFactory.warning('Debe proporcionar el nombre del nuevo lote.');
            $('#btnCrealote').button('reset');
        } else {


            $scope.gridOptions = null;
            $scope.gridXvencer = null;
            $scope.gridenRojo = null
            ConfiguraGrid();
            ConfiguraGridxvencer();
            ConfiguraGridenRojo();

            //LQMA 10032016
            $scope.NuevoLote = true;
            $scope.btnactualizar = 'Guardar';
            //LQMA add 08042016

            pagoRepository.getDatos($rootScope.idEmpresa)
                .success(getCarteraCallback)
                .error(errorCallBack);

        }
        $rootScope.verlote = false;
        $rootScope.vermodal = true;
        $rootScope.verbusqueda = true;
        $rootScope.vermonitor = true;
        $rootScope.verunificacion = true;



        $('#btnCrealote').button('Crear Lote');



    }; //FIN inicia Lote

    //presnto los datapickers.


    $scope.BuscarLotes = function() {


        $rootScope.gridLotesoptions = {
            enableRowSelection: true,
            enableRowHeaderSelection: true
            //,rowTemplate: rowTemplate()
        };



        $rootScope.gridLotesoptions.columnDefs = [
            { name: 'idLotePago', displayName: 'Lote', width: '5%', enableCellEdit: false, visible: true },
            { name: 'fecha', displayName: 'Fecha Lote', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '10%', enableCellEdit: false },
            { name: 'nombre', width: '10%' },
            { name: 'descLote', displayName: 'Estatus de Lote', width: '20%' },
            { name: 'descError', displayName: 'Error', width: '20%', visible: false },
            { name: 'totalPagar', displayName: 'Total a pagar', width: '10%', cellFilter: 'currency', enableCellEdit: false },
            { name: 'cuentaPago', displayName: 'Banco Pago', width: '15%', enableCellEdit: false },
            { name: 'buscar', displayName: 'Buscar', width: '5%', cellTemplate: '<div><button class="btn btn-warning" ><span class="glyphicon glyphicon-search" ng-click="grid.appScope.ConsultaLoteObtieneBusqueda(row.entity,0,0)"></span></button></div>' },
            { name: 'Aplicar', displayName: 'Aplicar', width: '5%', cellTemplate: '<div ng-show="(row.entity.estatus==3) && (row.entity.idTipoPago == 2)"><button class="btn btn-info" ><span class="glyphicon glyphicon-floppy-saved" ng-click="grid.appScope.ConsultaLoteObtieneBusquedaAplicaDirecto(row.entity,0,0)"></span></button></div>' },
            { name: 'Borrar', displayName: 'Borrar', width: '5%', cellTemplate: '<div ng-show="(row.entity.estatus==1)||(row.entity.estatus==2)"><button class="btn btn-danger" ><span class="glyphicon glyphicon-trash" ng-click="grid.appScope.borraLoteBtn(row.entity)"></span></button></div>' },
            { name: 'Libera', displayName: 'Libera', width: '5%', cellTemplate: '<div ng-show="((row.entity.numdetalle - row.entity.numaplicado)>0)"><button class="btn btn-success" ><span class="glyphicon glyphicon-download-alt" ng-click="grid.appScope.modalLibera(row.entity.idLotePago)"></span></button></div>' },
        ];



        $rootScope.gridLotesoptions.multiSelect = false;
        $rootScope.gridLotesoptions.modifierKeysToMultiSelect = false;
        $rootScope.gridLotesoptions.noUnselect = true;
        $rootScope.gridLotesoptions.onRegisterApi = function(gridApi) {
            $scope.gridApiLote = gridApi;
        };
    }

    $scope.BuscarTesoreria = function() {


        $scope.gridtesoreriaoptions = {
            enableRowSelection: true,
            enableRowHeaderSelection: true
            //,rowTemplate: rowTemplate()
        };



        $scope.gridtesoreriaoptions.columnDefs = [
            { name: 'idLotePago', displayName: 'Lote', width: '5%', enableCellEdit: false, visible: true },
            { name: 'fecha', displayName: 'Fecha Lote', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '10%', enableCellEdit: false },
            { name: 'nombre', width: '15%' },
            { name: 'descLote', displayName: 'Estatus de Lote', width: '15%' },
            /*{ name: 'descError', displayName: 'Error', width: '50%'},*/
            { name: 'totalPagar', displayName: 'Total a pagar', width: '10%', cellFilter: 'currency', enableCellEdit: false },
            { name: 'nombretipo', displayName: 'Tipo', width: '10%', enableCellEdit: false },
            { name: 'generaTXT', displayName: 'TXT', width: '5%', cellTemplate: '<div ng-show="((row.entity.estatus==3)||(row.entity.estatus==4)) && row.entity.idTipoPago == 1"><button class="btn btn-default" ><span class="glyphicon glyphicon-list-alt"  ng-click="grid.appScope.GenerarArchivoBtn(row.entity.idEmpresa, row.entity.idLotePago)"></span></button></div>' },
            { name: 'numdetalle', displayName: 'Total Documentos', width: '15%', enableCellEdit: false },
            { name: 'numpendiente', displayName: 'No Aplicados', width: '10%', enableCellEdit: false },
            { name: 'numaplicado', displayName: 'Aplicados', width: '10%', enableCellEdit: false },
            { name: 'cuentaPago', displayName: 'Banco Pago', width: '10%', enableCellEdit: false },
            { name: 'buscar', displayName: 'Buscar', width: '5%', cellTemplate: '<div><button class="btn btn-warning" ><span class="glyphicon glyphicon-search" ng-click="grid.appScope.ConsultaLoteObtieneTesoreria(row.entity,0,0)"></span></button></div>' },


        ];

        $scope.gridtesoreriaoptions.multiSelect = false;
        $scope.gridtesoreriaoptions.modifierKeysToMultiSelect = false;
        $scope.gridtesoreriaoptions.noUnselect = true;
        $scope.gridtesoreriaoptions.onRegisterApi = function(gridApi) {
            $scope.gridApiLote = gridApi;
        };
    }


    $scope.ActualizarCartera = function() {
        $scope.isDisabled = true;
        pagoRepository.UpdateCartera($rootScope.idEmpresa).then(function successCallback(response) {
            console.log(response.data);
            if (response.data.length == 0) {
                $scope.isDisabled = false;
            }
            $scope.isDisabled = false;
        }, function errorCallback(response) {
            $scope.isDisabled = false;

        });
    }

    $scope.BuscarLotesxFecha = function(fechaini, fechafin) {


        var fecha_ini = $scope.formatDate(fechaini);
        var fecha_fin = $scope.formatDate(fechafin);

        $rootScope.varfechaini = fecha_ini;
        $rootScope.varfechafin = fecha_fin;

        //pagoRepository.getLotesxFecha($rootScope.idEmpresa, $scope.idUsuario, fecha_ini, fecha_fin, 0)
        pagoNodeRepository.getLotesxFecha($rootScope.idEmpresa, $scope.idUsuario, fecha_ini, fecha_fin, 0)

            .then(function successCallback(response) {
                $rootScope.gridLotesoptions.data = response.data;

                if (response.data.length == 0) {
                    alertFactory.infoTopFull('No existen lotes para este rango de fechas');
                }

            }, function errorCallback(response) {
                alertFactory.error('Error al obtener los datos del encabezado.');
            });
    }

    $scope.BuscarLotesxFechaTesoreria = function(fechaini, fechafin) {


        var fecha_ini = $scope.formatDate(fechaini);
        var fecha_fin = $scope.formatDate(fechafin);

        //pagoRepository.getLotesxFecha($rootScope.idEmpresa, $scope.idUsuario, fecha_ini, fecha_fin, 3)
        pagoNodeRepository.getLotesxFecha($rootScope.idEmpresa, $scope.idUsuario, fecha_ini, fecha_fin, 3)
            .then(function successCallback(response) {
                $scope.gridtesoreriaoptions.data = response.data;

                if (response.data.length == 0) {
                    alertFactory.infoTopFull('No existen lotes para este rango de fechas');
                }

            }, function errorCallback(response) {
                alertFactory.error('Error al obtener los datos del encabezado.');
            });
    }


    $scope.ConsultaLoteObtieneBusqueda = function(Lote, index, esAplicacionDirecta) {

        $scope.LlenaIngresos();
        $scope.selbancoPagoLote($scope.egresos, Lote.bancoPagador);
        $scope.llenagridxvencer($rootScope.idEmpresa)
        $scope.llenagridenRojo($rootScope.idEmpresa)
        $scope.hidebuscando = true;

        $scope.idLote = Lote.idLotePago;
        $scope.grdnoPagable = 0;
        $scope.idLotePadre = Lote.idLotePago;
        $scope.nombreLote = Lote.nombre;
        $scope.estatusLote = Lote.estatus;
        $scope.NuevoLote = false;
        if (Lote.pal_esAplicacionDirecta == 1 || esAplicacionDirecta == 1) {
            $scope.pagoDirectoSeleccion = true;
            $scope.selPlantaBanco = true;

        } else {
            $scope.pagoDirectoSeleccion = false;
            $scope.selPlantaBanco = false;

        }
        if ($scope.estatusLote == 2) {
            $scope.expaprobado = true;
        } else {
            $scope.expaprobado = false;
        }

        $scope.LlenaIngresos();
        pagoRepository.getOtrosIngresos($scope.idLote)
            .then(function successCallback(response) {
                $scope.caja = 0;
                $scope.cobrar = 0;
                if (response.data.length > 0) {
                    $scope.caja = response.data[0].pio_caja;
                    $scope.cobrar = response.data[0].pio_cobranzaEsperada;
                }
            }, function errorCallback(response) {
                alertFactory.error('Error al obtener Otros Ingresos.');
            });
        pagoRepository.getTransferencias($scope.idLote)
            .then(function successCallback(response) {
                $scope.transferencias = [];
                if (response.data.length > 0) {
                    angular.forEach(response.data, function(transferencia, key) {
                        var newTransferencia = transferencia;
                        $scope.transferencias.push(newTransferencia);
                    });
                } else {
                    var newTransferencia = { bancoOrigen: '', bancoDestino: '', importe: 0, index: index };
                    $scope.transferencias.push(newTransferencia);
                }
            }, function errorCallback(response) {
                alertFactory.error('Error al obtener Transferencias.');
            });
        if ($scope.estatusLote == 0) { //LQMA 08042016 entra cuando el lote es nuevo
            $scope.gridOptions.data = $scope.datosModal; //$scope.modalSeleccionados;

            $scope.gridOptions.isRowSelectable = function(row) {
                if (row.entity.seleccionable == 'True') {
                    return false;
                } else {
                    return true;
                }
            };
            $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
            $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.EDIT);


            $('#btnTotalxEmpresa').button('reset');
            if ($scope.crearLote) {
                // $('#inicioModal').modal('hide');
                $scope.crearLote = false;
            }
            //$scope.selectAll(0);
        } else //LQMA 08042016 entra cuando se consulta un lote guardado
            pagoRepository.getDatosAprob($scope.idLote)
            .success(llenaLoteConsultaSuccessCallback) //LQMA 08042016.success(llenaGridSuccessCallback)
            .error(errorCallBack);
        setTimeout(function() {
            $("#btnSelectAll").click(); //$scope.selectAll();
            $rootScope.verlote = false;
            $rootScope.vermodal = true;
            $rootScope.verbusqueda = true;
            $rootScope.vermonitor = true;
            $rootScope.verunificacion = true;
            $scope.calculaTotalOperaciones();
            recalculaIngresos();
        }, 500);

        if ($scope.estatusLote < 2) {
            setTimeout(function() {
                pagoRepository.getDatos($rootScope.idEmpresa)
                    .success(getCarteraModificar)
                    .error(errorCallBack);
            }, 200);
        }



    }


    $scope.ConsultaLoteObtieneTesoreria = function(Lote, index, esAplicacionDirecta) {

        $scope.LlenaIngresos();
        $scope.btnsTesoreria = true;
        $scope.selbancoPagoLote($scope.egresos, Lote.bancoPagador);
        $scope.llenagridxvencer($rootScope.idEmpresa)
        $scope.llenagridenRojo($rootScope.idEmpresa)
        $scope.hidebuscando = true;
        //$('#inicioModal').modal('hide');
        $scope.idLote = Lote.idLotePago;
        $scope.grdnoPagable = 0;
        $scope.idLotePadre = Lote.idLotePago;
        $scope.nombreLote = Lote.nombre;
        $scope.estatusLote = Lote.estatus;
        $scope.NuevoLote = false;
        if (Lote.pal_esAplicacionDirecta == 1 || esAplicacionDirecta == 1) {
            $scope.pagoDirectoSeleccion = true;
            $scope.selPlantaBanco = true;

        } else {
            $scope.pagoDirectoSeleccion = false;
            $scope.selPlantaBanco = false;

        }
        if ($scope.estatusLote == 2) {
            $scope.expaprobado = true;
        } else {
            $scope.expaprobado = false;
        }

        $scope.LlenaIngresos();
        pagoRepository.getOtrosIngresos($scope.idLote)
            .then(function successCallback(response) {
                $scope.caja = 0;
                $scope.cobrar = 0;
                if (response.data.length > 0) {
                    $scope.caja = response.data[0].pio_caja;
                    $scope.cobrar = response.data[0].pio_cobranzaEsperada;
                }
            }, function errorCallback(response) {
                alertFactory.error('Error al obtener Otros Ingresos.');
            });
        pagoRepository.getTransferencias($scope.idLote)
            .then(function successCallback(response) {
                $scope.transferencias = [];
                if (response.data.length > 0) {
                    angular.forEach(response.data, function(transferencia, key) {
                        var newTransferencia = transferencia;
                        $scope.transferencias.push(newTransferencia);
                    });
                } else {
                    var newTransferencia = { bancoOrigen: '', bancoDestino: '', importe: 0, index: index };
                    $scope.transferencias.push(newTransferencia);
                }
            }, function errorCallback(response) {
                alertFactory.error('Error al obtener Transferencias.');
            });
        if ($scope.estatusLote == 0) { //LQMA 08042016 entra cuando el lote es nuevo
            $scope.gridOptions.data = $scope.datosModal; //$scope.modalSeleccionados;

            $scope.gridOptions.isRowSelectable = function(row) {
                if (row.entity.seleccionable == 'True') {
                    return false;
                } else {
                    return true;
                }
            };
            $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
            $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.EDIT);


            $('#btnTotalxEmpresa').button('reset');
            if ($scope.crearLote) {
                // $('#inicioModal').modal('hide');
                $scope.crearLote = false;
            }
            //$scope.selectAll(0);
        } else //LQMA 08042016 entra cuando se consulta un lote guardado
            pagoRepository.getDatosAprob($scope.idLote)
            .success(llenaLoteConsultaSuccessCallback) //LQMA 08042016.success(llenaGridSuccessCallback)
            .error(errorCallBack);
        setTimeout(function() {
            $("#btnSelectAll").click(); //$scope.selectAll();
            $rootScope.verlote = false;
            $rootScope.vermodal = true;
            $rootScope.verbusqueda = true;
            $rootScope.vermonitor = true;
            $rootScope.verunificacion = true;
        }, 500);

        if ($scope.estatusLote < 2) {
            setTimeout(function() {
                pagoRepository.getDatos($rootScope.idEmpresa)
                    .success(getCarteraModificar)
                    .error(errorCallBack);
            }, 200);
        }



    }

    $scope.IniciaLotePD = function() {
        $scope.crearLote = true;
        $scope.pagoDirectoSeleccion = true;
        $scope.selPlantaBanco = true;
        $('#btnCrealotePD').button('loading');
        if ($scope.formData.nombreLoteNuevo == null) {
            alertFactory.warning('Debe proporcionar el nombre del nuevo lote.');
            $('#btnCrealotePD').button('reset');
        } else {
            //Configura GRID ECG
            $scope.gridOptions = null;
            ConfiguraGrid();
            ConfiguraGridxvencer();
            ConfiguraGridenRojo();

            //LQMA 10032016
            $scope.NuevoLote = true;
            //LQMA add 08042016
            pagoRepository.getDatos($rootScope.idEmpresa)
                .success(getCarteraCallback)
                .error(errorCallBack);
        }
    }; //FIN inicia Lote

    $scope.ProgramacionPagos = function() {

        $scope.ObtieneLotes(0);
        //LQMA 15032016
        $scope.LlenaIngresos();

        $scope.accionPagina = true;
        setTimeout(function() {
            $("#btnSelectAll").click(); //$scope.selectAll();
            $rootScope.verlote = false;
            $rootScope.vermodal = true;
            $rootScope.verbusqueda = true;
            $rootScope.vermonitor = true;
            $rootScope.verunificacion = true;
        }, 500);
        $scope.grdinicia = $scope.grdinicia + 1;

    }

    $scope.TraeLoteActualizar = function(idLote) {

        $scope.ObtieneLotes(idLote);
        //LQMA 15032016
        $scope.LlenaIngresos();

        $scope.accionPagina = true;
        setTimeout(function() {
            $("#btnSelectAll").click(); //$scope.selectAll();
            $rootScope.verlote = false;
            $rootScope.vermodal = true;
            $rootScope.verbusqueda = true;
            $rootScope.vermonitor = true;
            $rootScope.verunificacion = true;
        }, 500);
        $scope.grdinicia = $scope.grdinicia + 1;

    }



    $scope.llenaGrid = function() {
        //LQMA 16032016
        if (!$scope.showGrid) { //LQMA  si esta oculto, consultamos toda la cartera
            pagoRepository.getDatos($rootScope.idEmpresa)
                .success(llenaGridSuccessCallback)
                .error(errorCallBack);

        } else
            pagoRepository.getDatos($rootScope.idEmpresa)
            .success(llenaGridSuccessCallback)
            .error(errorCallBack);
    }; //Propiedades



    //FAL20042016 cuando no hay lotes creados
    var getCarteraCallback = function(data, status, headers, config) {
        //FAL fecha no presentada y contadores
        $scope.data = data;
        $scope.carteraVencida = 0;
        $scope.cantidadTotal = 0;
        $scope.cantidadUpdate = 0;
        $scope.noPagable = 0;
        $scope.Reprogramable = 0;
        $scope.TotalSaldoPagar = 0;
        var contador = 1;

        $scope.pdPlanta = $scope.escenarios.Pdplanta;
        $scope.pdBanco = $scope.escenarios.Pdbanco;
        $scope.refPlanta = $scope.escenarios.TipoRefPlanta;
        $scope.refpdBanco = $scope.escenarios.tipoRefBanco;
        $scope.grdPagoDirecto = [];
        var j = 0;
        var tamdata = $scope.data.length;
        for (var i = 0; i < tamdata; i++) {


            $scope.TotalSaldoPagar = $scope.TotalSaldoPagar + $scope.data[i].saldo;
            $scope.data[i].Pagar = $scope.data[i].saldo;
            $scope.data[i].fechaPago = $scope.data[i].fechaPromesaPago;
            $scope.data[i].agrupar = 0;



            if ($scope.data[i].fechaPromesaPago == "1900-01-01T00:00:00") {
                $scope.data[i].fechaPromesaPago = "";
            }

            //FAL 23052016 dependiendo la lista de 
            if ($scope.pdPlanta) {
                if ($scope.data[i].idProveedor == 7) {
                    $scope.data[i].referencia = 'Planta';
                    var datadirecto = $scope.data[i];
                    $scope.grdPagoDirecto.push(datadirecto);
                } else {
                    $scope.data[i].referencia = '';
                }
            }
            if ($scope.pdPlanta) {
                if ($scope.data[i].idProveedor == 6) {
                    $scope.data[i].referencia = 'Financiera';
                    var datadirecto = $scope.data[i];
                    $scope.grdPagoDirecto.push(datadirecto);
                }
            }
            if ($scope.pdBanco) {
                if ($scope.data[i].esBanco == 'true') {
                    $scope.data[i].referencia = 'Banco';
                }
            }

            if ($scope.data[i].seleccionable == "False") {
                $scope.data[i].estGrid = 'Pago';
            }

            if ($scope.data[i].seleccionable == 'True') {
                $scope.data[i].Pagar = $scope.data[i].saldo;
                $scope.data[i].estGrid = 'No pagar';
            }

            if ($scope.data[i].documentoPagable == 'False') {
                $scope.data[i].Pagar = $scope.data[i].saldo;
            }

            // if (($scope.data[i].numeroSerie).length == 17) {
            //     $scope.data[i].referencia = $scope.data[i].numeroSerie.substring(9, 17);
            // }

            if (($scope.data[i].autorizado == 1) && ($scope.data[i].seleccionable == "False")) {
                $scope.data[i].seleccionable = 'False';
            } else {
                $scope.data[i].seleccionable = 'True';
            }

            if ($scope.data[i].convenioCIE === '') {
                $scope.data[i].agrupar = 0;
            } else {
                $scope.data[i].seleccionable == "False";
                $scope.data[i].estGrid = 'Pago';
            }

            $scope.data[i].agrupar = 0;
            $scope.data[i].numagrupar = i;
            //FAL17052016 Valido si lleva numero de serie y si es de lenght = 17 lo pango en referencia.
            $scope.carteraVencida = $scope.carteraVencida + $scope.data[i].saldo;


        }
        $scope.noPagable = $scope.carteraVencida - $scope.cantidadTotal;

        //FAL 20062016 separación de cartera en caso de pago directo

        if ($scope.selPlantaBanco) {

            $scope.datosModal = $scope.grdPagoDirecto;

        } else {
            $scope.datosModal = $scope.data;

        }

        var newLote = { idLotePago: '0', idEmpresa: $rootScope.idEmpresa, idUsuario: $rootScope.currentEmployee, fecha: '', nombre: $scope.formData.nombreLoteNuevo, estatus: 0 };
        $scope.ObtieneLotes(newLote);
        $scope.LlenaIngresos();
        $scope.estatusLote = 0;
        //LQMA 15032016
        $scope.accionPagina = true;
        $scope.grdApagar = 0;
        //FAL 19042016 llena totales de bancos desde la consulta
        $scope.grdBancos = [];
        $scope.grdApagar = 0;
        $scope.bancosCompletas.forEach(function(banco, k) {
            $scope.grdBancos.push({
                banco: banco.cuentaPagadora,
                subtotalLote: 0,
                subtotal: banco.sumaSaldoPagable
            });
            $scope.grdApagar = $scope.grdApagar + banco.sumaSaldoPagable;
        });
        $scope.blTotales = true;
        $scope.idOperacion = 0;
        //FAL grid  x vencer


    };


    var getCarteraModificar = function(data, status, headers, config) {
        //FAL fecha no presentada y contadores
        $scope.data = data;

        var j = 0;
        var tamdata = $scope.data.length;
        for (var i = 0; i < tamdata; i++) {

            $scope.data[i].Pagar = $scope.data[i].saldo;
            $scope.data[i].fechaPago = $scope.data[i].fechaPromesaPago;
            $scope.data[i].agrupar = 0;
            if ($scope.data[i].fechaPromesaPago == "1900-01-01T00:00:00") {
                $scope.data[i].fechaPromesaPago = "";
            }

            //FAL 23052016 dependiendo la lista de 
            if ($scope.pdPlanta) {
                if ($scope.data[i].idProveedor == 7) {
                    $scope.data[i].referencia = 'Planta';
                    var datadirecto = $scope.data[i];
                    $scope.grdPagoDirecto.push(datadirecto);
                } else {
                    $scope.data[i].referencia = '';
                }
            }
            if ($scope.pdPlanta) {
                if ($scope.data[i].idProveedor == 6) {
                    $scope.data[i].referencia = 'Financiera';
                    var datadirecto = $scope.data[i];
                    $scope.grdPagoDirecto.push(datadirecto);
                }
            }
            if ($scope.pdBanco) {
                if ($scope.data[i].esBanco == 'true') {
                    $scope.data[i].referencia = 'Banco';
                }
            }

            if ($scope.data[i].seleccionable == "False") {
                //$scope.data[i].estGrid = 'Pago';
            }

            if ($scope.data[i].seleccionable == 'True') {
                $scope.data[i].Pagar = $scope.data[i].saldo;
                $scope.data[i].estGrid = 'No pagar';
            }

            if ($scope.data[i].documentoPagable == 'False') {
                $scope.data[i].Pagar = $scope.data[i].saldo;
            }

            // if (($scope.data[i].numeroSerie).length == 17) {
            //     $scope.data[i].referencia = $scope.data[i].numeroSerie.substring(9, 17);
            // }
            $scope.data[i].agrupar = 0;
            $scope.data[i].numagrupar = i;
        }

        $scope.gridOptions.data = $scope.gridOptions.data.concat($scope.data);
        $scope.btnactualizar = 'Actualizar';
    };



    $scope.llenagridxvencer = function(idempresa) {

        $scope.GranTotalxvencer = 0;
        $scope.GranTotalxvencerPagable = 0;
        $scope.GranTotalxvencerNopagable = 0;
        pagoRepository.getDatosxvencer(idempresa)
            .then(function successCallback(response) {

                $scope.gridXvencer.data = response.data;
                var tamdata = $scope.gridXvencer.data.length;
                for (var i = 0; i < tamdata; i++) {

                    if ($scope.gridXvencer.data[i].seleccionable == "False") {
                        $scope.gridXvencer.data[i].estGrid = 'XVENCERPAGABLE';
                        $scope.GranTotalxvencerPagable = $scope.GranTotalxvencerPagable + $scope.gridXvencer.data[i].saldo;
                    } else {
                        $scope.GranTotalxvencerNopagable = $scope.GranTotalxvencerNopagable + $scope.gridXvencer.data[i].saldo;
                    }


                }


            }, function errorCallback(response) {

                $scope.gridXvencer.data = [];

            });
    };


    $scope.llenagridenRojo = function(idempresa) {

        $scope.GranTotalenRojo = 0;
        pagoRepository.getDatosenRojo(idempresa)
            .then(function successCallback(response) {

                $scope.gridenRojo.data = response.data;
                var tamdata = $scope.gridenRojo.data.length;
                for (var i = 0; i < tamdata; i++) {


                    $scope.GranTotalenRojo = $scope.GranTotalenRojo + $scope.gridenRojo.data[i].saldo;

                }


            }, function errorCallback(response) {

                $scope.gridenRojo.data = [];

            });
    };



    //LQMA ADD 08042016 Cuando ya existe un lote.
    var llenaLoteConsultaSuccessCallback = function(data, status, headers, config) {
        $scope.grdBancos = [];
        $scope.grdApagar = 0;
        if ($scope.gridOptions == null)

            ConfiguraGrid();
        ConfiguraGridxvencer();
        ConfiguraGridenRojo();

        $scope.gridOptions.data = null;
        $scope.gridOptions.data = data;
        $scope.data = data;
        $scope.carteraVencida = 0;
        $scope.cantidadTotal = 0;
        $scope.cantidadUpdate = 0;
        $scope.noPagable = 0;
        $scope.Reprogramable = 0;

        $scope.pdPlanta = $scope.escenarios.Pdbanco;
        $scope.pdBanco = $scope.escenarios.Pdplanta;
        $scope.refPlanta = $scope.escenarios.TipoRefPlanta;
        $scope.refpdBanco = $scope.escenarios.tipoRefBanco;

        var cuentaEncontrada = true;
        for (var i = 0; i < $scope.data.length; i++) {

            $scope.data[i].Pagar = $scope.data[i].saldo;
            $scope.data[i].fechaPago = $scope.data[i].fechaPromesaPago;
            if ($scope.data[i].fechaPromesaPago == "1900-01-01T00:00:00") {
                $scope.data[i].fechaPromesaPago = "";
                var Pagoxvencer = $scope.data[i];
                //$scope.grdPagoxvencer.push(Pagoxvencer);
            }

            if ($scope.data[i].agrupamiento > 0) {
                $scope.data[i].agrupar = true;

            } else {
                $scope.data[i].agrupar = false;
            }

            if ($scope.data[i].seleccionable == "False") {
                $scope.data[i].estGrid = 'Pago';
                if (i == 0) {
                    $scope.grdBancos.push({
                        banco: $scope.data[i].cuentaPagadora,
                        subtotal: $scope.data[i].Pagar
                    });
                    $scope.grdApagar = $scope.grdApagar + $scope.data[i].Pagar;
                } else {
                    cuentaEncontrada = false;
                    $scope.grdBancos.forEach(function(banco, k) {
                        if ($scope.data[i].cuentaPagadora == $scope.grdBancos[k].banco) {
                            $scope.grdBancos[k].subtotal = Math.round($scope.grdBancos[k].subtotal * 100) / 100 + Math.round($scope.data[i].Pagar * 100) / 100;
                            $scope.grdApagar = $scope.grdApagar + Math.round($scope.data[i].Pagar * 100) / 100;
                            cuentaEncontrada = true;
                        }
                    });
                    if (!cuentaEncontrada) {
                        $scope.grdBancos.push({
                            banco: $scope.data[i].cuentaPagadora,
                            subtotal: $scope.data[i].Pagar
                        });
                        $scope.grdApagar = $scope.grdApagar + $scope.data[i].Pagar;
                    }
                }
            }
            if ($scope.data[i].seleccionable == 'True') {
                $scope.data[i].Pagar = $scope.data[i].saldo;
                $scope.data[i].estGrid = 'No pagar';
            }
            if ($scope.data[i].documentoPagable == 'False') {
                $scope.data[i].Pagar = $scope.data[i].saldo;
            }
            // $scope.data[i].agrupar = 0;
            $scope.data[i].numagrupar = i;
            $scope.carteraVencida = $scope.carteraVencida + $scope.data[i].saldo;
        }
        $scope.noPagable = $scope.carteraVencida - $scope.cantidadTotal;

        $scope.gridOptions.data = data;
        $scope.gridXvencer.data = data;
        $scope.blTotales = false;
    };
    var setGroupValues = function(columns, rows) {
        columns.forEach(function(column) {
            if (column.grouping && column.grouping.groupPriority > -1 && column.treeAggregation.type !== uiGridGroupingConstants.aggregation.CUSTOM) {
                column.treeAggregation.type = uiGridGroupingConstants.aggregation.CUSTOM;
                column.customTreeAggregationFn = function(aggregation, fieldValue, numValue, row) {
                    if (typeof(aggregation.value) === 'undefined') {
                        aggregation.value = 0;
                    }
                    aggregation.value = aggregation.value + row.entity.Pagar;
                };
                column.customTreeAggregationFinalizerFn = function(aggregation) {
                    if (typeof(aggregation.groupVal) !== 'undefined') {
                        aggregation.rendered = aggregation.groupVal + ' (' + $filter('currency')(aggregation.value) + ')';
                    } else {
                        aggregation.rendered = null;
                    }
                };
            }
        });
        return columns;
    };
    //Funcion para que obligue a editar la referencia si tiene convenio CIE.

    var cellEditableCIE = function($scope) {
        if ($scope.row.entity.convenioCIE === '')
            return false;
        else {
            $scope.row.entity.seleccionable == "False"
            $scope.row.entity.estGrid = 'Pago';
            return true;
        }
    }


    //FAL crea los campos del grid y las rutinas en los eventos del grid.
    var ConfiguraGrid = function() {

        $scope.idEmpleado = $rootScope.currentEmployee;
        $scope.gridOptions = {
            enableColumnResize: true,
            enableRowSelection: true,
            enableGridMenu: true,
            enableFiltering: true,
            enableGroupHeaderSelection: true,
            treeRowHeaderAlwaysVisible: false,
            showColumnFooter: false,
            showGridFooter: false,
            height: 900,
            cellEditableCondition: function($scope) {
                return $scope.row.entity.seleccionable;
            },
            isRowSelectable: function(row) {
                if (row.entity.seleccionable == "True") return false; //rirani is not selectable
                return true; //everyone else is
            },
            columnDefs: [{
                    name: 'nombreAgrupador',
                    grouping: { groupPriority: 0 },
                    sort: { priority: 0, direction: 'asc' },
                    width: '15%',
                    displayName: 'Grupo',
                    enableCellEdit: false,
                    cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
                }, {
                    name: 'proveedor',
                    grouping: { groupPriority: 1 },
                    sort: { priority: 1, direction: 'asc' },
                    width: '40%',
                    displayName: 'Proveedor',
                    enableCellEdit: false,
                    cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
                },
                { name: 'idProveedor', displayName: 'Clave', width: '5%', enableCellEdit: false, headerTooltip: 'Nombre del provedor', cellClass: 'cellToolTip' }, ,
                {
                    name: 'saldo',
                    displayName: 'Saldo',
                    width: '15%',
                    cellFilter: 'currency',
                    enableCellEdit: false,
                    treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
                    customTreeAggregationFinalizerFn: function(aggregation) {
                        aggregation.rendered = aggregation.value
                    }
                },
                { name: 'documento', displayName: '# Documento', width: '15%', enableCellEdit: false, headerTooltip: 'Documento # de factura del provedor', cellClass: 'cellToolTip', cellTemplate: '<div style="text-align: center;"><span align="center"><a class="urlTabla" href ng-click="grid.appScope.VerDocumento(row.entity)">{{row.entity.documento}}</a></span></div>' },
                {
                    name: 'agrupar',
                    field: 'agrupar',
                    displayName: 'No agrupar',
                    width: '8%',
                    type: 'boolean',
                    cellTemplate: '<input type="checkbox" ng-model="row.entity.agrupar">'
                },
                { name: 'ordenCompra', displayName: 'Orden de compra', width: '13%', enableCellEdit: false, cellTemplate: '<div class="urlTabla" ng-class="col.colIndex()" ><a tooltip="Ver en digitalización" class="urlTabla" href="http://192.168.20.92:3200/?id={{row.entity.ordenCompra}}&employee=' + $scope.idEmpleado + '&proceso=1" target="_new">{{row.entity.ordenCompra}}</a></div>' },
                { name: 'monto', displayName: 'Monto', width: '10%', cellFilter: 'currency', enableCellEdit: false },
                {
                    name: 'Pagar',
                    field: 'Pagar',
                    displayName: 'Pagar (total)',
                    width: '10%',
                    cellFilter: 'currency',
                    enableCellEdit: ($scope.currentIdOp == 1) ? false : true,
                    editableCellTemplate: '<div><form name="inputForm"><input type="number" ng-class="\'colt\' + col.uid" ui-grid-editor ng-model="MODEL_COL_FIELD"></form></div>'
                },
                { name: 'cuentaPagadora', width: '10%', displayName: 'Banco Origen', enableCellEdit: false },
                { name: 'cuenta', width: '15%', displayName: '# Cuenta', enableCellEdit: false },
                { name: 'fechaPromesaPago', displayName: 'Fecha Promesa de Pago', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '15%' },
                {
                    name: 'referencia',
                    displayName: 'Referencia',
                    width: '10%',
                    visible: true,
                    enableCellEdit: true
                },
                { name: 'tipo', width: '15%', displayName: 'Tipo', enableCellEdit: false },
                { name: 'tipodocto', width: '15%', displayName: 'Tipo Documento', enableCellEdit: false },
                { name: 'cartera', width: '15%', displayName: 'Cartera', enableCellEdit: false },
                { name: 'moneda', width: '10%', displayName: 'Moneda', enableCellEdit: false },
                { name: 'numeroSerie', width: '20%', displayName: 'N Serie', enableCellEdit: false },
                { name: 'facturaProveedor', width: '20%', displayName: 'Factura Proveedor', enableCellEdit: false },
                { name: 'fechaVencimiento', displayName: 'Fecha de Vencimiento', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '17%', enableCellEdit: false },
                { name: 'fechaRecepcion', displayName: 'Fecha Recepción', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '17%', enableCellEdit: false },
                { name: 'fechaFactura', displayName: 'Fecha Factura', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '17%', enableCellEdit: false },
                { name: 'saldoPorcentaje', field: 'saldoPorcentaje', displayName: 'Porcentaje %', width: '10%', cellFilter: 'number: 6', enableCellEdit: false },
                { name: 'estatus', displayName: 'Estatus', width: '10%', enableCellEdit: false },
                { name: 'anticipo', displayName: 'Anticipo', width: '10%', enableCellEdit: false },
                { name: 'anticipoAplicado', displayName: 'Anticipo Aplicado', width: '15%', enableCellEdit: false },
                { name: 'documentoPagable', width: '15%', displayName: 'Estatus del Documento', visible: false, enableCellEdit: false },
                { name: 'ordenBloqueada', displayName: 'Bloqueada', width: '20%', enableCellEdit: false },
                { name: 'fechaPago', displayName: 'fechaPago', width: '20%', visible: false, enableCellEdit: false },
                { name: 'estGrid', width: '15%', displayName: 'Estatus Grid', enableCellEdit: false },
                { name: 'seleccionable', displayName: 'seleccionable', width: '20%', enableCellEdit: false, visible: false },
                {
                    name: 'cuentaDestino',
                    displayName: 'Cuenta Destino',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    width: '20%',
                    editDropdownOptionsFunction: function(rowEntity, colDef) {
                        if (rowEntity.cuentaDestino === 'bar') {
                            return [{ id: 'SIN CUENTA', value: 'SIN CUENTA' }];
                        } else {
                            var index;
                            var bancosArray = rowEntity.cuentaDestinoArr.split(',');
                            var bancoSalida = [];

                            for (index = 0; index < bancosArray.length; ++index) {
                                var obj = {};
                                obj.id = bancosArray[index];
                                obj.value = bancosArray[index];
                                bancoSalida.push(obj);
                            }
                            return bancoSalida;
                        }
                    }
                },
                { name: 'idEstatus', displayName: 'idEstatus', width: '20%', enableCellEdit: false, visible: true },
                { name: 'tipoCartera', displayName: 'tipoCartera', width: '20%', enableCellEdit: false, visible: true },
                { name: 'numagrupar', displayName: 'numagrupar', width: '20%', enableCellEdit: false, visible: false },
                { name: 'bancoPagador', displayName: 'bancoPagador', width: '20%', enableCellEdit: false, visible: false },
                { name: 'autorizado', displayName: 'Cuenta Autorizada', width: '20%', enableCellEdit: false, visible: true, cellTemplate: '<div ng-if="row.entity.autorizado == 1">Autorizado</div><div ng-if="row.entity.autorizado == 0">No autorizado</div>' }
            ],

            rowTemplate: '<div ng-class="{\'ordenBloqueada\':(row.entity.ordenBloqueada==\'True\' && ((row.entity.idEstatus < 1 || row.entity.idEstatus > 5) && row.entity.idEstatus != 20) && !row.isSelected)' +
                ',\'bloqueadaSelec\': (row.isSelected && row.entity.ordenBloqueada==\'True\') || (row.isSelected && ((row.entity.idEstatus >= 1 && row.entity.idEstatus <= 5) || row.entity.idEstatus == 20)),' +
                '\'bancocss\': (row.entity.referencia==\'Banco\'),' +
                '\'plantacss\': (row.entity.referencia==\'Planta\'),' +
                '\'selectNormal\': (row.isSelected && row.entity.ordenBloqueada==\'False\' && ((row.entity.idEstatus < 1 || row.entity.idEstatus > 5) && row.entity.idEstatus != 20))' +
                ',\'docIncompletos\': (!row.isSelected && ((row.entity.idEstatus >= 1 && row.entity.idEstatus <= 5) || row.entity.idEstatus == 20) && row.entity.ordenBloqueada==\'False\')' +
                ',\'bloqDocIncom\': (!row.isSelected && ((row.entity.idEstatus >= 1 && row.entity.idEstatus <= 5) || row.entity.idEstatus == 20) && row.entity.ordenBloqueada==\'True\')' +
                ',\'ordenBloqueada\':(row.entity.ordenBloqueada==\'True\' && ((row.entity.idEstatus < 1 || row.entity.idEstatus > 5) && row.entity.idEstatus != 20) && !row.isSelected)' +
                '}"> <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader == \'True\'}" ui-grid-cell></div></div>',

            onRegisterApi: function(gridApi1) {
                $scope.gridApi1 = gridApi1;
                //FAL14042016 Marcado de grupos y proveedores
                gridApi1.selection.on.rowSelectionChanged($scope, function(row, rows) {
                    if (row.internalRow == true && row.isSelected == true) {
                        var childRows = row.treeNode.children;
                        for (var j = 0, length = childRows.length; j < length; j++) {
                            $scope.selectAllChildren(gridApi1, childRows[j]);
                        }
                    }
                    if (row.internalRow == true && row.isSelected == false) {
                        var childRows = row.treeNode.children;
                        for (var j = 0, length = childRows.length; j < length; j++) {
                            $scope.unSelectAllChildren(gridApi1, childRows[j]);
                        }
                    }
                    if (row.internalRow == undefined && row.isSelected == true && row.entity.seleccionable == "False") {
                        var childRows = row.treeNode.parentRow.treeNode.children;
                        var numchilds = row.treeNode.parentRow.treeNode.aggregations[0].value;
                        var ctdSeleccionados = 0;
                        for (var j = 0; j < numchilds; j++) {
                            if (childRows[j].row.isSelected == true) {
                                ctdSeleccionados = ctdSeleccionados + 1;
                            }
                            if (ctdSeleccionados == numchilds) {
                                id = "closeMenu"
                                row.treeNode.parentRow.treeNode.row.isSelected = true;
                            }
                        }
                    }
                    if (row.internalRow == undefined && row.isSelected == false) {
                        var childRows = row.treeNode.parentRow.treeNode.children;
                        var numchildRows = row.treeNode.parentRow.treeNode.aggregations[0].value;
                        var ctdSeleccionados = 0;
                        for (var j = 0; j < numchildRows; j++) {
                            if (childRows[j].row.isSelected == true) {
                                ctdSeleccionados = ctdSeleccionados + 1;
                            }
                            if (ctdSeleccionados > 0) {
                                j = numchildRows;
                                row.treeNode.parentRow.treeNode.row.isSelected = false;
                                row.treeNode.parentRow.treeNode.parentRow.treeNode.row.isSelected = false;
                            }
                        }
                    }
                    //FAL seleccionado de padres sin afectar las sumas
                    if (row.entity.Pagar == null) {
                        var grdPagarxdocumento = 0
                    } else {
                        grdPagarxdocumento = row.entity.Pagar;
                    }
                    if (row.isSelected) {
                        $scope.grdNoIncluido = Math.round($scope.grdNoIncluido * 100) / 100 - Math.round(grdPagarxdocumento * 100) / 100;
                        if ($scope.grdNoIncluido < 0) { $scope.grdNoIncluido = 0; }
                        //FAL actualizar cuenta pagadoras
                        if ($scope.grdinicia > 0) {
                            if (row.entity.estGrid == 'Pago Reprogramado') {
                                $scope.grdReprogramado = Math.round($scope.grdReprogramado * 100) / 100 - Math.round(row.entity.Pagar * 100) / 100;
                            };

                            if ((isNaN(row.entity.Pagar)) == false) {

                                $scope.grdApagar = Math.round($scope.grdApagar * 100) / 100 + Math.round(row.entity.Pagar * 100) / 100;
                                row.entity.estGrid = 'Pago'

                            }

                        }
                    } else {
                        $scope.grdNoIncluido = Math.round($scope.grdNoIncluido * 100) / 100 + Math.round(grdPagarxdocumento * 100) / 100;
                        //FAL actualizar cuenta pagadoras
                        i = 0;
                        if ($scope.grdinicia > 0) {

                            if ((isNaN(row.entity.Pagar)) == false) {

                                $scope.grdApagar = Math.round($scope.grdApagar * 100) / 100 - Math.round(row.entity.Pagar * 100) / 100;
                                row.entity.estGrid = 'Pago'

                            }


                            //$scope.grdApagar = Math.round($scope.grdApagar * 100) / 100 - Math.round(row.entity.Pagar * 100) / 100;
                            if (row.entity.estGrid != 'Pago Reprogramado') {
                                row.entity.estGrid = 'Permitido'
                            } else {
                                $scope.grdReprogramado = Math.round($scope.grdReprogramado * 100) / 100 + Math.round(row.entity.Pagar * 100) / 100;
                            }

                        }
                    }


                });
                gridApi1.selection.on.rowSelectionChangedBatch($scope, function(rows) {
                    //FAL 29042016 cambio de seleccion de padres
                    var i = 0;
                    var numcuentas = $scope.grdBancos.length;
                    $scope.grdNoIncluido = 0;
                    if ($scope.grdinicia > 0) {
                        $scope.grdBancos.forEach(function(banco, l) {
                            $scope.grdBancos[l].subtotal = 0;
                            $scope.grdApagar = 0;
                        });
                    }
                    if ($scope.grdinicia > 0) {
                        rows.forEach(function(row, i) {
                            if (row.isSelected) {
                                if (row.entity.seleccionable == 'False') {
                                    row.entity.estGrid = 'Pago';
                                    $scope.grdNoIncluido = 0;
                                    $scope.grdApagar = Math.round($scope.grdApagar * 100) / 100 + Math.round(row.entity.Pagar * 100) / 100;
                                    //$scope.grdApagar = $scope.grdApagar + row.entity.Pagar;
                                    i = numcuentas;
                                    $scope.grdNoIncluido = 0;
                                }
                            } else {
                                if (row.entity.seleccionable == 'False') {
                                    row.entity.estGrid = 'Permitido';
                                    $scope.grdNoIncluido = $scope.grdApagarOriginal;
                                    row.treeNode.parentRow.treeNode.row.isSelected = false;
                                    row.treeNode.parentRow.treeNode.parentRow.treeNode.row.isSelected = false;
                                    $scope.grdApagar = 0;
                                }
                            }
                        });
                    }

                    $scope.calculaTotalOperaciones();
                    recalculaIngresos();

                });
                gridApi1.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
                    //FAL trabaja con las variables dependiendo si se edita o cambia la fecha
                    var i = 0;
                    var numcuentas = $scope.grdBancos.length;
                    if (rowEntity.estGrid == 'Pago' || rowEntity.estGrid == 'Pago Reprogramado') {
                        if (rowEntity.fechaPago == "1900-01-01T00:00:00") {
                            old_date = "";
                        } else {
                            old_date = new Date(rowEntity.fechaPago);
                        }
                        if (colDef.name == 'fechaPromesaPago') {
                            dtHoy = Date.now();
                            now_date = new Date($scope.formatDate(dtHoy));
                            new_date = new Date($scope.formatDate(newValue));
                            if (new_date <= now_date) {
                                alertFactory.warning('La fecha promesa de pago no puede ser menor o igual a ' + $scope.formatDate(dtHoy) + ' !!!');
                                rowEntity.fechaPromesaPago = old_date;
                                rowEntity.estGrid = 'Pago';
                            } else {
                                rowEntity.Pagar = rowEntity.saldo;
                                rowEntity.estGrid = 'Pago Reprogramado';
                                $scope.gridApi1.selection.unSelectRow(rowEntity);
                            }
                        }
                        if (colDef.name == 'Pagar') {
                            $scope.cantidadUpdate = newValue - oldValue;
                            if ((newValue > rowEntity.saldo) || (newValue <= 0)) {
                                alertFactory.warning('El pago es inválido !!!');
                                rowEntity.Pagar = oldValue;
                            } else {
                                if (rowEntity.estGrid == 'Pago Reprogramado') {
                                    $scope.grdReprogramado = Math.round($scope.grdReprogramado * 100) / 100 - Math.round(rowEntity.Pagar * 100) / 100;
                                }
                                for (var i = 0; i < numcuentas; i++) {
                                    if (rowEntity.cuentaPagadora == $scope.grdBancos[i].banco) {
                                        $scope.grdBancos[i].subtotal = Math.round($scope.grdBancos[i].subtotal * 100) / 100 + Math.round($scope.cantidadUpdate * 100) / 100;
                                        i = numcuentas;
                                    }
                                };
                                $scope.grdNoIncluido = Math.round($scope.grdNoIncluido * 100) / 100 - Math.round($scope.cantidadUpdate * 100) / 100;
                                $scope.grdApagar = Math.round($scope.grdApagar * 100) / 100 + Math.round($scope.cantidadUpdate * 100) / 100;
                                rowEntity.estGrid = 'Pago';
                                rowEntity.fechaPromesaPago = old_date;
                            }
                        }
                        //FAL valido la referencia.
                        if (colDef.name == 'referencia') {
                            if (rowEntity.convenioCIE == "")

                            {
                                if (newValue.length > 30) {
                                    alertFactory.warning('La referencia no puede tener más de 30 caracteres');
                                    rowEntity.referencia = oldValue;
                                }
                            } else {
                                if ((newValue.length < 5) || (newValue.length > 30)) {
                                    alertFactory.warning('La referencia CIE no puede tener más de 30 caracteres ni menos de 5');
                                    rowEntity.referencia = oldValue;
                                }
                            }
                        }


                    } else {
                        alertFactory.warning('Solo se pueden modificar datos de los documentos seleccionados');
                        if (colDef.name == 'Pagar') {
                            rowEntity.Pagar = oldValue;
                        }
                        if (colDef.name == 'fechaPromesaPago') {
                            rowEntity.fechaPromesaPago = oldValue;
                        }
                    }
                });
            }
        }


        // $scope.gridXvencer = $scope.gridOptions;
        //grid options
    }; //funcion


    $scope.VerDocumento = function(lote) {

        pagoRepository.getPdf(lote.polTipo, lote.annio, lote.polMes, lote.polConsecutivo, $rootScope.idEmpresa).then(function(d) {
            //Creo la URL
            var pdf = URL.createObjectURL(utils.b64toBlob(d.data[0].arrayB, "application/pdf"))
            var pdf_link = '';
            var typeAplication = '';
            var titulo = 'Poliza del documento' + lote.documento;
            //Mando a llamar la URL desde el div sustituyendo el pdf
            /////////  $("<object id='pdfDisplay' data='" + pdf + "' width='100%' height='400px' >").appendTo('#pdfContent');
            var iframe = '<div id="hideFullContent"><div onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf + '">to the PDF!</a></p></object> </div>';
            $.createModal({
                title: titulo,
                message: iframe,
                closeButton: false,
                scrollable: false
            });
            /////////$scope.loadingOrder = false; //Animacion
        });

    }

    //08042016FAL recorre cada nivel y selecciona los hijos
    $scope.formatDate = function(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('/');
    }
    $scope.selectAllChildren = function(gridApi, rowEntity) {
        if (rowEntity.children.length == 0) {
            if (rowEntity.row.entity.seleccionable == "False") {
                gridApi.selection.selectRow(rowEntity.row.entity);
                // $scope.grdApagar = Math.round($scope.grdApagar * 100) / 100 + Math.round(rowEntity.row.entity.Pagar * 100) / 100; 
            }
        } else {
            if (rowEntity.row.entity.seleccionable == "False") {
                //  $scope.grdApagar = Math.round($scope.grdApagar * 100) / 100 + Math.round(rowEntity.row.entity.Pagar * 100) / 100; 
                gridApi.selection.selectRow(rowEntity.row.entity);
            }
            var childrens = rowEntity.children;
            for (var j = 0, length = childrens.length; j < length; j++) {
                $scope.selectAllChildren(gridApi, childrens[j]);
            }
        }
    }
    //FAL recorre cada nivel y deselecciona los hijos
    $scope.unSelectAllChildren = function(gridApi, rowEntity) {
        if (rowEntity.children.length == 0) {
            gridApi.selection.unSelectRow(rowEntity.row.entity);
            $scope.grdApagar = Math.round($scope.grdApagar * 100) / 100 - Math.round(rowEntity.row.entity.Pagar * 100) / 100;

        } else {
            gridApi.selection.unSelectRow(rowEntity.row.entity);
            var childrens = rowEntity.children;
            for (var j = 0, length = childrens.length; j < length; j++) {
                $scope.unSelectAllChildren(gridApi, childrens[j]);
            }
        }
    }
    $scope.seleccionaTodo = function() {
        $scope.selectAll(0);
    }
    $scope.selecciona = function() {
        $scope.selectAll(1);
    }
    $scope.selectAll = function(opcion) {
        //FAL se analizan los registros para selccionarlos y se obtienen los totales relacionados al grid
        $scope.grdApagarOriginal = 0;
        //$scope.grdnoPagable = 0;
        $scope.etqFiltros = "Todos";
        $scope.grdinicia = 0;
        //LQMA 14032016

        $scope.gridOptions.data.forEach(function(grDatosSel, i) {
            if (grDatosSel.seleccionable == 'True') {
                $scope.grdnoPagable = Math.round($scope.grdnoPagable * 100) / 100 + Math.round(grDatosSel.saldo * 100) / 100;
            } else {
                if (opcion == 0)
                    $scope.gridApi1.selection.selectRow($scope.gridOptions.data[i]);
            };
        });


        $scope.grdReprogramado = 0;
        $scope.grdNoIncluido = 0;
        $scope.grdApagarOriginal = $scope.grdApagar;




        $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
        $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
        $scope.grdinicia = $scope.grdinicia + 1;


    };

    //FAL 06052016 funcion para tratar los escenarios en la edición del lote.

    //FAL configuracion grid x vencer
    var ConfiguraGridxvencer = function() {

        $scope.gridXvencer = {
            enableColumnResize: true,
            enableRowSelection: true,
            enableGridMenu: true,
            enableFiltering: true,
            enableGroupHeaderSelection: false,
            treeRowHeaderAlwaysVisible: true,
            showColumnFooter: true,
            showGridFooter: true,
            height: 900,
            cellEditableCondition: function($scope) {
                return $scope.row.entity.seleccionable;
            },
            columnDefs: [{
                    name: 'nombreAgrupador',
                    grouping: { groupPriority: 0 },
                    sort: { priority: 0, direction: 'asc' },
                    width: '15%',
                    displayName: 'Grupo',
                    enableCellEdit: false

                },
                {
                    name: 'idProveedor',
                    grouping: { groupPriority: 1 },
                    sort: { priority: 1, direction: 'asc' },
                    width: '5%',
                    displayName: 'Clave',
                    enableCellEdit: false,
                    cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
                },
                { name: 'proveedor', displayName: 'Proveedor', width: '15%', enableCellEdit: false, headerTooltip: 'Nombre del provedor', cellClass: 'cellToolTip' },
                { name: 'documento', displayName: '# Documento', width: '15%', enableCellEdit: false, headerTooltip: 'Documento # de factura del provedor', cellClass: 'cellToolTip' },
                { name: 'ordenCompra', displayName: 'Orden de compra', width: '13%', enableCellEdit: false, cellTemplate: '<div class="urlTabla" ng-class="col.colIndex()" ><a tooltip="Ver en digitalización" class="urlTabla" href="http://192.168.20.92:3600/?id={{row.entity.ordenCompra}}&employee=' + $scope.idEmpleado + '&proceso=1" target="_new">{{row.entity.ordenCompra}}</a></div>' },
                { name: 'monto', displayName: 'Monto', width: '15%', cellFilter: 'currency', enableCellEdit: false },
                { name: 'saldo', displayName: 'Saldo', width: '15%', cellFilter: 'currency', enableCellEdit: false }, {
                    name: 'Pagar',
                    field: 'Pagar',
                    displayName: 'Pagar (total)',
                    width: '10%',
                    cellFilter: 'currency',
                    enableCellEdit: ($scope.currentIdOp == 1) ? false : true,
                    editableCellTemplate: '<div><form name="inputForm"><input type="number" ng-class="\'colt\' + col.uid" ui-grid-editor ng-model="MODEL_COL_FIELD"></form></div>'
                },
                { name: 'cuentaPagadora', width: '10%', displayName: 'Banco Origen', enableCellEdit: false },
                { name: 'cuenta', width: '15%', displayName: '# Cuenta', enableCellEdit: false },
                { name: 'fechaPromesaPago', displayName: 'Fecha Promesa de Pago', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '15%' }, {
                    name: 'referencia',
                    displayName: 'Referencia',
                    width: '10%',
                    visible: true,
                    editableCellTemplate: "<div><form name=\"inputForm\"><input type=\"INPUT_TYPE\"  ui-grid-editor ng-model=\"MODEL_COL_FIELD\"  minlength=3 maxlength=30 required><div ng-show=\"!inputForm.$valid\"><span class=\"error\">La referencia debe tener al menos 5 caracteres</span></div></form></div>"
                },
                { name: 'tipo', width: '15%', displayName: 'Tipo', enableCellEdit: false },
                { name: 'tipodocto', width: '15%', displayName: 'Tipo Documento', enableCellEdit: false },
                { name: 'cartera', width: '15%', displayName: 'Cartera', enableCellEdit: false },
                { name: 'moneda', width: '10%', displayName: 'Moneda', enableCellEdit: false },
                { name: 'numeroSerie', width: '20%', displayName: 'N Serie', enableCellEdit: false },
                { name: 'facturaProveedor', width: '20%', displayName: 'Factura Proveedor', enableCellEdit: false },
                { name: 'fechaVencimiento', displayName: 'Fecha de Vencimiento', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '17%', enableCellEdit: false },
                { name: 'fechaRecepcion', displayName: 'Fecha Recepción', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '17%', enableCellEdit: false },
                { name: 'fechaFactura', displayName: 'Fecha Factura', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '17%', enableCellEdit: false }, {
                    name: 'SaldoPorcentaje',
                    field: 'saldoPorcentaje',
                    displayName: 'Porcentaje %',
                    width: '10%',
                    cellFilter: 'number: 6',
                    enableCellEdit: false
                },
                { name: 'estatus', displayName: 'Estatus', width: '10%', enableCellEdit: false },
                { name: 'anticipo', displayName: 'Anticipo', width: '10%', enableCellEdit: false },
                { name: 'anticipoAplicado', displayName: 'Anticipo Aplicado', width: '15%', enableCellEdit: false },
                { name: 'documentoPagable', width: '15%', displayName: 'Estatus del Documento', visible: false, enableCellEdit: false },
                { name: 'ordenBloqueada', displayName: 'Bloqueada', width: '20%', enableCellEdit: false },
                { name: 'fechaPago', displayName: 'fechaPago', width: '20%', visible: false, enableCellEdit: false },
                { name: 'estGrid', width: '15%', displayName: 'Estatus Grid', enableCellEdit: false },
                { name: 'seleccionable', displayName: 'seleccionable', width: '20%', enableCellEdit: false, visible: false },
                { name: 'cuentaDestino', displayName: 'Cuenta Destino', width: '20%', enableCellEdit: false },
                { name: 'idEstatus', displayName: 'idEstatus', width: '20%', enableCellEdit: false, visible: true },
                { name: 'tipoCartera', displayName: 'tipoCartera', width: '20%', enableCellEdit: false, visible: true }
            ]
        };




    }


    var ConfiguraGridenRojo = function() {

        $scope.gridenRojo = {
            enableColumnResize: true,
            enableRowSelection: true,
            enableGridMenu: true,
            enableFiltering: true,
            enableGroupHeaderSelection: false,
            treeRowHeaderAlwaysVisible: true,
            showColumnFooter: true,
            showGridFooter: true,
            height: 900,
            cellEditableCondition: function($scope) {
                return $scope.row.entity.seleccionable;
            },
            columnDefs: [{
                    name: 'nombreAgrupador',
                    grouping: { groupPriority: 0 },
                    sort: { priority: 0, direction: 'asc' },
                    width: '15%',
                    displayName: 'Grupo',
                    enableCellEdit: false
                }, {
                    name: 'idProveedor',
                    grouping: { groupPriority: 1 },
                    sort: { priority: 1, direction: 'asc' },
                    width: '5%',
                    displayName: 'Clave',
                    enableCellEdit: false,
                    cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
                },
                { name: 'proveedor', displayName: 'Proveedor', width: '15%', enableCellEdit: false, headerTooltip: 'Nombre del provedor', cellClass: 'cellToolTip' },
                { name: 'documento', displayName: '# Documento', width: '15%', enableCellEdit: false, headerTooltip: 'Documento # de factura del provedor', cellClass: 'cellToolTip' },
                { name: 'ordenCompra', displayName: 'Orden de compra', width: '13%', enableCellEdit: false, cellTemplate: '<div class="urlTabla" ng-class="col.colIndex()" ><a tooltip="Ver en digitalización" class="urlTabla" href="http://192.168.20.92:3600/?id={{row.entity.ordenCompra}}&employee=' + $scope.idEmpleado + '&proceso=1" target="_new">{{row.entity.ordenCompra}}</a></div>' },
                { name: 'monto', displayName: 'Monto', width: '15%', cellFilter: 'currency', enableCellEdit: false },
                { name: 'saldo', displayName: 'Saldo', width: '15%', cellFilter: 'currency', enableCellEdit: false }, {
                    name: 'Pagar',
                    field: 'Pagar',
                    displayName: 'Pagar (total)',
                    width: '10%',
                    cellFilter: 'currency',
                    enableCellEdit: ($scope.currentIdOp == 1) ? false : true,
                    editableCellTemplate: '<div><form name="inputForm"><input type="number" ng-class="\'colt\' + col.uid" ui-grid-editor ng-model="MODEL_COL_FIELD"></form></div>'
                },
                { name: 'cuentaPagadora', width: '10%', displayName: 'Banco Origen', enableCellEdit: false },
                { name: 'cuenta', width: '15%', displayName: '# Cuenta', enableCellEdit: false },
                { name: 'fechaPromesaPago', displayName: 'Fecha Promesa de Pago', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '15%' }, {
                    name: 'referencia',
                    displayName: 'Referencia',
                    width: '10%',
                    visible: true,
                    editableCellTemplate: "<div><form name=\"inputForm\"><input type=\"INPUT_TYPE\"  ui-grid-editor ng-model=\"MODEL_COL_FIELD\"  minlength=3 maxlength=30 required><div ng-show=\"!inputForm.$valid\"><span class=\"error\">La referencia debe tener al menos 5 caracteres</span></div></form></div>"
                },
                { name: 'tipo', width: '15%', displayName: 'Tipo', enableCellEdit: false },
                { name: 'tipodocto', width: '15%', displayName: 'Tipo Documento', enableCellEdit: false },
                { name: 'cartera', width: '15%', displayName: 'Cartera', enableCellEdit: false },
                { name: 'moneda', width: '10%', displayName: 'Moneda', enableCellEdit: false },
                { name: 'numeroSerie', width: '20%', displayName: 'N Serie', enableCellEdit: false },
                { name: 'facturaProveedor', width: '20%', displayName: 'Factura Proveedor', enableCellEdit: false },
                { name: 'fechaVencimiento', displayName: 'Fecha de Vencimiento', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '17%', enableCellEdit: false },
                { name: 'fechaRecepcion', displayName: 'Fecha Recepción', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '17%', enableCellEdit: false },
                { name: 'fechaFactura', displayName: 'Fecha Factura', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '17%', enableCellEdit: false }, {
                    name: 'saldoPorcentaje',
                    field: 'saldoPorcentaje',
                    displayName: 'Porcentaje %',
                    width: '10%',
                    cellFilter: 'number: 6',
                    enableCellEdit: false
                },
                { name: 'estatus', displayName: 'Estatus', width: '10%', enableCellEdit: false },
                { name: 'anticipo', displayName: 'Anticipo', width: '10%', enableCellEdit: false },
                { name: 'anticipoAplicado', displayName: 'Anticipo Aplicado', width: '15%', enableCellEdit: false },
                { name: 'documentoPagable', width: '15%', displayName: 'Estatus del Documento', visible: false, enableCellEdit: false },
                { name: 'ordenBloqueada', displayName: 'Bloqueada', width: '20%', enableCellEdit: false },
                { name: 'fechaPago', displayName: 'fechaPago', width: '20%', visible: false, enableCellEdit: false },
                { name: 'estGrid', width: '15%', displayName: 'Estatus Grid', enableCellEdit: false },
                { name: 'seleccionable', displayName: 'seleccionable', width: '20%', enableCellEdit: false, visible: false },
                { name: 'cuentaDestino', displayName: 'Cuenta Destino', width: '20%', enableCellEdit: false },
                { name: 'idEstatus', displayName: 'idEstatus', width: '20%', enableCellEdit: false, visible: true },
                { name: 'tipoCartera', displayName: 'tipoCartera', width: '20%', enableCellEdit: false, visible: true }
            ]
        };
    }

    $scope.proPegaReferencia = function(proceso, pegaReferencia) {
        switch (proceso) {
            case 1:

                $scope.pegaReferencia.proceso = "Pegar";
                $scope.pagoDirecto(pegaReferencia);
                break;

            case 2:

                $scope.pegaReferencia.proceso = "Pegar sobre filtros";
                $scope.pegaFiltros(pegaReferencia);
                break;

            case 3:

                $scope.pegaReferencia.proceso = "Borrar sobre filtros";
                $scope.borraFiltros(pegaReferencia);
                break;

            case 4:
                $scope.pegaReferencia.proceso = "Borrar";
                $scope.borraReferencias(pegaReferencia);
                break;
        }
    };

    //FAL Funcion de pegar referencia 09052016
    $scope.pagoDirecto = function(pegaReferencia) {
        var lcidProveedor = "";
        var blidProveedor = true;
        var blprimero = true;
        var j = 0;
        var rows = $scope.gridApi1.selection.getSelectedRows();
        if (rows.length == 0) {
            alertFactory.warning('Debe seleccionar al menos un documento');

        } else {
            //FAL si hay mas de un proveedor seleccionado salir

            rows.forEach(function(row, i) {
                if (row.referencia == undefined || row.referencia == "") {

                    if (blprimero) {
                        lcidProveedor = row.idProveedor;
                        blprimero = false;
                    }

                    if (lcidProveedor != row.idProveedor) {
                        blidProveedor = false;
                    }
                }
            });

            if (blidProveedor) {
                rows.forEach(function(row, i) {
                    if (row.referencia == undefined || row.referencia == "") {
                        row.referencia = pegaReferencia.referencia;
                    }
                });
            } else {
                alertFactory.warning('No puede tener mas de un proveedor seleccionado para pegar la referencia');
            }

        }
    };
    //FAL Funcion de borrar referencia 09052016
    $scope.borraReferencias = function(pegaReferencia) {
        var rows = $scope.gridApi1.selection.getSelectedRows();
        rows.forEach(function(row, i) {
            row.referencia = "";
        });
        pegaReferencia.referencia = "Borrar todas";
    };
    //FAL funcion que trabaja solo con los datos filtrados 10052016
    $scope.pegaFiltros = function(pegaReferencia) {


        $scope.gridApi1.core.getVisibleRows($scope.gridApi1.grid).forEach(function(row, i) {
            row.entity.referencia = pegaReferencia.referencia;
        });
        $scope.gridApi1.grid.refresh();
    };

    //FAL funcon que borra la referencia de los datos filtrados
    $scope.borraFiltros = function(pegaReferencia) {
        $scope.gridApi1.core.getVisibleRows($scope.gridApi1.grid).forEach(function(row, i) {
            row.entity.referencia = "";
        });
        $scope.gridApi1.grid.refresh();
    };

    //FAL prende apaga las referencias 11052016

    $scope.onReferencia = function(valor) {
        if ($scope.refMode) {
            $scope.refMode = false;
        } else {
            $scope.refMode = true;
        }
    }

    //FAL filtros en base a variables
    $scope.Filtrar = function(value, campo, texto) {
        //console.log(value);
        $scope.msgFiltros = 'Calculando....';
        $scope.etqFiltros = texto;
        $scope.BorraFiltrosParciales();
        $scope.gridApi1.grid.columns[campo].filters[0].term = value;
        $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        $scope.gridApi1.grid.refresh();
        $scope.msgFiltros = '';
    }
    $scope.BorraFiltrosParciales = function() {
        $scope.gridApi1.grid.columns.forEach(function(col, i) {
            $scope.gridApi1.grid.columns[i].filters[0].term = '';
        });
        $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        $scope.gridApi1.grid.refresh();
    }
    //Quita filtros
    $scope.BorraFiltros = function() {
        $scope.msgFiltros = 'Calculando....';
        $scope.etqFiltros = "Todos";
        $scope.gridApi1.grid.columns.forEach(function(col, i) {
            $scope.gridApi1.grid.columns[i].filters[0].term = '';
        });
        $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        $scope.gridApi1.grid.refresh();
        $scope.msgFiltros = '';
    }

    var isNumeric = function(obj) {
        return !Array.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
    }
    /***************************************************************************************************************
    Funciones de GRID
    END
    ****************************************************************************************************************/
    $scope.colapsado = false;
    //Funcion para controlar el redimensionamiento del GRID
    $scope.Resize = function() {
        $scope.colapsado = !$scope.colapsado;
    }
    /***************************************************************************************************************
        Funciones de guardado de datos
        BEGIN
    ****************************************************************************************************************/
    //LQMA 08032016
    $scope.ConsultaLote = function(Lote, index, mensaje, esAplicacionDirecta) {

        if (mensaje == 1) {
            if (confirm('¿Al cambiar de lote se perderan los cambios no guardados. Desea continuar??')) {
                $scope.ConsultaLoteObtiene(Lote, index, esAplicacionDirecta);
            }
        } else {
            $scope.ConsultaLoteObtiene(Lote, index, esAplicacionDirecta);
        }
    }
    $scope.ConsultaLoteObtiene = function(Lote, index, esAplicacionDirecta) {
        //alertFactory.info('Consulta de Lote ' + index);

        $scope.llenagridxvencer($rootScope.idEmpresa)
        $scope.llenagridenRojo($rootScope.idEmpresa)
        $scope.hidebuscando = false;
        $scope.idLote = Lote.idLotePago;
        $scope.grdnoPagable = 0;
        $scope.idLotePadre = Lote.idLotePago;
        $scope.nombreLote = Lote.nombre;
        $scope.estatusLote = Lote.estatus;
        $scope.tipoPago = Lote.tipoPago;
        $scope.NuevoLote = false;
        if (Lote.pal_esAplicacionDirecta == 1 || esAplicacionDirecta == 1) {
            $scope.pagoDirectoSeleccion = true;
            $scope.selPlantaBanco = true;

        } else {
            $scope.pagoDirectoSeleccion = false;
            $scope.selPlantaBanco = false;

        }
        if ($scope.estatusLote == 2) {
            $scope.expaprobado = true;
        } else {
            $scope.expaprobado = false;
        }
        //LQMA 14032016
        if ($scope.accionPagina) { //LQMA 15032016: true: indica que se esta trabajando sobre la pagina para consultar data, false: consulta desde el modal
            $scope.LlenaIngresos();
            pagoRepository.getOtrosIngresos($scope.idLote)
                .then(function successCallback(response) {
                    $scope.caja = 0;
                    $scope.cobrar = 0;
                    if (response.data.length > 0) {
                        $scope.caja = response.data[0].pio_caja;
                        $scope.cobrar = response.data[0].pio_cobranzaEsperada;
                    }
                }, function errorCallback(response) {
                    alertFactory.error('Error al obtener Otros Ingresos.');
                });
            pagoRepository.getTransferencias($scope.idLote)
                .then(function successCallback(response) {
                    $scope.transferencias = [];
                    if (response.data.length > 0) {
                        angular.forEach(response.data, function(transferencia, key) {
                            var newTransferencia = transferencia;
                            $scope.transferencias.push(newTransferencia);
                        });
                    } else {
                        var newTransferencia = { bancoOrigen: '', bancoDestino: '', importe: 0, index: index };
                        $scope.transferencias.push(newTransferencia);
                    }
                }, function errorCallback(response) {
                    alertFactory.error('Error al obtener Transferencias.');
                });
            if ($scope.estatusLote == 0) { //LQMA 08042016 entra cuando el lote es nuevo
                $scope.gridOptions.data = $scope.datosModal; //$scope.modalSeleccionados;

                $scope.gridOptions.isRowSelectable = function(row) {
                    if (row.entity.seleccionable == 'True') {
                        return false;
                    } else {
                        return true;
                    }
                };
                $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
                $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.EDIT);


                $('#btnTotalxEmpresa').button('reset');
                if ($scope.crearLote) {
                    // $('#inicioModal').modal('hide');
                    $scope.crearLote = false;

                }
                //$scope.selectAll(0);
            } else //LQMA 08042016 entra cuando se consulta un lote guardado
                pagoRepository.getDatosAprob($scope.idLote)
                .success(llenaLoteConsultaSuccessCallback) //LQMA 08042016.success(llenaGridSuccessCallback)
                .error(errorCallBack);
            setTimeout(function() {
                $("#btnSelectAll").click(); //$scope.selectAll();
            }, 100);
        }
        $scope.grdinicia = $scope.grdinicia + 1;

        //05072017





    }
    //LQMA funcion para guardar datos del grid (se implementara para guardar Ingresos bancos, otros , Transferencias)
    $scope.Guardar = function(opcion, valor) {
        //console.log('tipo pago', $scope.tipoPago)
        if ($scope.tipoPago) {
            $('#btnGuardando').button('loading');
            var negativos = 0;
            var saldo = 0;
            if (opcion == 3) {
                saldo = 1;
            }
            angular.forEach($scope.ingresos, function(ingreso, key) {
                if (parseInt(ingreso.disponible) < 0)
                    negativos += 1;
                saldo = parseInt(saldo) + parseInt(ingreso.saldo);
            });
            setTimeout(function() { guardaValida(negativos, saldo, opcion, valor); }, 500);
        } else {
            alertFactory.warning('Seleccione un tipo de pago');
        }

    }; //fin de funcion guardar
    $scope.Cancelar = function() {
        //LQMA 16032016
        $scope.gridOptions.data = [];
        $scope.noLotes = null;
        $scope.ObtieneLotes(0);
        setTimeout(function() {
            if ($scope.noLotes.data.length == 0) {
                $scope.NuevoLote = true;
                $scope.estatusLote = 0;
                $scope.CrearNuevoLote();
            }
        }, 500);
    }; //fin de funcion cancelar
    var guardaValida = function(negativos, saldo, opcion, valor) {

        if (!($('#lgnUser').val().indexOf('[') > -1)) {
            localStorageService.set('lgnUser', $('#lgnUser').val());
        } else {
            if (($('#lgnUser').val().indexOf('[') > -1) && !localStorageService.get('lgnUser')) {
                if (getParameterByName('employee') != '') {
                    $rootScope.currentEmployee = getParameterByName('employee');
                } else {
                    alert('Inicie sesión desde panel de aplicaciones.');
                    //window.close(); 
                }

            }
        }

        if (valor == 3) {
            saldo = 0.01;

        }

        if ($scope.selPlantaBanco) {
            saldo = 0.01;
        }
        if (negativos > 0) {
            alertFactory.warning('Existen disponibles en valores negativos. Verifique las transferencias.');
            $('#btnGuardando').button('reset');
        } else
        if (saldo <= 0) {
            alertFactory.warning('La sumatoria del saldo de cuentas de Ingreso no puede ser cero.');
            $('#btnGuardando').button('reset');
        } else {
            var rows = $scope.gridApi1.selection.getSelectedRows();

            if (rows.length == 0 && $rootScope.verbusqueda == false) {
                alertFactory.warning('Debe seleccionar al menos un documento para guardar un lote.');
                $('#btnGuardando').button('reset');
                $('#btnAprobar').button('reset');
            } else {


                var EsPagoDirecto = 0;
                if ($scope.selPlantaBanco) {
                    EsPagoDirecto = 1
                }

                var pasaxegresos = true;
                angular.forEach($scope.egresos, function(egreso, key) {

                    //if (egreso.excedente < $scope.montominimo) {
                    if (((egreso.saldoIngreso + egreso.aTransferir) - $scope.grdApagar) < $scope.montominimo) {
                        pasaxegresos = false;
                        alertFactory.warning('Existe una cuenta con saldo menor al mínimo');
                        $('#btnGuardando').button('reset');
                    }
                });

                //FAL revisa que no haya un convenio CIE sin referencia
                var pasaxCIE = true;
                var proveedorCIE = '';
                var pasaxbancoDestino = true;
                var proveedorcuentaDestino = '';
                rows.some(function(row, i, j) {

                    if ((row.convenioCIE == null) || (row.convenioCIE == undefined) || (row.convenioCIE == "")) {
                        pasaxCIE = true;
                    } else {
                        pasaxCIE = false;
                    }

                    if (pasaxCIE == false) {
                        if ((row.referencia == null) || (row.referencia == undefined) || (row.referencia == "")) {
                            proveedorCIE = row.proveedor;
                            return true;
                        } else {

                            pasaxCIE = true;
                            return false;
                        }
                    }


                    var ctrCuentaDestinoArr = row.cuentaDestino.split(',');

                    if (ctrCuentaDestinoArr.length > 1) {
                        pasaxbancoDestino = false;
                        proveedorcuentaDestino = row.proveedor;
                        alertFactory.warning('El proveedor ' + proveedorcuentaDestino + ' Tiene mas de una cuenta destino');
                        $('#btnGuardando').button('reset');
                        return true;
                    }

                });




                if (pasaxCIE) {
                    if ((pasaxegresos) && (opcion != 2) && (opcion != 3) && (pasaxbancoDestino)) {

                        // pagoRepository.getPagosPadre($rootScope.idEmpresa, $rootScope.currentEmployee, $scope.formData.nombreLoteNuevo, $scope.idLotePadre, EsPagoDirecto, ($scope.grdApagar).toFixed(2))
                        pagoNodeRepository.putPagosPadre($rootScope.idEmpresa, $rootScope.currentEmployee, $scope.formData.nombreLoteNuevo, $scope.idLotePadre, EsPagoDirecto, ($scope.grdApagar).toFixed(2), $scope.tipoPago)
                            .then(function successCallback(response) {
                                console.log(response.data)
                                $scope.idLotePadre = response.data[0].idPadre;
                                var array = [];
                                var count = 1;
                                rows.forEach(function(row, i) {
                                    var elemento = {};
                                    elemento.pal_id_lote_pago = $scope.idLotePadre; //response.data;
                                    elemento.pad_polTipo = row.polTipo; //entity.polTipo;
                                    elemento.pad_polAnnio = row.annio;
                                    elemento.pad_polMes = row.polMes;
                                    elemento.pad_polConsecutivo = row.polConsecutivo;
                                    elemento.pad_polMovimiento = row.polMovimiento;
                                    elemento.pad_fechaPromesaPago = (row.fechaPromesaPago == '' ? '1900-01-01T00:00:00' : row.fechaPromesaPago);

                                    elemento.pad_saldo = parseFloat(row.Pagar) + .00000001; //row.saldo;//
                                    //15062018

                                    if ((row.referencia == null) || (row.referencia == undefined) || (row.referencia == "")) {
                                        row.referencia = "AUT";
                                    } else {
                                        if (row.convenioCIE == "") {
                                            //row.referencia = $scope.idLotePadre + '-' + row.idProveedor + '-' + row.referencia.replace(" ", "");
                                        }
                                    }

                                    //fin 15062018


                                    elemento.pad_documento = row.documento;
                                    elemento.pad_polReferencia = row.referencia; //FAL 09052015 mandar referencia
                                    elemento.tab_revision = 1;
                                    if (row.agrupar == 1) {
                                        elemento.pad_agrupamiento = count;
                                    } else {
                                        elemento.pad_agrupamiento = row.agrupar;
                                    }

                                    elemento.pad_bancoPagador = $scope.bancoPago.cuenta;
                                    var lonbancodestino = row.cuentaDestino.length;
                                    var primerparentesis = row.cuentaDestino.indexOf("(", 0)
                                    var numcuentaDestino = row.cuentaDestino.substring(primerparentesis + 1, lonbancodestino)
                                    var res = numcuentaDestino.replace("(", "");
                                    res = res.replace(")", "");
                                    res = res.replace(",", "");
                                    res = res.replace(",", "");
                                    res = res.replace(",", "");
                                    res = res.replace(" ", "");
                                    elemento.pad_bancoDestino = res;
                                    array.push(elemento);
                                    count = count + 1;
                                });


                                var jsIngresos = angular.toJson($scope.ingresos); //delete $scope.ingresos['$$hashKey'];
                                var jsTransf = angular.toJson($scope.transferencias);
                                var jsEgresos = angular.toJson($scope.egresos);
                                $scope.jsIngresosM = angular.toJson($scope.ingresos); //delete $scope.ingresos['$$hashKey'];
                                $scope.jsTransfM = angular.toJson($scope.transferencias);
                                $scope.jsEgresosM = angular.toJson($scope.egresos);
                                $scope.arrayPagos = rows;
                                pagoRepository.setDatos(array, $rootScope.currentEmployee, $scope.idLotePadre, jsIngresos, jsTransf, $scope.caja, $scope.cobrar, jsEgresos, ($scope.estatusLote == 0) ? 1 : 2)
                                    .then(function successCallback(response) {
                                        alertFactory.success('Se guardaron los datos.');
                                        $scope.estatusLote = 1;
                                        angular.forEach($scope.noLotes.data, function(lote, key) {
                                            if (lote.idLotePago == $scope.idLote) {
                                                lote.idLotePago = $scope.idLotePadre;
                                                lote.estatus = 1;
                                            }
                                        });
                                        $('#btnGuardando').button('reset');



                                    }, function errorCallback(response) {
                                        alertFactory.error('Error al guardar Datos');
                                        $('#btnGuardando').button('reset');
                                        $('#btnAprobar').button('reset');
                                    });



                                $('#btnguardando').button('reset');
                            }, function errorCallback(response) {
                                alertFactory.error('Error al insertar en tabla padre.');
                                $('#btnguardando').button('reset');
                            });

                    };
                } else {
                    alertFactory.warning('Existe un documento del proveedor ' + proveedorCIE + ' con convenio CIE sin referencia');
                    $('#btnGuardando').button('reset');
                };

                if (opcion == 2) { //aprobacion
                    $('#btnAprobar').prop('disabled', true);
                    $('#btnRechazar').prop('disabled', true);
                    //Guardo el lote
                    var array = [];
                    var count = 1;
                    rows.forEach(function(row, i) {
                        var elemento = {};
                        elemento.pal_id_lote_pago = $scope.idLotePadre; //response.data;
                        elemento.pad_polTipo = row.polTipo; //entity.polTipo;
                        elemento.pad_polAnnio = row.annio;
                        elemento.pad_polMes = row.polMes;
                        elemento.pad_polConsecutivo = row.polConsecutivo;
                        elemento.pad_polMovimiento = row.polMovimiento;
                        elemento.pad_fechaPromesaPago = (row.fechaPromesaPago == '' ? '1900-01-01T00:00:00' : row.fechaPromesaPago);

                        elemento.pad_saldo = parseFloat(row.Pagar) + .00000001; //row.saldo;//


                        if ((row.referencia == null) || (row.referencia == undefined) || (row.referencia == "")) {
                            row.referencia = "AUT";
                        }
                        elemento.pad_documento = row.documento;
                        elemento.pad_polReferencia = row.referencia; //FAL 09052015 mandar referencia
                        elemento.tab_revision = 1;
                        if (row.agrupar == 1) {
                            elemento.pad_agrupamiento = count;
                        } else {
                            elemento.pad_agrupamiento = row.agrupar;
                        }

                        elemento.pad_bancoPagador = row.bancoPagador;
                        var lonbancodestino = row.cuentaDestino.length;
                        var primerparentesis = row.cuentaDestino.indexOf("(", 0)
                        var numcuentaDestino = row.cuentaDestino.substring(primerparentesis + 1, lonbancodestino)
                        var res = numcuentaDestino.replace("(", "");
                        res = res.replace(")", "");
                        res = res.replace(",", "");
                        res = res.replace(",", "");
                        res = res.replace(",", "");
                        res = res.replace(" ", "");
                        elemento.pad_bancoDestino = res;
                        array.push(elemento);
                        count = count + 1;
                    });

                    // pagoRepository.setDatosAutoriza(array, $rootScope.currentEmployee, $scope.idLotePadre)
                    //     .then(function successCallback(response) {
                    //         alertFactory.success('Se guardaron los datos.');
                    //       }, function errorCallback(response) {
                    //         alertFactory.error('Error al guardar Datos');
                    //     });

                    pagoRepository.setAprobacion(1, valor, $rootScope.idEmpresa, $scope.idLotePadre, $rootScope.currentEmployee, $scope.idAprobador, $scope.idAprobacion, $scope.idNotify, $scope.formData.Observacion)
                        .then(function successCallback(response) {
                            if (valor == 3) {
                                alertFactory.success('Se aprobo el lote con exito');
                                $('#btnAprobar').button('reset');
                            } else //rechazado
                            {
                                alertFactory.success('Se rechazo el lote con exito');
                                $('#btnRechazar').button('reset');
                            }
                            $scope.idOperacion = 0;


                        }, function errorCallback(response) {
                            if (valor == 3) {
                                // alertFactory.error('Error al aprobar');
                                $('#btnAprobar').button('reset');
                                setTimeout(function() { window.close(); }, 1500);
                            } else //rechazado
                            {
                                alertFactory.error('Error al rechazar');
                                $('#btnRechazar').button('reset');
                            }
                        });
                    setTimeout(function() { window.close(); }, 5000);
                }
                if (opcion == 3) { //aprobacion
                    pagoRepository.setAplicacion($rootScope.idEmpresa, $scope.idLotePadre, $rootScope.currentEmployee)
                        .then(function successCallback(response) {
                            if (valor == 3) {
                                alertFactory.success('Se aprobo el lote con exito');
                                $('#btnAprobar').button('reset');
                            } else //rechazado
                            {
                                alertFactory.success('Se rechazo el lote con exito');
                                $('#btnRechazar').button('reset');
                            }
                            $scope.idOperacion = 0;
                            setTimeout(function() { window.close(); }, 3500);
                            $('#btnAprobar').prop('disabled', true);
                            $('#btnRechazar').prop('disabled', true);
                        }, function errorCallback(response) {
                            if (valor == 3) {
                                alertFactory.error('Error al aprobar');
                                $('#btnAprobar').button('reset');
                            } else //rechazado
                            {
                                alertFactory.error('Error al rechazar');
                                $('#btnRechazar').button('reset');
                            }
                        });
                }
            }
        } //fin else
    };
    /***************************************************************************************************************
        Funciones de guardado de datos
        END
    ****************************************************************************************************************/


    $scope.addTransferencia = function() {
        var index = $scope.transferencias.length;
        var newTransferencia = { bancoOrigen: '', bancoDestino: '', importe: 0, index: index };
        $scope.transferencias.push(newTransferencia);
    };
    $scope.delTransferencia = function(transferencia) {
        $scope.transferencias.splice(transferencia.index, 1);
        var index = 0;
        angular.forEach($scope.transferencias, function(transferencia, key) {
            transferencia.index = index;
            index += 1;
        });
        $scope.calculaTotalOperaciones();
        recalculaIngresos();
    };
    $scope.selBancoIngreso = function(ingreso, transferencia) {
        if (ingreso.disponible <= 0)
            alertFactory.warning('El saldo disponible de esta cuenta es 0 o menor. Elija otra.');
        else
        if (transferencia.bancoOrigen != ingreso.cuenta) {
            angular.forEach($scope.ingresos, function(ingreso, key) {
                if (ingreso.cuenta == transferencia.bancoOrigen)
                    ingreso.disponible = parseInt(ingreso.disponible) + parseInt(transferencia.importe);
            });
            transferencia.bancoOrigen = ingreso.cuenta;
            transferencia.disponibleOrigen = ingreso.disponible;
            transferencia.importe = 0;
        }
        $scope.calculaTotalOperaciones();
        recalculaIngresos();
    };

    $scope.selBancoEgreso = function(egreso, transferencia) {

        transferencia.bancoDestino = egreso.cuenta;
        $scope.calculaTotalOperaciones();
        recalculaIngresos();
    };

    $scope.selBancoPago = function(egreso, transferencia) {
        $scope.bancoPago = egreso;
    };

    $scope.selbancoPagoLote = function(egresos, bancoLote) {

        angular.forEach(egresos, function(egreso, key) {

            if (egreso.cuenta == bancoLote)
                $scope.bancoPago = egreso;
        });

    }

    $scope.calculaSaldoIngresos = function(ingreso) {
        var total = 0;
        angular.forEach($scope.transferencias, function(transferencia, key) {
            if (transferencia.bancoOrigen == ingreso.cuenta) {
                total = parseInt(total) + parseInt(transferencia.importe);
            }
        });
        ingreso.disponible = parseInt(ingreso.saldo) - parseInt(total);
        angular.forEach($scope.egresos, function(egreso, key) {
            if ((ingreso.cuenta == egreso.cuenta) && egreso.ingreso == 1)
                egreso.saldoIngreso = ingreso.disponible;
        });
        angular.forEach($scope.transferencias, function(transferencia, key) {
            if (transferencia.bancoOrigen == ingreso.cuenta)
                transferencia.disponibleOrigen = ingreso.disponible;
        });
        if (parseInt(ingreso.disponible) < 0)
            alertFactory.warning('El saldo disponible de esta cuenta es menor a 0. Verifique las transferencias.');
        $scope.calculaTotalOperaciones();
    };
    $scope.calculaTransferencia = function(transferencia) {
        var total = 0;
        angular.forEach($scope.transferencias, function(transferencia1, key) {
            if (transferencia1.bancoOrigen == transferencia.bancoOrigen)
                total += 1;
        });
        if (total == 1) {
            if ((transferencia.importe > transferencia.disponibleOrigen) || (transferencia.disponibleOrigen <= 0)) {
                //alertFactory.warning('El valor es mayor al saldo disponible!');
                //transferencia.importe = 0;
            }
        } else {
            angular.forEach($scope.ingresos, function(ingreso, key) {
                if (ingreso.cuenta == transferencia.bancoOrigen) {
                    if (ingreso.disponible - transferencia.importe < 0) {
                        //alertFactory.warning('El valor es mayor al saldo disponible!');
                        //cd..
                        transferencia.importe = 0;
                    } else {
                        ingreso.disponible = ingreso.disponible - transferencia.importe;
                        //transferencia.disponibleOrigen = ingreso.disponible;
                    }
                }
            });
        }
        $scope.calculaTotalOperaciones();
        recalculaIngresos();
    };
    var recalculaIngresos = function() {
        angular.forEach($scope.ingresos, function(ingreso, key) {
            ingreso.disponible = ingreso.saldo;
            angular.forEach($scope.transferencias, function(transferencia, key) {
                if (ingreso.cuenta == transferencia.bancoOrigen)
                    ingreso.disponible = ingreso.disponible - transferencia.importe;
            });
            angular.forEach($scope.TotalxEmpresas, function(empresa, key) {
                angular.forEach($scope.egresos, function(egreso, key) {
                    //FAL integra estos calculos al arreglo de bancos para presentar en tiempo real como se va acabando el dinero.
                    if (empresa.cuentaPagadora == egreso.cuenta)
                        empresa.saldoLote = egreso.total;
                });
            });
        });
        angular.forEach($scope.egresos, function(egreso, key1) {
            angular.forEach($scope.grdBancos, function(grdBanco, key2) {
                if (egreso.cuenta == grdBanco.banco)
                    grdBanco.subtotalLote = egreso.total;
            });
        });
    }
    $scope.calculaTotalOperaciones = function() {

        var totalDestino = 0;
        angular.forEach($scope.transferencias, function(transferencia, key) {
            totalDestino = totalDestino + parseInt(transferencia.importe);
        });
        $scope.egresos[0].aTransferir = totalDestino;


        //$scope.egresos = [{id: 1,nombre:'HSBC', cuenta: 228139,saldo: 90000, aTransferir: 25000, total:0,excedente:0, ingreso:1, egreso:0},
        // angular.forEach($scope.egresos, function(egreso, keyegreso) {

        //     var totalDestino = 0;
        //     var montoApagara = 0;

        //     angular.forEach($scope.transferencias, function(transferencia, key) {
        //             totalDestino = totalDestino + parseInt(transferencia.importe);
        //     });
        //     egreso.aTransferir = totalDestino;

        //     angular.forEach($scope.ingresos, function(ingreso, key) {
        //         if ((ingreso.cuenta == egreso.cuenta) && egreso.ingreso == 1)
        //             egreso.saldoIngreso = ingreso.saldo;
        //     });


        //     var sss = parseInt(egreso.ingreso);
        //     var suma = (sss == 1) ? parseInt(egreso.saldoIngreso) : parseInt(egreso.saldo);

        //     egreso.total = parseInt(egreso.aTransferir) + suma;


        //     // 
        //     //egreso.excedente = egreso.totalPagar - egreso.total;
        //     // egreso.excedente = parseInt(egreso.total) - parseInt(egreso.totalPagar) ;
        // });
    };
    $scope.presskey = function(event) {
        if (event.which === 13) {
            $scope.calculaTotalOperaciones();
            recalculaIngresos();
        }
    };
    $scope.getDiferencia = function(reg) {
        var diferencia = reg.subtotalLote - reg.subtotal;
        return diferencia;
    }
    $scope.getTotal = function(opcion) {
        var total = 0;
        switch (opcion) {
            case 'egresosTotal':
                angular.forEach($scope.egresos, function(egreso, key) {
                    total += parseInt(egreso.total);
                });
                $scope.FlujoEfectivo = total;
                break;
            case 'ingresoSaldo':
                angular.forEach($scope.ingresos, function(ingreso, key) {
                    total += parseInt((ingreso.saldo == '') ? 0 : ingreso.saldo);
                });
                break;
            case 'ingresoDisponible':
                angular.forEach($scope.ingresos, function(ingreso, key) {
                    total += parseInt((ingreso.disponible == '') ? 0 : ingreso.disponible);
                });
                break;
            case 'excedente':
                angular.forEach($scope.egresos, function(egreso, key) {
                    total += parseInt(egreso.excedente);
                });
                break;
            case 'otrosIngresos':
                total += parseInt(($scope.caja == '' || $scope.caja == null) ? 0 : $scope.caja) + parseInt(($scope.cobrar == '' || $scope.cobrar == null) ? 0 : $scope.cobrar);
                break;
            case 'transferencias':
                angular.forEach($scope.transferencias, function(transferencia, key) {
                    total += parseInt(transferencia.importe);
                });
                break;
            case 'saldo':
                angular.forEach($scope.egresos, function(egreso, key) {
                    total += (egreso.ingreso == 1) ? parseInt(egreso.saldoIngreso) : parseInt(egreso.saldo);
                });
                break;
            case 'aTransferir':
                angular.forEach($scope.egresos, function(egreso, key) {
                    total += parseInt(egreso.aTransferir);
                });
                break;
        }
        return total;
    } //get total end
    //LQMA 10032016

    $scope.BuscadorLotes = function() {
        //$window.location.href = '/'
        $('#closeMenu').click();
        //$('#inicioModal').modal('show');
        $scope.BuscarLotes();
    }


    $scope.CrearNuevoLote = function() {
        $('#closeMenu').click();
        $scope.ProgPago = true;

        var lotesPendientes = $.grep($scope.noLotes.data, function(n, i) {
            return n.estatus === 0;
        });
        if (lotesPendientes.length > 0)
            alertFactory.warning('Existe lotes sin guardar.');
        else {
            if ($scope.pdPlanta || $scope.pdBanco) {
                $scope.selPagoDirecto = true;
            }

            $scope.NuevoLote = true;
            $scope.accionPagina = false;
            $('#btnCrealote').button('reset');
            $('#btnCrealotePD').button('reset');
            pagoNodeRepository.getLotes($rootScope.idEmpresa, $rootScope.currentEmployee, 0, 0)
                .then(function successCallback(data) {
                        $scope.noLotes = data;
                        var date = new Date();
                        $scope.formData.nombreLoteNuevo = ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + date.getFullYear() + '-' + $scope.rfc + '-' + ('0' + ($scope.noLotes.data.length + 1)).slice(-2); //data.length + 1;
                        // $('#inicioModal').modal('show');
                        $scope.NuevoLote = true;
                    },
                    function errorCallback(response) {
                        alertFactory.error('Error al obtener los Lotes');
                        $scope.formData.nombreLoteNuevo = '0000';
                        //  $('#inicioModal').modal('show');
                    });
            //LQMA 16032016
        }
    }
    /***************************************************************************************************************
        Funciones de guardado de datos
        END
    ****************************************************************************************************************/
    $('input[name="options"]').click(function() {
        $(this).tab('show');
    });
    /***********************************************************************************************************
    FAL 15032016
    funciones necesarias para generar el archivo de pagos
    ************************************************************************************************************/
    $scope.GenerarArchivoBtn = function(varidempresa, varidlote) {

        $('#modalTXT').modal('show');
        $rootScope.varidempresaTXT = varidempresa;
        $rootScope.varidlote = varidlote;

    }

    $scope.borraLoteBtn = function(varidlote) {

        $('#modalBorra').modal('show');

        $rootScope.varidlote = varidlote;


    }

    $scope.ConsultaLoteObtieneBusquedaAplicaDirecto = function(Lote) {

        $('#modalAplica').modal('show');
        $rootScope.varidlote = Lote;
    }

    $scope.GenerarArchivo = function(varidempresa, varidlote, dtfechaini, dtfechafin) {
        $('#btn_generaTXT').button('loading');
        pagoRepository.setArchivo(varidempresa, varidlote)
            .then(function successCallback(response) {
                $scope.documentoIni = '<div><object id="ifDocument" data="' + response.data + '" type="application/txt" width="100%"><p>Descargar archivo de pagos <a href="../../files/' + response.data + '" target="_blank"><img border="0" alt="descargar" src="image/gifs/download.jpg" width="50" height="50"></a></p></object> </div>';
                setTimeout(function() {
                    $('#btn_generaTXT').button('reset');
                    $('#modalTXT').modal('hide');
                    $scope.BuscarLotesxFecha(dtfechaini, dtfechafin);
                }, 3000);
                setTimeout(function() {
                    $window.location.href = '../../files/' + response.data;
                }, 2000);

            }, function errorCallback(response) {
                alertFactory.error('Error al generar el archivo');
                setTimeout(function() {
                    $('#modalAplica').modal('hide');
                }, 1000);
                $('#btn_generaTXT').button('reset');
            });
    };

    $scope.aplicaLoteDirecto = function(idlote, dtfechaini, dtfechafin) {
        $('#btn_AplicarDirecto').button('loading');
        pagoRepository.setAplicacionDirecta(idlote.idEmpresa, idlote.idLotePago, $rootScope.currentEmployee).then(function successCallback(response) {
            console.log(response.data);
            if (response.data.length == 0) {
                $scope.isDisabled = false;
            }
            alertFactory.infoTopFull('Se aplico de manera correcta el lote');
            setTimeout(function() {

                $('#btn_AplicarDirecto').button('reset');
                $('#modalAplica').modal('hide');
                $scope.BuscarLotesxFecha(dtfechaini, dtfechafin);
            }, 2000);

        }, function errorCallback(response) {
            alertFactory.error('Error al Aplicar Lote');
            $scope.isDisabled = false;
            $('#btn_AplicarDirecto').button('reset');
            $('#modalAplica').modal('hide');
        });
    }

    $scope.borraLote = function(Lote, dtfechaini, dtfechafin) {
        $('#btn_borralote').button('loading');
        $scope.isDisabled = true;
        //pagoRepository.setAplicacionDirecta($rootScope.idEmpresa, idlote, $rootScope.currentEmployee).then(function successCallback(response) {
        pagoRepository.setBorraLote(Lote.idLotePago).then(function successCallback(response) {

            if (response.data.length == 0) {
                $window.location.href = '/pago';
                $scope.isDisabled = false;
            }
            alertFactory.infoTopFull('Se borro de manera correcta el lote');


            setTimeout(function() {

                $('#btn_borralote').button('reset');
                $('#modalBorra').modal('hide');
                $scope.BuscarLotesxFecha(dtfechaini, dtfechafin);
            }, 2000);

        }, function errorCallback(response) {
            alertFactory.error('Error al borrar Lote');
            $('#btn_borralote').button('reset');
            $('#modalBorra').modal('hide');
            $scope.BuscarLotesxFecha(dtfechaini, dtfechafin);
        });
    }

    $scope.AbreConsultaLotes = function() {
        $('#closeMenu').click();
        $('#consultaModal').modal('show');

    };

    $scope.Abrecuentas = function() {
        $('#closeMenu').click();
        $window.location.href = '/cuentas';

    };

    $scope.AbreAgrupador = function() {
        $('#closeMenu').click();
        $window.location.href = '/agrupador';

    };

    $scope.AbreAdministrador = function() {
        $('#closeMenu').click();
        $window.location.href = '/loteAdmin';

    };
    $scope.aggregateLots = function(row) {
        var lots = 0;
        angular.forEach(row.children, function(subrow) {
            lots += subrow.entity.lots;
        });
        return lots;
    }

    //FAL funciones de calendar

    $scope.today = function() {
        $scope.dtini = new Date();
        $scope.dtfin = new Date();
    };
    $scope.today();

    $scope.clear = function() {
        $scope.dt = null;
    };

    $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
    };

    $scope.dateOptions = {
        //dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
        var date = data.date,
            mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.toggleMin = function() {
        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.toggleMin();

    $scope.open1 = function() {
        $scope.popup1.opened = true;
    };

    $scope.open2 = function() {
        $scope.popup2.opened = true;
    };

    $scope.setDate = function(year, month, day) {
        $scope.dt = new Date(year, month, day);
    };

    $scope.formats = ['dd/MM/yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup1 = {
        opened: false
    };

    $scope.popup2 = {
        opened: false
    };

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events = [{
        date: tomorrow,
        status: 'full'
    }, {
        date: afterTomorrow,
        status: 'partially'
    }];

    function getDayClass(data) {
        var date = data.date,
            mode = data.mode;
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }

        return '';
    }

    //LQMA 08042016
    $scope.EnviaAprobacion = function() {
        $('#btnEnviaApro').button('loading');
        pagoRepository.setSolAprobacion(1, 8, $rootScope.idEmpresa, $scope.idLotePadre)
            .then(function successCallback(response) {
                alertFactory.success('Se envio la solicitud con exito');
                $('#btnEnviaApro').button('reset');
                $scope.idOperacion = 1;
            }, function errorCallback(response) {
                alertFactory.error('Error al enviar solicitud de aprobación');
                $('#btnEnviaApro').button('reset');
            });
    }; //LQMA End EnviaAprobacion
    //LQMA 09042016
    $scope.AprobarLote = function(valor) {
        $('#btnAprobar').button('loading');
        $scope.Guardar(2, valor);
    }; //LQMA End EnviaAprobacion

    $scope.AprobarLotePD = function(valor) {
        $('#btnAprobar').button('loading');
        $scope.Guardar(3, valor);
    };
}) //LQMA fin bloque controller
registrationModule.service('stats', function() {
    var coreAccumulate = function(aggregation, value) {
        initAggregation(aggregation);
        if (angular.isUndefined(aggregation.stats.accumulator)) {
            aggregation.stats.accumulator = [];
        }
        aggregation.stats.accumulator.push(value);
    };
    var initAggregation = function(aggregation) {
        /* To be used in conjunction with the cleanup finalizer */
        if (angular.isUndefined(aggregation.stats)) {
            aggregation.stats = { sum: 0 };
        }
    };
    var increment = function(obj, prop) {
        /* if the property on obj is undefined, sets to 1, otherwise increments by one */
        if (angular.isUndefined(obj[prop])) {
            obj[prop] = 1;
        } else {
            obj[prop]++;
        }
    };
    var service = {
        aggregator: {
            accumulate: {
                numValue: function(aggregation, fieldValue, numValue) {
                    return coreAccumulate(aggregation, numValue);
                },
                fieldValue: function(aggregation, fieldValue) {
                    return coreAccumulate(aggregation, fieldValue);
                }
            },
            mode: function(aggregation, fieldValue) {
                initAggregation(aggregation);
                var thisValue = fieldValue;
                if (angular.isUndefined(thisValue) || thisValue === null) {
                    thisValue = aggregation.col.grid.options.groupingNullLabel;
                }
                increment(aggregation.stats, thisValue);
                if (aggregation.stats[thisValue] > aggregation.maxCount || angular.isUndefined(aggregation.maxCount)) {
                    aggregation.maxCount = aggregation.stats[thisValue];
                    aggregation.value = thisValue;
                }
            },
            sumSquareErr: function(aggregation, fieldValue, numValue) {
                initAggregation(aggregation);
                increment(aggregation.stats, 'count');
                aggregation.stats.sum += numValue;
                service.aggregator.accumulate.numValue(aggregation, fieldValue, numValue);
            }
        },
        finalizer: {
            cleanup: function(aggregation) {
                delete aggregation.stats;
                if (angular.isUndefined(aggregation.rendered)) {
                    aggregation.rendered = aggregation.value;
                }
            },
            sumSquareErr: function(aggregation) {
                aggregation.value = 0;
                if (aggregation.count !== 0) {
                    var mean = aggregation.stats.sum / aggregation.stats.count,
                        error;
                    angular.forEach(aggregation.stats.accumulator, function(value) {
                        error = value - mean;
                        aggregation.value += error * error;
                    });
                }
            },
        },
    };
    return service;
});