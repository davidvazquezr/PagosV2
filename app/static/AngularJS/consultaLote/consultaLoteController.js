registrationModule.controller('consultaLoteController', function($scope, $rootScope, alertFactory, consultaLoteRepository,monitorRepository) {
    openCloseNav();

    $rootScope.empresa = "";
    $scope.buscarLotes = false;

    $scope.init = function() {
        console.log('Logre entrar al Consulta Lote :D')
        $scope.BuscarLotes();
    };


    $scope.empresaSeleccion = function(empresa) {
        $rootScope.empresa = empresa;
        $scope.buscarLotes = true;
    };



     $scope.ConsultaLoteObtieneBusqueda = function(Lote, index, esAplicacionDirecta) {
      location.href = '/?idLote=' + Lote.idLotePago;
     };

    $scope.BuscarLotes = function() {

        $rootScope.gridLotesoptions = {
            enableRowSelection: true,
            enableRowHeaderSelection: true
        };

        $rootScope.gridLotesoptions.columnDefs = [
            { name: 'idLotePago', displayName: 'Lote', width: '5%', enableCellEdit: false, visible: true },
            { name: 'fecha', displayName: 'Fecha Lote', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '10%', enableCellEdit: false },
            { name: 'nombre', width: '20%' },
            { name: 'descLote', displayName: 'Estatus de Lote', width: '20%' },
            { name: 'descError', displayName: 'Error', width: '20%', visible: false },
            { name: 'totalPagar', displayName: 'Total a pagar', width: '10%', cellFilter: 'currency', enableCellEdit: false },
            { name: 'cuentaPago', displayName: 'Banco Pago', width: '15%', enableCellEdit: false },
            { name: 'buscar', displayName: 'Buscar', width: '5%', cellTemplate: '<div><button class="btn btn-warning" ><span class="glyphicon glyphicon-search" ng-click="grid.appScope.ConsultaLoteObtieneBusqueda(row.entity,0,0)"></span></button></div>' },
            { name: 'Aplicar', displayName: 'Aplicar', width: '5%', cellTemplate: '<div ng-show="(row.entity.estatus==3) && (row.entity.idTipoPago == 2)"><button class="btn btn-info" ><span class="glyphicon glyphicon-floppy-saved" ng-click="grid.appScope.ConsultaLoteObtieneBusquedaAplicaDirecto(row.entity,0,0)"></span></button></div>' },
            { name: 'Borrar', displayName: 'Borrar', width: '5%', cellTemplate: '<div ng-show="(row.entity.estatus==1)||(row.entity.estatus==2)"><button class="btn btn-danger" ><span class="glyphicon glyphicon-trash" ng-click="grid.appScope.borraLoteBtn(row.entity)"></span></button></div>' },
            { name: 'Libera', displayName: 'Libera', width: '5%', cellTemplate: '<div ng-show="((row.entity.numdetalle - row.entity.numaplicado)>0)" ng-click="grid.appScope.modalLibera(row.entity.idLotePago)"><button class="btn btn-success" ><span class="glyphicon glyphicon-download-alt"></span></button></div>' },
        ];

        $rootScope.gridLotesoptions.multiSelect = false;
        $rootScope.gridLotesoptions.modifierKeysToMultiSelect = false;
        $rootScope.gridLotesoptions.noUnselect = true;
        $rootScope.gridLotesoptions.onRegisterApi = function(gridApi) {
            $scope.gridApiLote = gridApi;
        };
    }



    $scope.Buscar = function(fechaini, fechafin) {
      
        var fecha_ini = $scope.formatDate(fechaini);
        var fecha_fin = $scope.formatDate(fechafin);

        monitorRepository.getLotesxFecha($rootScope.empresa.emp_idempresa, 77, fecha_ini, fecha_fin, 0)
            .then(function successCallback(response) {
                if (response.data.length == 0)
                    alertFactory.infoTopFull('No existen lotes para este rango de fechas');
                else
                    $scope.gridLotesoptions.data = response.data;

            }, function errorCallback(response) {
                alertFactory.error('Error al obtener los datos del encabezado.');
            });
    }


    $scope.modalLibera = function(idLote) {
        $('#modallibera').insertAfter($('body'));
        $('#modallibera').modal('show');
        consultaLoteRepository.getliberar(idLote)
            .then(function successCallback(response) {
                 $rootScope.liberarcxp = response.data;
                $rootScope.idloteliberar = idLote;
            }, function errorCallback(response) {
                alertFactory.error('Los documentos estan aplicados.');
            });
    };

    
    $scope.formatDate = function(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('/');
    }

});