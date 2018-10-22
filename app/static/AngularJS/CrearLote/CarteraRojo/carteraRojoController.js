registrationModule.controller('carteraRojoController', function($scope, $rootScope, alertFactory, carteraRojoRepository) {

    $scope.gridenRojo = null;
    $scope.gridenRojo = [];

    $scope.$watch("customer.idEmpresa", function(newValue, oldValue) {
        $scope.idEmpresa = $scope.customer.idEmpresa
        if ($scope.idEmpresa > 0)
            $scope.init();
    }, true);

    $scope.init = function() {
        $scope.isLoading = false;
        ConfiguraGridenRojo();
        $scope.llenagridenRojo($scope.idEmpresa);
    }

    $scope.llenagridenRojo = function(idempresa) {
        $scope.isLoading = true;
        $scope.GranTotalenRojo = 0;
        carteraRojoRepository.getDatosenRojo(idempresa)
            .then(function successCallback(response) {
                if (response.data.length > 0) {    
                    $scope.gridenRojo.data = response.data;
                    var tamdata = $scope.gridenRojo.data.length;
                    for (var i = 0; i < tamdata; i++) {
                        $scope.GranTotalenRojo = $scope.GranTotalenRojo + $scope.gridenRojo.data[i].saldo;
                    }
                }
                $scope.isLoading = false;
            }, function errorCallback(response) {
                $scope.gridenRojo.data = [];
                $scope.isLoading = false;
            });
    };

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

    var errorCallBack = function(data, status, headers, config) { alertFactory.error('Ocurrio un problema en carteraRojoController.js'); };

});