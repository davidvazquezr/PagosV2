registrationModule.controller("CuentasProveedorController", function ($scope, uiSortableMultiSelectionMethods, alertFactory, CuentasProveedorRepository) {

$scope.init = function () {

    $scope.llenaProvedoresCuenta()
    $.fn.bootstrapSwitch.defaults.offColor = 'info';
    $.fn.bootstrapSwitch.defaults.onText = 'Todos';
    $.fn.bootstrapSwitch.defaults.offText = 'Pagables';
    $('.switch-checkbox').bootstrapSwitch(); 
    };

 //parametros en duro
    $scope.idEmpleado = 1;
    $scope.idEmpresa = 4;
    $scope.numLote = 2;

//FAL trae las cuentas pagadoras de la empresa
$scope.llenaCuentas = function () 
{
 CuentasProveedorRepository.getCuentas($scope.idEmpresa, $scope.numLote).then(function successCallback(response) 
        {
            $scope.cuentas = response.data;
            var i = 0, j=0;
             $scope.cuentas.push(
                    {
                    aTransferir: 0,banco: "SIN BANCO",cuenta: "SIN CUENTA RELACIONADA",egreso: 1,excedente: 0,id: null,ingreso: 1,
                    saldo: 0,saldoIngreso: 0,total: 0,totalPagar: 0
                    });
            $scope.cuentas.forEach(function (id, cuenta)
            {
             $scope.cuentas[i].lista = llenaLista($scope.cuentas[i].id);
            i++;                            
            });
           

             $scope.rawScreens = $scope.cuentas;
        }

        , function errorCallback(response) {
                 alertFactory.error('Error al obtener los datos de la cuenta.');
            }
        );
}; 

//FAL LLena cada cuenta con los proveedores que paga.
function llenaLista(id) {

        var tmpList = [];
        var i = 0;
        $scope.proveedoresCuenta.forEach(function (idProveedor, idCuentaPagadora)
            {  
                if(id == $scope.proveedoresCuenta[i].idCuentaPagadora)
                {
                    tmpList.push(
                    {
                    text: $scope.proveedoresCuenta[i].nombreProveedor+ '-' + i + id + '-' + $scope.proveedoresCuenta[i].idProveedor,
                    value: $scope.proveedoresCuenta[i].idProveedor+ '-' + i + id + '-' + $scope.proveedoresCuenta[i].idCuentaPagadora
                    });
                 i++;    
                }
                else
                {
                   i++;   
                }   
                                      
            }); 

        return tmpList;
    }

//FAL Trae todos los proveedores de la empresa.
$scope.llenaProvedoresCuenta = function () {
        
        CuentasProveedorRepository.getProvedoresCuenta($scope.idEmpresa)
            .then(function successCallback(response) 
        {
                $scope.proveedoresCuenta = response.data;
                $scope.llenaCuentas();
         }

        , function errorCallback(response) 
        {
                alertFactory.error('Error al obtener los datos del agrupador.');
        });
    };  
   
    $scope.sortingLog = [];

    $scope.sortableOptions = uiSortableMultiSelectionMethods.extendOptions({
        connectWith: ".apps-container"
    });

//Genera el Json a enviar.
    $scope.logModels = function () {
        $scope.sortingLog = [];
        for (var i = 0; i < $scope.rawScreens.length; i++) {
            var logEntry = $scope.rawScreens[i].lista.map(function (x) {
                return x.value;
            }).join(', ');
            logEntry = $scope.rawScreens[i].cuenta + ': ' + logEntry;
            $scope.sortingLog.push(logEntry);
        }
    };

        //FAL Guarda la configuración de los agrupadores y el orden.
   $scope.Guardar = function() {
           CuentasProveedorRepository.setDatos($scope.idEmpresa,$scope.cuentas)
                .then(function successCallback(response) {
                   alertFactory.success('Se guardaron los datos.');

                }, function errorCallback(response) {                
                    alertFactory.error('Error al guardar Datos');
                });
                    
  };//fin de funcion guardar
});



