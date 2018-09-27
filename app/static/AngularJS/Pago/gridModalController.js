registrationModule.controller("gridModalController", function($scope, $http, $interval, uiGridGroupingConstants, uiGridConstants, $filter, $rootScope, localStorageService, alertFactory, stats) {

    $scope.inicia = function() {
        ConfiguraGridModal();
    };

    //FAL funciones de catga para el modal.

    var ConfiguraGridModal = function() {
        //$rootScope.showGrid = true;
        $scope.gridOptionsModal = {
            enableRowSelection: true,
            enableGridMenu: true,
            enableFiltering: true,
            enableGroupHeaderSelection: true,
            treeRowHeaderAlwaysVisible: true,
            showColumnFooter: false,
            showGridFooter: true,
            height: 900,
            cellEditableCondition: function($scope) {
                return $scope.row.entity.ordenBloqueada;
            },
            columnDefs: [{
                    name: 'nombreAgrupador',
                    grouping: { groupPriority: 0 },
                    sort: { priority: 0, direction: 'asc' },
                    width: "100",
                    resizable: true,
                    displayName: 'Grupo',
                    enableCellEdit: false

                }, {
                    name: 'proveedor',
                    grouping: { groupPriority: 1 },
                    sort: { priority: 1, direction: 'asc' },
                    name: 'proveedor',
                    enableCellEdit: false,
                    width: "200",
                    resizable: true,
                    cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
                }, {
                    field: 'Pagar',
                    displayName: 'Pagar (total)',
                    width: "100",
                    resizable: true,
                    cellFilter: 'currency',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
                    enableCellEdit: false,
                    editableCellTemplate: '<div><form name="inputForm"><input type="number" ng-class="\'colt\' + col.uid" ui-grid-editor ng-model="MODEL_COL_FIELD"></form></div>',
                    customTreeAggregationFinalizerFn: function(aggregation) {
                        aggregation.rendered = aggregation.value;
                    }
                },
                { name: 'documento', displayName: '# Documento', width: '200', enableCellEdit: false, headerTooltip: 'Documento # de factura del provedor', cellClass: 'cellToolTip' }, {
                    field: 'saldoPorcentaje',
                    displayName: 'Porcentaje %',
                    width: "100",
                    resizable: true,
                    cellFilter: 'number: 6',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
                    enableCellEdit: false,
                    customTreeAggregationFinalizerFn: function(aggregation) {
                        aggregation.rendered = aggregation.value;
                    }
                },
                { name: 'fechaPromesaPago', displayName: 'Fecha Promesa de Pago', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: "150", resizable: true, enableCellEdit: false },
                { name: 'ordenBloqueada', displayName: 'Bloqueada', width: "100", resizable: true, visible: false },
                { name: 'estGrid', width: "100", resizable: true, displayName: 'Estatus Grid', visible: false },
                { name: 'fechaPago', displayName: 'fechaPago', width: '20%', visible: false },

            ],
            rowTemplate: '<div ng-class="{\'ordenBloqueada\':(row.entity.ordenBloqueada==\'True\' && ((row.entity.idEstatus < 1 || row.entity.idEstatus > 5) && row.entity.idEstatus != 20) && !row.isSelected)' +
                ',\'bloqueadaSelec\': (row.isSelected && row.entity.ordenBloqueada==\'True\') || (row.isSelected && ((row.entity.idEstatus >= 1 && row.entity.idEstatus <= 5) || row.entity.idEstatus == 20)),' +
                '\'selectNormal\': (row.isSelected && row.entity.ordenBloqueada==\'False\' && ((row.entity.idEstatus < 1 || row.entity.idEstatus > 5) && row.entity.idEstatus != 20))' +
                ',\'docIncompletos\': (!row.isSelected && ((row.entity.idEstatus >= 1 && row.entity.idEstatus <= 5) || row.entity.idEstatus == 20) && row.entity.ordenBloqueada==\'False\')' +
                ',\'bloqDocIncom\': (!row.isSelected && ((row.entity.idEstatus >= 1 && row.entity.idEstatus <= 5) || row.entity.idEstatus == 20) && row.entity.ordenBloqueada==\'True\')}"> <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader == \'True\'}" ui-grid-cell></div></div>',
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                $scope.cantidadTotal = $scope.cantidadTotal;
                $scope.gridApi.selection.on.rowSelectionChanged($scope, function(rowChanged) {
                    if (typeof(rowChanged.treeLevel) !== 'undefined' && rowChanged.treeLevel > -1) {
                        children = $scope.gridApi.treeBase.getRowChildren(rowChanged);
                        children.forEach(function(child) {
                            if (rowChanged.isSelected) {
                                $scope.gridApi.selection.selectRow(child.entity);
                            } else {
                                $scope.gridApi.selection.unSelectRow(child.entity);
                            }
                        });
                    }
                });
                gridApi.selection.on.rowSelectionChanged($scope, function(rows) {
                    $scope.mySelections = gridApi.selection.getSelectedRows();
                });

                //$scope.gridApi.selection.selectAllRows(true);
            }
        }
    }; //funcion

    //FAL se analizan los registros para selccionarlos y se obtienen los totales relacionados al grid
    $rootScope.selectAllModal = function() {

        //alert('selectAllModal desde gridModalController');
        // $scope.gridOptionsModal.data.forEach(function (grDatosSel, i)
        // {
        //    if(grDatosSel.ordenBloqueada == 'False')
        //    {
        //           $scope.gridApi.selection.selectRow($scope.gridOptionsModal.data[i]);
        //    };
        // });

        $scope.gridOptionsModal.isRowSelectable = function(row) {
            if (row.entity.ordenBloqueada == 'True') {
                return false;
            } else {
                return true;
            }
        };
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);

    }; //fin funcion selectAllModal

    $rootScope.getDataGridModal = function() {
        //alert('getDataGridModal');
        return $scope.gridOptionsModal.data;
    }

    $rootScope.setDataGridModal = function(data) {
        //alert('freshness');
        $scope.gridOptionsModal.data = data;
    }

    $rootScope.getSelectedRowsModal = function() {

        return $scope.gridApi.selection.getSelectedRows();
    }

});
