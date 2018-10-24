registrationModule.controller('carteraPagarController', function($scope, $rootScope, alertFactory, uiGridGroupingConstants, utils, uiGridConstants, $filter, $routeParams, $window, carteraPagarRepository) {

    $scope.gridOptions = [];

    $scope.$watch("customer.idEmpresa", function(newValue, oldValue) {
        $scope.idEmpresa = $scope.customer.idEmpresa
        if ($scope.idEmpresa > 0)
            $scope.init();
    }, true);

    $scope.init = function() {
        ConfiguraGrid();
        $scope.llenaGrid();
    };

    $scope.llenaGrid = function() {
        $scope.carteraVencida = 0;
        $scope.cantidadTotal = 0;
        $scope.cantidadUpdate = 0;
        $scope.noPagable = 0;
        $scope.Reprogramable = 0;
        $scope.TotalSaldoPagar = 0;
        var contador = 1;

        $scope.pdPlanta = true //$scope.escenarios.Pdplanta;
        $scope.pdBanco = true //$scope.escenarios.Pdbanco;
        $scope.refPlanta = 3 //$scope.escenarios.TipoRefPlanta;
        $scope.refpdBanco = 3 //$scope.escenarios.tipoRefBanco;
        $scope.grdPagoDirecto = [];

        carteraPagarRepository.getDatosCarteraPagar($scope.idEmpresa)
            .then(function successCallback(response) {
                    if (response.data.length > 0) {

                        $scope.data = response.data
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




                        } //fin de for que recorre todos los lotes a pagar
                        $scope.noPagable = $scope.carteraVencida - $scope.cantidadTotal;
                        $scope.gridOptions.data = $scope.data;

                        $scope.estatusLote = 0;
                        $scope.accionPagina = true;
                        $scope.grdApagar = 0;
                        $scope.grdBancos = [];
                        
                    } //fin IF .lenght
                },
                function errorCallback(response) {
                    $scope.gridOptions.data = [];
                });
    }


    var ConfiguraGrid = function() {

        $scope.idEmpleado = 71;
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
                { name: 'idProveedor', displayName: 'Clave', width: '5%', enableCellEdit: false, headerTooltip: 'Nombre del provedor', cellClass: 'cellToolTip' },
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

                    //$scope.calculaTotalOperaciones();
                    //recalculaIngresos();

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
        } //fin



    }; //funcion



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


    var errorCallBack = function(data, status, headers, config) {
        alertFactory.error('Ocurrio un problema');
    };

});