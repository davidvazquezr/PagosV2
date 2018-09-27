registrationModule.controller("agrupadorController", function ($scope, uiSortableMultiSelectionMethods, alertFactory, agrupadorRepository) {

$scope.init = function () {
      $scope.llenaProvedores()
      $.fn.bootstrapSwitch.defaults.offColor = 'info';
       $.fn.bootstrapSwitch.defaults.onText = 'Todos';
       $.fn.bootstrapSwitch.defaults.offText = 'Pagables';
       $('.switch-checkbox').bootstrapSwitch();   
    };

 //parametros en duro
    $scope.idEmpleado = 1;
    $scope.idEmpresa = 4;

//FAL trae los distintos agrupadores
$scope.llenaAgrupadores = function () {
 agrupadorRepository.getAgrupadores($scope.idEmpresa)
            .then(function successCallback(response) 
        {
            $scope.agrupadores = response.data;
            var i = 0, j=0;
            $scope.agrupadores.forEach(function (pca_idAgrupador, pca_nombre)
            {
             $scope.agrupadores[i].lista = llenaLista($scope.agrupadores[i].pca_idAgrupador);
            i++;                            
            });
             $scope.rawScreens = $scope.agrupadores;
                 
        }

        , function errorCallback(response) {
             alertFactory.error('Error al obtener los datos del agrupador.');
            }
        );
}; 
//FAL en cada lista mete los proveedores correspondientes
function llenaLista(id_agrupador) {

        var tmpList = [];
        var i = 0;
        $scope.proveedores.forEach(function (idProveedor, nomProveedor)
            {  
                if(id_agrupador == $scope.proveedores[i].idAgrupador)
                {
                    tmpList.push(
                    {
                    text: $scope.proveedores[i].nombreProveedor + id_agrupador + '-' + $scope.proveedores[i].idProveedor,
                    value: id_agrupador + '-' + $scope.proveedores[i].idProveedor
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

//Trae todos los proveedores asigandos a idempresa
$scope.llenaProvedores = function () {
        
        //Llamada a repository para obtener data
        agrupadorRepository.getProvedores($scope.idEmpresa)
            .then(function successCallback(response) 
            {
                $scope.proveedores = response.data;
                $scope.llenaAgrupadores();
         }

        , function errorCallback(response) {
                alertFactory.error('Error al obtener los datos del agrupador.');
            }
        );

    };  //Propiedades
   

    $scope.sortingLog = [];
    //Función del Agrupador selector
    $scope.sortableOptions = uiSortableMultiSelectionMethods.extendOptions({
        connectWith: ".apps-container"
    });

    //FAL Funcion que entrega los agrupamientos ordenados
    $scope.logModels = function () {
        $scope.sortingLog = [];
        for (var i = 0; i < $scope.rawScreens.length; i++) {

            

            var logEntry = $scope.rawScreens[i].lista.map(function (x) {
                return x.value;
            }).join(', ');
            logEntry = $scope.rawScreens[i].pca_descripcion + ': ' + logEntry;
            $scope.sortingLog.push(logEntry);
        }
    };
    //FAL Guarda la configuración de los agrupadores y el orden.
   $scope.Guardar = function() {
           agrupadorRepository.setDatos($scope.idEmpresa,$scope.agrupadores)
                .then(function successCallback(response) {
                   alertFactory.success('Se guardaron los datos.');

                }, function errorCallback(response) {                
                    alertFactory.error('Error al guardar Datos');
                });
                    
  };//fin de funcion guardar
  
});



