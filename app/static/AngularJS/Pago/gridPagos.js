var app = angular.module('app', ['ngAnimate', 'ngTouch', 'ui.grid', 'ui.grid.grouping', 'ui.grid.edit', 'ui.grid.selection', 'ui.grid.cellNav']);

app.controller('MainCtrl', function($scope, $http, $interval, uiGridGroupingConstants, uiGridConstants, $filter, stats) {
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

    $scope.gridOptions = {
        enableFiltering: true,
        enableGroupHeaderSelection: true,
        treeRowHeaderAlwaysVisible: false,
        showColumnFooter: true,
        showGridFooter: false,
        cellEditableCondition: function($scope) {
            // put your enable-edit code here, using values from $scope.row.entity and/or $scope.col.colDef as you desire
            return $scope.row.entity.ordenBloqueada; // in this example, we'll only allow active rows to be edited
        },
        columnDefs: [
            { name: 'cuenta', width: '5%' },
            { name: 'idProveedor', width: '5%' }, {
                name: 'proveedor',
                grouping: { groupPriority: 0 },
                sort: { priority: 0, direction: 'asc' },
                width: '20%',
                cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
            },
            { name: 'documento', width: '25%' },
            { name: 'tipo', width: '5%' },
            { name: 'tipodocto', width: '5%' },
            { name: 'cartera', width: '20%' },
            { name: 'monto', displayName: 'Monto', width: '25%', cellFilter: 'currency' },
            { name: 'saldo', displayName: 'Monto', width: '10%', cellFilter: 'currency' }, {
                field: 'Pagar',
                displayName: 'Pagar (total)',
                width: '15%',
                cellFilter: 'currency',
                aggregationType: uiGridConstants.aggregationTypes.sum,
                treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
                customTreeAggregationFinalizerFn: function(aggregation) {
                    aggregation.rendered = aggregation.value;
                }
            },
            { name: 'moneda', width: '5%' },
            { name: 'fechaVencimiento', displayName: 'fechaVencimiento', type: 'date', cellFilter: 'date:"yyyy-MM-dd"', width: '10%' },
            { name: 'fechaPromesaPago', displayName: 'fechaPromesaPago', type: 'date', cellFilter: 'date:"yyyy-MM-dd"', width: '10%' },
            { name: 'fechaRecepcion', displayName: 'fechaRecepcion', type: 'date', cellFilter: 'date:"yyyy-MM-dd"', width: '10%' },
            { name: 'fechaFactura', displayName: 'fechaFactura', type: 'date', cellFilter: 'date:"yyyy-MM-dd"', width: '10%' },
            { name: 'ordenCompra', width: '5%' },
            { name: 'estatus', width: '5%' },
            { name: 'anticipo', width: '5%' },
            { name: 'anticipoAplicado', width: '5%' },
            { name: 'annio', width: '5%' },
            { name: 'proveedorBloqueado', width: '5%' },
            { name: 'ordenBloqueada', width: '5%' },
            { name: 'diasCobro', width: '5%' },
            { name: 'aprobado', width: '5%' },
            { name: 'contReprog', width: '5%' }
        ],
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
            // $scope.gridApi.grid.registerColumnsProcessor( setGroupValues, 410 );
            $scope.gridApi.selection.on.rowSelectionChanged($scope, function(rowChanged) {
                if (typeof(rowChanged.treeLevel) !== 'undefined' && rowChanged.treeLevel > -1) {
                    // this is a group header
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
        }
    };

    $http.get('http://192.168.20.9/PagosApi/api/pagoapi/1')

    .success(function(data) {
        for (var i = 0; i < data.length; i++) {
            data[i].Pagar = data[i].monto;
            if (data[i].ordenBloqueada == 'False') {
                data[i].Pagar = 0;
            }
        }
        $scope.gridOptions.data = data;
    });

})

app
    .service('stats', function() {

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
