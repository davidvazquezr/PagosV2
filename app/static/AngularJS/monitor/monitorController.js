registrationModule.controller('monitorController', function($scope, $rootScope, alertFactory, monitorRepository, uiGridGroupingConstants, utils, uiGridConstants) {
    openCloseNav();
    $scope.idEmpresa = '';
    $scope.buscarLotes = false;


    $scope.init = function() {
        console.log('Logre entrar al Monitor :D')
        $scope.BuscarTesoreria();
    };



    $scope.empresaSeleccion = function(empresa) {
        
         $scope.idEmpresa = empresa.emp_idempresa
         $scope.buscarLotes = true;
    }

     $scope.BuscarTesoreria = function() {


        $scope.gridtesoreriaoptions = {
            enableRowSelection: true,
            enableRowHeaderSelection: true
        };

        $scope.gridtesoreriaoptions.columnDefs = [
            { name: 'idLotePago', displayName: 'Lote', width: '5%', enableCellEdit: false, visible: true },
            { name: 'fecha', displayName: 'Fecha Lote', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '10%', enableCellEdit: false },
            { name: 'nombre', width: '15%' },
            { name: 'descLote', displayName: 'Estatus de Lote', width: '15%' },
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


    $scope.BuscarLotesxFechaTesoreria = function(fechaini, fechafin) {

       // var fecha_ini = $scope.formatDate(fechaini);
       // var fecha_fin = $scope.formatDate(fechafin);

        monitorRepository.getLotesxFecha($scope.idEmpresa,77, '2018/05/05', '2018/06/29', 3)
            .then(function successCallback(response) {
              

                if (response.data.length == 0) 
                    alertFactory.infoTopFull('No existen lotes para este rango de fechas');
                  else
                      $scope.gridtesoreriaoptions.data = response.data;
                

            }, function errorCallback(response) {
                alertFactory.error('Error al obtener los datos del encabezado.');
            });
    }

});