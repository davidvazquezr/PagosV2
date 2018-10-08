registrationModule.controller('carteraVencerController', function($scope, $rootScope, alertFactory, carteraVencerRepository, uiGridGroupingConstants, utils, uiGridConstants, ) {

    $scope.loteController = '';
    $scope.gridXvencer = null;
    $scope.bancoPago = [];
    $scope.hidenotifi = false;
    $scope.gridXvencer = [];
    //getParametrosEscenarios 9
    //selbancoPagoLote 'BANCOMER 4667'

    $scope.$watch("customer", function(newValue, oldValue) {
       $scope.init();
    }, true);

    $scope.init = function(){
         setTimeout(function() { $scope.preparaGrid(); }, 5000);
    }

    $scope.preparaGrid = function() {
        $scope.idEmpresa = $scope.customer.encabezadoLote.idEmpresa;
        $scope.idLote = $scope.customer.idLote;

        ConfiguraGridxvencer();
        $scope.LlenaIngresos();
        $scope.llenagridxvencer();
        $scope.selbancoPagoLote($scope.egresos,'BANCOMER 4667');
        
        $scope.hidebuscando = true;
        $scope.grdnoPagable = 0;
        $scope.idLotePadre = $scope.customer.idLote;
        $scope.estatusLote = $scope.customer.encabezadoLote.estatus;
        $scope.NuevoLote = false;

        if ($scope.customer.encabezadoLote.pal_esAplicacionDirecta == 1) {
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


        $scope.llenaParametroEscenarios();
        carteraVencerRepository.getOtrosIngresos($scope.idLote)
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
        carteraVencerRepository.getTransferencias($scope.idLote)
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


        if ($scope.estatusLote == 0) { 
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
                $scope.crearLote = false;
            }
        } else 
            carteraVencerRepository.getDatosAprob($scope.idLote)
            .success(llenaLoteConsultaSuccessCallback) 
            .error(errorCallBack);
        setTimeout(function() {
            $("#btnSelectAll").click(); 
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

    var llenaLoteConsultaSuccessCallback = function(data, status, headers, config) {
        $scope.grdBancos = [];
        $scope.grdApagar = 0;
        if ($scope.gridOptions == null)

      

      
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

        //$scope.gridOptions.data = data;
        $scope.gridXvencer.data = data;
        $scope.blTotales = false;
    };

    $scope.llenagridxvencer = function(idempresa) {
        $scope.GranTotalxvencer = 0;
        $scope.GranTotalxvencerPagable = 0;
        $scope.GranTotalxvencerNopagable = 0;
        carteraVencerRepository.getDatosxvencer(1)
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


    $scope.LlenaIngresos = function() {
        carteraVencerRepository.getIngresos($scope.idEmpresa, $scope.idLote)
            .then(function successCallback(response) {
                $scope.bancoIngresos = [];
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
            }, function errorCallback(response) {
                alertFactory.error('Error al obtener los Ingresos');
            });
    };


    $scope.selbancoPagoLote = function(egresos, bancoLote) {

        angular.forEach(egresos, function(egreso, key) {

            if (egreso.cuenta == bancoLote)
                $scope.bancoPago = egreso;
        });

    }


    $scope.llenaParametroEscenarios = function() {
        carteraVencerRepository.getParametrosEscenarios(9)
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


    var recalculaIngresos = function() {
        angular.forEach($scope.ingresos, function(ingreso, key) {
            ingreso.disponible = ingreso.saldo;
            angular.forEach($scope.transferencias, function(transferencia, key) {
                if (ingreso.cuenta == transferencia.bancoOrigen)
                    ingreso.disponible = ingreso.disponible - transferencia.importe;
            });
            angular.forEach($scope.TotalxEmpresas, function(empresa, key) {
                angular.forEach($scope.egresos, function(egreso, key) {
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
    }


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

     var errorCallBack = function(data, status, headers, config) {
        alertFactory.error('Ocurrio un problema');
    };


});