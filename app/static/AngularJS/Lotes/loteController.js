// -- =============================================
// -- Author:  Alejandro Lopez y Fernando Alvarado Luna
// -- Create date: 27/04/2016
// -- Description: Controller para el sistema de programación de pagos
// -- Modificó:
// -- Fecha:
// -- =============================================
registrationModule.controller("pagoController", function($scope, $http, $interval, uiGridGroupingConstants, uiGridConstants, $filter, $rootScope, localStorageService, alertFactory, pagoRepository, stats, $window) {
        
        //$scope.idCuenta = 4;
        $scope.idUsuario = 15;
        //LQMA 04032016
        if ($rootScope.currentEmployee == null) {
            $rootScope.currentEmployee = 15; //25:1;
        } else {
            $scope.idUsuario = $rootScope.currentEmployee;
        }
        $rootScope.currentId = null;
        $rootScope.currentIdOp = null;
        $scope.idLote = 0;
        $rootScope.formData = {};
        $rootScope.proceso = '';
        $scope.radioModel = '';
        $scope.radioTotales = 1;
        $rootScope.escenarios = [];
        $scope.fechaHoy = new Date();
        //FAL20042016
        $rootScope.blTotales = true;
        $rootScope.grdBancos = [];
        $rootScope.msgFiltros = '';
        $rootScope.tipoEmpresa = '';
        $rootScope.pagoDirecto = '';
        $rootScope.tipoEmpresaVarios = true;
        $scope.refMode = true;
        $rootScope.pagoDirectoSeleccion = false;
        $rootScope.pdPlanta = false;
        $rootScope.pdBanco = false;
        $rootScope.refPlanta = 0;
        $rootScope.refpdBanco = 0;
        $rootScope.selPagoDirecto = false;
        $rootScope.selPlantaBanco = false;



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
            $scope.caja = 0;
            $scope.cobrar = 0;
            
            /***********************************************************/
            //LQMA 14032016
            ConfiguraGrid();
            $rootScope.accionPagina = false; //iniciarl el grid modal en llenagrid
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
                        alert('Inicie sesión desde panel de aplicaciones.');
                        //window.close(); 
                    }

                }
            }

            /***********************************************************/
            $scope.transferencias = [{ bancoOrigen: '', bancoDestino: '', importe: 0, disponibleOrigen: 0, index: 0 }];
            $rootScope.idOperacion = 0;
            if (getParameterByName('idOperacion') != '') {
                $rootScope.idOperacion = getParameterByName('idOperacion');
                var idLote = getParameterByName('idLote');
                $rootScope.idAprobador = getParameterByName('idAprobador');
                $rootScope.idAprobacion = getParameterByName('idAprobacion');
                $rootScope.idNotify = getParameterByName('idNotify');
                pagoRepository.getLotes($rootScope.idEmpresa, $rootScope.currentEmployee, 0, idLote)
                    .then(function successCallback(data) {
                            pagoRepository.getTotalxEmpresa($rootScope.idEmpresa)
                                .then(function successCallback(response) {
                                        $rootScope.GranTotal = 0;
                                        $rootScope.TotalxEmpresas = response.data;
                                       
                                        i = 0;
                                        $rootScope.TotalxEmpresas.forEach(function(cuentaPagadora, sumaSaldo) {
                                            $rootScope.GranTotal = $rootScope.GranTotal + $rootScope.TotalxEmpresas[i].sumaSaldo;
                                            i++;
                                        });
                                        $scope.showTotales = true;
                                        $scope.showSelCartera = true;
                                        //LQMA  07032016
                                        //LQMA 14032016
                                    },
                                    function errorCallback(response) {
                                        //oculta la información y manda el total a cero y llena el input del modal
                                        $rootScope.TotalxEmpresas = [];
                                        $rootScope.GranTotal = 0;
                                        $rootScope.showGrid = false;
                                        $scope.showSelCartera = false;
                                        $scope.showTotales = false;
                                        $scope.traeTotalxEmpresa.emp_nombre = 'La empresa seleccionada no tiene información';
                                    });
                            $rootScope.noLotes = data;
                            if ($rootScope.noLotes.data.length > 0) //mostrar boton crear lote
                            {
                                $('#inicioModal').modal('hide');
                                alertFactory.success('Total de lotes: ' + $rootScope.noLotes.data.length);
                                $rootScope.idLotePadre = $rootScope.noLotes.data[$rootScope.noLotes.data.length - 1].idLotePago;
                                $rootScope.estatusLote = $rootScope.noLotes.data[$rootScope.noLotes.data.length - 1].estatus;
                                $rootScope.accionPagina = true;
                                $rootScope.ConsultaLote($rootScope.noLotes.data[$rootScope.noLotes.data.length - 1], $rootScope.noLotes.data.length, 0);
                                $rootScope.ProgPago = true;
                                $rootScope.selPagoDirecto = true;
                                $scope.traeBancosCompleta();

                                setTimeout(function() {
                                    $("#btnSelectAll").click(); //$scope.selectAll();
                                }, 3000);
                            }
                        },
                        function errorCallback(response) {
                            alertFactory.error('Error al obtener el Lote');
                        });
            }
        }; //Fin funcion Init
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
                    $rootScope.currentId = getParameterByName('id');
                }
                if ($rootScope.currentId != null)
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
                $rootScope.currentIdOp = getParameterByName('idOp');
            }
            if ($rootScope.currentIdOp != null) {
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
            $rootScope.showGrid = false;
            pagoRepository.getEmpresas($scope.idUsuario)
                .then(function successCallback(response) {
                    $scope.empresas = response.data;
                    $('#inicioModal').modal('show');
                    $scope.showTotales = false;
                }, function errorCallback(response) {
                    alertFactory.error('Error en empresas.');
                });
        };
        //FAL 23052016 TRAE LOS PARAMETROS DE ESCENARIOS DE PAGOS.

        $scope.llenaParametroEscenarios = function() {
            pagoRepository.getParametrosEscenarios($rootScope.tipoEmpresa)
                .then(function successCallback(response) {
                    $rootScope.escenarios = response.data;
                    $rootScope.pdPlanta = $rootScope.escenarios.Pdbanco;
                    $rootScope.pdBanco = $rootScope.escenarios.Pdplanta;
                    $rootScope.refPlanta = $rootScope.escenarios.TipoRefPlanta;
                    $rootScope.refpdBanco = $rootScope.escenarios.tipoRefBanco;
                    if ($rootScope.pdPlanta || $rootScope.pdBanco) {
                        $rootScope.selPagoDirecto = true;
                    }
                    else
                    {
                        $rootScope.selPagoDirecto = false; 
                    }
                }, function errorCallback(response) {
                    alertFactory.error('Error al obtener los parametros del escenario de pagos.');
                });
        };


        //FAL Trae los bancos x empresa con todos sus saldos
        $scope.traeBancosCompleta = function() {
            //Llamada a repository para obtener data
            //FAL 10042016
            $rootScope.grdBancos = [];
            $rootScope.grdBancosoriginal = [];
            pagoRepository.getBancosCompleta($rootScope.idEmpresa)
                .then(function successCallback(response) {
                    $rootScope.bancosCompletas = response.data;
                    $rootScope.GranTotalaPagar = 0;
                    $rootScope.GranTotalnoPagable = 0;
                    $rootScope.GranTotalPagable = 0;
                    i = 0;
                    $rootScope.bancosCompletas.forEach(function(cuentaPagadora, sumaSaldo) {
                        $rootScope.GranTotalaPagar = $rootScope.GranTotalaPagar + $rootScope.bancosCompletas[i].sumaSaldo;
                        $rootScope.GranTotalnoPagable = $rootScope.GranTotalnoPagable + $rootScope.bancosCompletas[i].sumaSaldoNoPagable;
                        $rootScope.GranTotalPagable = $rootScope.GranTotalPagable + $rootScope.bancosCompletas[i].sumaSaldoPagable;
                        i++;
                    });
                    $rootScope.grdBancosoriginal = $rootScope.grdBancos;
                }, function errorCallback(response) {
                    alertFactory.error('Error en bancos con todos sus saldos.');
                });
        };
        //FAl--Trae el total de bancos de la empresa seleccionada
        $scope.traeTotalxEmpresa = function(emp_idempresa, emp_nombre, emp_nombrecto, rfc, tipo, pagoDirecto) {
            $('#btnTotalxEmpresa').button('loading');
            $scope.showTotales = false;
            $scope.showSelCartera = false;
            //LQMA 14042016
            $rootScope.emp_nombrecto = emp_nombrecto;
            $rootScope.rfc = rfc;
            pagoRepository.getTotalxEmpresa(emp_idempresa)
                .then(function successCallback(response) {
                    $rootScope.GranTotal = 0;
                    $rootScope.TotalxEmpresas = response.data;
                    $rootScope.idEmpresa = emp_idempresa;
                    i = 0;
                    $rootScope.TotalxEmpresas.forEach(function(cuentaPagadora, sumaSaldo) {
                        $rootScope.GranTotal = $rootScope.GranTotal + $rootScope.TotalxEmpresas[i].sumaSaldo;
                        i++;
                    });
                    $scope.traeTotalxEmpresa.emp_nombre = emp_nombre;
                    $scope.showTotales = true;
                    $rootScope.tipoEmpresa = tipo;
                    $rootScope.pagoDirecto = pagoDirecto;
                    $scope.showSelCartera = true;
                    $scope.ObtieneLotes(0);
                    $('#btnTotalxEmpresa').button('reset');
                    $scope.llenaParametroEscenarios();

                    $scope.traeBancosCompleta();


                }, function errorCallback(response) {
                    //oculta la información y manda el total a cero y llena el input del modal
                    $rootScope.TotalxEmpresas = [];
                    $rootScope.GranTotal = 0;
                    $rootScope.showGrid = false;
                    $scope.showSelCartera = false;
                    $scope.showTotales = false;
                    $scope.traeTotalxEmpresa.emp_nombre = 'La empresa seleccionada no tiene información';
                    $('#btnTotalxEmpresa').button('reset');
                });
            
        };


        $scope.ObtieneLotes = function(newLote) //borraLote, 0 para borrar lotes sin relacion, 1 para conservarlos
            {
                pagoRepository.getLotes($rootScope.idEmpresa, $rootScope.currentEmployee, 0, 0)
                    .then(function successCallback(data) {
                            var EsPagoDirecto = 0;
                            if ($rootScope.selPlantaBanco) {
                                EsPagoDirecto = 1;
                            }

                            $rootScope.noLotes = data;
                            if (newLote != 0) {
                                $rootScope.noLotes.data.push(newLote);
                                $rootScope.estatusLote = 0;
                            }
                            if ($rootScope.noLotes.data.length > 0) //mostrar boton crear lote
                            {
                                alertFactory.success('Total de lotes: ' + $rootScope.noLotes.data.length);
                                $rootScope.idLotePadre = $rootScope.noLotes.data[$rootScope.noLotes.data.length - 1].idLotePago;
                                $rootScope.estatusLote = $rootScope.noLotes.data[$rootScope.noLotes.data.length - 1].estatus;
                                $rootScope.ConsultaLote($rootScope.noLotes.data[$rootScope.noLotes.data.length - 1], $rootScope.noLotes.data.length, 0, EsPagoDirecto);
                                $rootScope.ProgPago = true;

                            } else {
                                alertFactory.info('No existen Lotes');
                                $rootScope.NuevoLote = true;

                                var date = new Date();
                                $rootScope.formData.nombreLoteNuevo = ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + date.getFullYear() + '-' + $rootScope.rfc + ('0' + ($rootScope.noLotes.data.length + 1)).slice(-2); //'-01';
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
                    $rootScope.ingresos = response.data;
                    $scope.LlenaEgresos();
                }, function errorCallback(response) {
                    alertFactory.error('Error al obtener los Ingresos');
                });
        };
        // $scope.LlenaEgresos = function() {
        //     pagoRepository.getEgresos($rootScope.idEmpresa, $scope.idLote) 
        //         .then(function successCallback(response) {
        //             $rootScope.egresos = response.data;
        //             angular.forEach($rootScope.TotalxEmpresas, function(empresa, key) {
        //                 angular.forEach($rootScope.egresos, function(egreso, key) {
        //                     if (empresa.cuentaPagadora == egreso.cuenta)
        //                         egreso.totalPagar = empresa.sumaSaldo;
        //                 });
        //             });
        //             angular.forEach($rootScope.egresos, function(egreso, key) {
        //                 angular.forEach($rootScope.ingresos, function(ingreso, key) {
        //                     if (ingreso.cuenta == egreso.cuenta)
        //                         egreso.ingreso = 1;
        //                 });
        //             });
        //             $scope.calculaTotalOperaciones();
        //             recalculaIngresos();
        //         }, function errorCallback(response) {
        //             alertFactory.error('Error al obtener los Egresos');
        //         });
        // };

         $scope.LlenaEgresos = function() {
            pagoRepository.getEgresos($rootScope.idEmpresa, $scope.idLote) 
                .then(function successCallback(response) {
                    $rootScope.egresos = response.data;
                    angular.forEach($rootScope.grdBancos, function(empresa, key) {


                        angular.forEach($rootScope.egresos, function(egreso, key) {
                            if (empresa.cuentaPagadora == egreso.cuenta)
                                egreso.totalPagar = empresa.subtotal;
                        });


                    });
                    angular.forEach($rootScope.egresos, function(egreso, key) {
                        angular.forEach($rootScope.ingresos, function(ingreso, key) {
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
                $rootScope.selectAllModal();
                //FAL evita que se alteren los datos al seleccionar todos
                $rootScope.showGrid = true;
            }, 5000);
            /************************************************************************************************************************/
        };
        //FAl--Oculta el grid del Modal y asigna la variable toda la cartera true
        $scope.OcultaGridModal = function(value) {
            $('#btnTodalaCartera').button('loading');
            $rootScope.selectAllModal();
            $rootScope.showGrid = value;
            $('#btnTodalaCartera').button('reset');
        };
        //LQMA 07032016
        $scope.IniciaLote = function() {
            $rootScope.crearLote = true;
            $rootScope.selPlantaBanco = false;
            $('#btnCrealote').button('loading');
            if ($rootScope.formData.nombreLoteNuevo == null) {
                alertFactory.warning('Debe proporcionar el nombre del nuevo lote.');
                $('#btnCrealote').button('reset');
            } else {
                //Configura GRID ECG
                $scope.gridOptions = null;
                ConfiguraGrid();
                //LQMA 10032016
                $rootScope.NuevoLote = true;
                //LQMA add 08042016
                pagoRepository.getDatos($rootScope.idEmpresa)
                    .success(getCarteraCallback)
                    .error(errorCallBack);
            }
        }; //FIN inicia Lote

        $scope.IniciaLotePD = function() {
            $rootScope.crearLote = true;
            $rootScope.pagoDirectoSeleccion = true;
            $rootScope.selPlantaBanco = true;
            $('#btnCrealotePD').button('loading');
            if ($rootScope.formData.nombreLoteNuevo == null) {
                alertFactory.warning('Debe proporcionar el nombre del nuevo lote.');
                $('#btnCrealotePD').button('reset');
            } else {
                //Configura GRID ECG
                $scope.gridOptions = null;
                ConfiguraGrid();
                //LQMA 10032016
                $rootScope.NuevoLote = true;
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
            $rootScope.accionPagina = true;
            setTimeout(function() {
                $("#btnSelectAll").click();
            }, 500);
            $scope.grdinicia = $scope.grdinicia + 1;
        }
        $scope.llenaGrid = function() {
            //LQMA 16032016
            if (!$rootScope.showGrid) { //LQMA  si esta oculto, consultamos toda la cartera
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
            var contador = 1;
            
            $rootScope.pdPlanta = $rootScope.escenarios.Pdplanta;
            $rootScope.pdBanco = $rootScope.escenarios.Pdbanco;
            $rootScope.refPlanta = $rootScope.escenarios.TipoRefPlanta;
            $rootScope.refpdBanco = $rootScope.escenarios.tipoRefBanco;
            $rootScope.grdPagoDirecto = [];
            var j = 0;
            var tamdata = $scope.data.length;
            for (var i = 0; i < tamdata; i++) {



                $scope.data[i].Pagar = $scope.data[i].saldo;
                $scope.data[i].fechaPago = $scope.data[i].fechaPromesaPago;

                if ($scope.data[i].fechaPromesaPago == "1900-01-01T00:00:00") {
                    $scope.data[i].fechaPromesaPago = "";
                }
                //FAL 23052016 dependiendo la lista de 
                if ($rootScope.pdPlanta) {
                    if ($scope.data[i].idProveedor == 7) {
                        $scope.data[i].referencia = 'Planta';
                    var datadirecto = $scope.data[i];
                    $rootScope.grdPagoDirecto.push(datadirecto);
                    } else {
                        $scope.data[i].referencia = '';
                    }
                }
                if ($rootScope.pdPlanta) {
                    if ($scope.data[i].idProveedor == 6) {
                        $scope.data[i].referencia = 'Financiera';
                      var datadirecto = $scope.data[i];
                    $rootScope.grdPagoDirecto.push(datadirecto);
                    }
                }
                if ($rootScope.pdBanco) {
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

                if (($scope.data[i].numeroSerie).length == 17) {
                    $scope.data[i].referencia = $scope.data[i].numeroSerie.substring(9, 17);
                }

                //FAL17052016 Valido si lleva numero de serie y si es de lenght = 17 lo pango en referencia.
                $scope.carteraVencida = $scope.carteraVencida + $scope.data[i].saldo;

                
                                
            }
            $scope.noPagable = $scope.carteraVencida - $scope.cantidadTotal;

            //FAL 20062016 separación de cartera en caso de pago directo

            if ($rootScope.selPlantaBanco) {
                
                 $rootScope.datosModal = $rootScope.grdPagoDirecto;

            }
            else
            {
                 $rootScope.datosModal = $scope.data;

            }

           

            var newLote = { idLotePago: '0', idEmpresa: $rootScope.idEmpresa, idUsuario: $rootScope.currentEmployee, fecha: '', nombre: $rootScope.formData.nombreLoteNuevo, estatus: 0 };
            $scope.ObtieneLotes(newLote);
            $scope.LlenaIngresos();
            $rootScope.estatusLote = 0;
            //LQMA 15032016
            $rootScope.accionPagina = true;
            $rootScope.grdApagar = 0;
            //FAL 19042016 llena totales de bancos desde la consulta
            $rootScope.grdBancos = [];
            $rootScope.grdApagar = 0;
            $rootScope.bancosCompletas.forEach(function(banco, k) {
                $rootScope.grdBancos.push({
                    banco: banco.cuentaPagadora,
                    subtotalLote: 0,
                    subtotal: banco.sumaSaldoPagable
                });
                $rootScope.grdApagar = $rootScope.grdApagar + banco.sumaSaldoPagable;
            });
            $rootScope.blTotales = true;
            $rootScope.idOperacion = 0;
        };
        //LQMA ADD 08042016 Cuando ya existe un lote.
        var llenaLoteConsultaSuccessCallback = function(data, status, headers, config) {
            $rootScope.grdBancos = [];
            $rootScope.grdApagar = 0;
            if ($scope.gridOptions == null)
                ConfiguraGrid();

            $scope.gridOptions.data = null;
            $scope.gridOptions.data = data;
            $scope.data = data;
            $scope.carteraVencida = 0;
            $scope.cantidadTotal = 0;
            $scope.cantidadUpdate = 0;
            $scope.noPagable = 0;
            $scope.Reprogramable = 0;

            $rootScope.pdPlanta = $rootScope.escenarios.Pdbanco;
            $rootScope.pdBanco = $rootScope.escenarios.Pdplanta;
            $rootScope.refPlanta = $rootScope.escenarios.TipoRefPlanta;
            $rootScope.refpdBanco = $rootScope.escenarios.tipoRefBanco;

            var cuentaEncontrada = true;
            for (var i = 0; i < $scope.data.length; i++) {

                $scope.data[i].Pagar = $scope.data[i].saldo;
                $scope.data[i].fechaPago = $scope.data[i].fechaPromesaPago;
                if ($scope.data[i].fechaPromesaPago == "1900-01-01T00:00:00") {
                    $scope.data[i].fechaPromesaPago = "";
                }
                 if ($scope.data[i].agrupamiento > 0) {
                    $scope.data[i].agrupar = 1;
                }
                if ($scope.data[i].seleccionable == "False") {
                    $scope.data[i].estGrid = 'Pago';
                    if (i == 0) {
                        $rootScope.grdBancos.push({
                            banco: $scope.data[i].cuentaPagadora,
                            subtotal: $scope.data[i].Pagar
                        });
                        $rootScope.grdApagar = $rootScope.grdApagar + $scope.data[i].Pagar;
                    } else {
                        cuentaEncontrada = false;
                        $rootScope.grdBancos.forEach(function(banco, k) {
                            if ($scope.data[i].cuentaPagadora == $rootScope.grdBancos[k].banco) {
                                $rootScope.grdBancos[k].subtotal = Math.round($rootScope.grdBancos[k].subtotal * 100) / 100 + Math.round($scope.data[i].Pagar * 100) / 100;
                                $rootScope.grdApagar = $rootScope.grdApagar + Math.round($scope.data[i].Pagar * 100) / 100;
                                cuentaEncontrada = true;
                            }
                        });
                        if (!cuentaEncontrada) {
                            $rootScope.grdBancos.push({
                                banco: $scope.data[i].cuentaPagadora,
                                subtotal: $scope.data[i].Pagar
                            });
                            $rootScope.grdApagar = $rootScope.grdApagar + $scope.data[i].Pagar;
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
                $scope.carteraVencida = $scope.carteraVencida + $scope.data[i].saldo;
            }
            $scope.noPagable = $scope.carteraVencida - $scope.cantidadTotal;

            $scope.gridOptions.data = data;

             ConfiguraGridxvencer();

            $scope.llenagridxvencer($rootScope.idEmpresa);

            $rootScope.blTotales = false;
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
        //FAL crea los campos del grid y las rutinas en los eventos del grid.
        var ConfiguraGrid = function() {

            $scope.idEmpleado = $rootScope.currentEmployee;
            $scope.gridOptions = {
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
                            name: 'proveedor',
                            grouping: { groupPriority: 1 },
                            sort: { priority: 1, direction: 'asc' },
                            width: '20%',
                            name: 'proveedor',
                            enableCellEdit: false,
                            cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
                        },
                        { name: 'documento', displayName: '# Documento', width: '15%', enableCellEdit: false, headerTooltip: 'Documento # de factura del provedor', cellClass: 'cellToolTip' },
                        { name: 'ordenCompra', displayName: 'Orden de compra', width: '13%', enableCellEdit: false, cellTemplate: '<div class="urlTabla" ng-class="col.colIndex()" ><a tooltip="Ver en digitalización" class="urlTabla" href="http://192.168.20.9:3200/?id={{row.entity.ordenCompra}}&employee=' + $scope.idEmpleado + '" target="_new">{{row.entity.ordenCompra}}</a></div>' },
                        { name: 'monto', displayName: 'Monto', width: '15%', cellFilter: 'currency', enableCellEdit: false },
                        { name: 'saldo', displayName: 'Saldo', width: '15%', cellFilter: 'currency', enableCellEdit: false },
                        {
                            field: 'Pagar',
                            displayName: 'Pagar (total)',
                            width: '10%',
                            cellFilter: 'currency',
                            enableCellEdit: ($rootScope.currentIdOp == 1) ? false : true,
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
                        { name: 'fechaFactura', displayName: 'Fecha Factura', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', width: '17%', enableCellEdit: false },
                         {
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
                                $rootScope.grdNoIncluido = Math.round($rootScope.grdNoIncluido * 100) / 100 - Math.round(grdPagarxdocumento * 100) / 100;
                                if ($rootScope.grdNoIncluido < 0) { $rootScope.grdNoIncluido = 0; }
                                //FAL actualizar cuenta pagadoras
                                if ($scope.grdinicia > 0) {
                                    i = 0;
                                    if (row.entity.estGrid == 'Pago Reprogramado') {
                                        $rootScope.grdReprogramado = Math.round($rootScope.grdReprogramado * 100) / 100 - Math.round(row.entity.Pagar * 100) / 100;
                                    };
                                    $rootScope.grdBancos.forEach(function(banco, subtotal) {
                                        if (row.entity.cuentaPagadora == $rootScope.grdBancos[i].banco) {
                                            $rootScope.grdBancos[i].subtotal = Math.round($rootScope.grdBancos[i].subtotal * 100) / 100 + Math.round(grdPagarxdocumento * 100) / 100;
                                            $rootScope.grdApagar = $rootScope.grdApagar + row.entity.Pagar;
                                            row.entity.estGrid = 'Pago'
                                        }
                                        i++;
                                    });
                                }
                            } else {
                                $rootScope.grdNoIncluido = Math.round($rootScope.grdNoIncluido * 100) / 100 + Math.round(grdPagarxdocumento * 100) / 100;
                                //FAL actualizar cuenta pagadoras
                                i = 0;
                                if ($scope.grdinicia > 0) {
                                    $rootScope.grdBancos.forEach(function(banco, subtotal) {
                                        if (row.entity.cuentaPagadora == $rootScope.grdBancos[i].banco) {
                                            $rootScope.grdBancos[i].subtotal = Math.round($rootScope.grdBancos[i].subtotal * 100) / 100 - Math.round(grdPagarxdocumento * 100) / 100;
                                            $rootScope.grdApagar = $rootScope.grdApagar - row.entity.Pagar;
                                            if (row.entity.estGrid != 'Pago Reprogramado') {
                                                row.entity.estGrid = 'Permitido'
                                            } else {
                                                $rootScope.grdReprogramado = Math.round($rootScope.grdReprogramado * 100) / 100 + Math.round(row.entity.Pagar * 100) / 100;
                                            }
                                        };
                                        i++;
                                    });
                                }
                            }

                             $scope.calculaTotalOperaciones();
                             recalculaIngresos();

                        });
                        gridApi1.selection.on.rowSelectionChangedBatch($scope, function(rows) {
                            //FAL 29042016 cambio de seleccion de padres
                            var i = 0;
                            var numcuentas = $rootScope.grdBancos.length;
                            $rootScope.grdNoIncluido = 0;
                            if ($scope.grdinicia > 0) {
                                $rootScope.grdBancos.forEach(function(banco, l) {
                                    $rootScope.grdBancos[l].subtotal = 0;
                                    $rootScope.grdApagar = 0;
                                });
                            }
                            if ($scope.grdinicia > 0) {
                                rows.forEach(function(row, i) {
                                    if (row.isSelected) {
                                        if (row.entity.seleccionable == 'False') {
                                            row.entity.estGrid = 'Pago';
                                            $rootScope.grdNoIncluido = 0;
                                            for (var i = 0; i < numcuentas; i++) {
                                                if (row.entity.cuentaPagadora == $rootScope.grdBancos[i].banco) {
                                                    $rootScope.grdBancos[i].subtotal = Math.round($rootScope.grdBancos[i].subtotal * 100) / 100 + Math.round(row.entity.Pagar * 100) / 100;
                                                    $rootScope.grdApagar = $rootScope.grdApagar + row.entity.Pagar;
                                                    i = numcuentas;
                                                }
                                            };
                                            $rootScope.grdNoIncluido = 0;
                                        }
                                    } else {
                                        if (row.entity.seleccionable == 'False') {
                                            row.entity.estGrid = 'Permitido';
                                            $rootScope.grdNoIncluido = $rootScope.grdApagarOriginal;
                                            row.treeNode.parentRow.treeNode.row.isSelected = false;
                                            row.treeNode.parentRow.treeNode.parentRow.treeNode.row.isSelected = false;
                                            $rootScope.grdApagar = 0;
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
                            var numcuentas = $rootScope.grdBancos.length;
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
                                            $rootScope.grdReprogramado = Math.round($rootScope.grdReprogramado * 100) / 100 - Math.round(rowEntity.Pagar * 100) / 100;
                                        }
                                        for (var i = 0; i < numcuentas; i++) {
                                            if (rowEntity.cuentaPagadora == $rootScope.grdBancos[i].banco) {
                                                $rootScope.grdBancos[i].subtotal = Math.round($rootScope.grdBancos[i].subtotal * 100) / 100 + Math.round($scope.cantidadUpdate * 100) / 100;
                                                i = numcuentas;
                                            }
                                        };
                                        $rootScope.grdNoIncluido = Math.round($rootScope.grdNoIncluido * 100) / 100 - Math.round($scope.cantidadUpdate * 100) / 100;
                                        $rootScope.grdApagar = Math.round($rootScope.grdApagar * 100) / 100 + Math.round($scope.cantidadUpdate * 100) / 100;
                                        rowEntity.estGrid = 'Pago';
                                        rowEntity.fechaPromesaPago = old_date;
                                    }
                                }
                                //FAL valido la referencia.
                                if (colDef.name == 'referencia') {
                                    if (newValue.length > 30) {
                                        alertFactory.warning('La referencia no puede tener más de 30 caracteres');
                                        rowEntity.referencia = oldValue;
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
                } //grid options
        }; //funcion
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
                    }
                } else {
                    if (rowEntity.row.entity.seleccionable == "False") {
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
            $rootScope.grdApagarOriginal = 0;
            //$rootScope.grdnoPagable = 0;
            $scope.etqFiltros = "Todos";
            $scope.grdinicia = 0;
            //LQMA 14032016

            $scope.gridOptions.data.forEach(function(grDatosSel, i) {
                if (grDatosSel.seleccionable == 'True') {
                    $rootScope.grdnoPagable = Math.round($rootScope.grdnoPagable * 100) / 100 + Math.round(grDatosSel.saldo * 100) / 100;
                } else {
                    if (opcion == 0)
                        $scope.gridApi1.selection.selectRow($scope.gridOptions.data[i]);
                };
            });


            $rootScope.grdReprogramado = 0;
            $rootScope.grdNoIncluido = 0;
            $rootScope.grdApagarOriginal = $rootScope.grdApagar;

            if ($rootScope.selPlantaBanco) {
                $scope.gridOptions.isRowSelectable = function(row) {
                    if ((row.entity.seleccionable == 'True') || (row.entity.referencia == 'Planta') || (row.entity.referencia == 'Financiera')) {
                        return true;
                    } else {
                        return false;
                    }
                };
            } else {
                $scope.gridOptions.isRowSelectable = function(row) {
                    if ((row.entity.seleccionable == 'True') || (row.entity.referencia == 'Planta') || (row.entity.referencia == 'Financiera')) {
                        return false;
                    } else {
                        return true;
                    }
                };
            }



            $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
            $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
            $scope.gridApi1.selection.selectAllRows(true);

            $scope.grdinicia = $scope.grdinicia + 1;
        };

        //FAL 06052016 funcion para tratar los escenarios en la edición del lote.

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

            //$scope.filteredRows = $scope.gridApi1.core.getVisibleRows($scope.gridApi1.grid);
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
            $rootScope.msgFiltros = 'Calculando....';
            $scope.etqFiltros = texto;
            $scope.BorraFiltrosParciales();
            $scope.gridApi1.grid.columns[campo].filters[0].term = value;
            $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            $scope.gridApi1.grid.refresh();
            $rootScope.msgFiltros = '';
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
            $rootScope.msgFiltros = 'Calculando....';
            $scope.etqFiltros = "Todos";
            $scope.gridApi1.grid.columns.forEach(function(col, i) {
                $scope.gridApi1.grid.columns[i].filters[0].term = '';
            });
            $scope.gridApi1.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            $scope.gridApi1.grid.refresh();
            $rootScope.msgFiltros = '';
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
        $rootScope.ConsultaLote = function(Lote, index, mensaje, esAplicacionDirecta) {

            if (mensaje == 1) {
                if (confirm('¿Al cambiar de lote se perderan los cambios no guardados. Desea continuar??')) {
                    $rootScope.ConsultaLoteObtiene(Lote, index, esAplicacionDirecta);
                }
            } else {
                $rootScope.ConsultaLoteObtiene(Lote, index, esAplicacionDirecta);
            }
        }
        $rootScope.ConsultaLoteObtiene = function(Lote, index, esAplicacionDirecta) {
                alertFactory.info('Consulta de Lote ' + index);
                $scope.idLote = Lote.idLotePago;
                $rootScope.grdnoPagable = 0;
                $rootScope.idLotePadre = Lote.idLotePago;
                $rootScope.nombreLote = Lote.nombre;
                $rootScope.estatusLote = Lote.estatus;
                $rootScope.NuevoLote = false;
                if (Lote.pal_esAplicacionDirecta == 1 || esAplicacionDirecta == 1) {
                    $rootScope.pagoDirectoSeleccion = true;
                    $rootScope.selPlantaBanco = true;

                } else {
                    $rootScope.pagoDirectoSeleccion = false;
                    $rootScope.selPlantaBanco = false;

                }
                if ($rootScope.estatusLote == 2)
                {
                   $scope.expaprobado = true;
                }
                else
                {
                   $scope.expaprobado = false; 
                }
                //LQMA 14032016
                if ($rootScope.accionPagina) { //LQMA 15032016: true: indica que se esta trabajando sobre la pagina para consultar data, false: consulta desde el modal
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
                    if ($rootScope.estatusLote == 0) { //LQMA 08042016 entra cuando el lote es nuevo
                        $scope.gridOptions.data = $rootScope.datosModal; //$rootScope.modalSeleccionados;

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
                        if ($rootScope.crearLote) {
                            $('#inicioModal').modal('hide');
                            $rootScope.crearLote = false;
                        }
                        //$scope.selectAll(0);
                    } else //LQMA 08042016 entra cuando se consulta un lote guardado
                        pagoRepository.getDatosAprob($scope.idLote)
                        .success(llenaLoteConsultaSuccessCallback) //LQMA 08042016.success(llenaGridSuccessCallback)
                        .error(errorCallBack);
                    setTimeout(function() {
                        $("#btnSelectAll").click(); //$scope.selectAll();
                    }, 500);
                }
                $scope.grdinicia = $scope.grdinicia + 1;
            }
            //LQMA funcion para guardar datos del grid (se implementara para guardar Ingresos bancos, otros , Transferencias)
        $scope.Guardar = function(opcion, valor) {
            $('#btnGuardando').button('loading');
            var negativos = 0;
            var saldo = 0;
            if (opcion == 3)
            {
                saldo = 1;
            }
            angular.forEach($rootScope.ingresos, function(ingreso, key) {
                if (parseInt(ingreso.disponible) < 0)
                    negativos += 1;
                saldo = parseInt(saldo) + parseInt(ingreso.saldo);
            });
            setTimeout(function() { guardaValida(negativos, saldo, opcion, valor); }, 500);
        }; //fin de funcion guardar
        $scope.Cancelar = function() {
            //LQMA 16032016
            $scope.gridOptions.data = [];
            $rootScope.noLotes = null;
            $scope.ObtieneLotes(0);
            setTimeout(function() {
                if ($rootScope.noLotes.data.length == 0) {
                    $rootScope.NuevoLote = true;
                    $rootScope.estatusLote = 0;
                    $rootScope.CrearNuevoLote();
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
   
            if ($rootScope.selPlantaBanco) {
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
                if (rows.length == 0) {
                    alertFactory.warning('Debe seleccionar al menos un documento para guardar un lote.');
                    $('#btnGuardando').button('reset');
                    $('#btnAprobar').button('reset');
                } else {
                    var EsPagoDirecto = 0;
                    if ($rootScope.selPlantaBanco) {
                        EsPagoDirecto = 1
                    }
                    pagoRepository.getPagosPadre($rootScope.idEmpresa, $rootScope.currentEmployee, $rootScope.formData.nombreLoteNuevo, $rootScope.idLotePadre, EsPagoDirecto)
                        .then(function successCallback(response) {
                            $rootScope.idLotePadre = response.data;
                            var array = [];
                            var count = 0;
                            rows.forEach(function(row, i) {
                                var elemento = {};
                                elemento.pal_id_lote_pago = $rootScope.idLotePadre; //response.data;
                                elemento.pad_polTipo = row.polTipo; //entity.polTipo;
                                elemento.pad_polAnnio = row.annio;
                                elemento.pad_polMes = row.polMes;
                                elemento.pad_polConsecutivo = row.polConsecutivo;
                                elemento.pad_polMovimiento = row.polMovimiento;
                                elemento.pad_fechaPromesaPago = (row.fechaPromesaPago == '' ? '1900-01-01T00:00:00' : row.fechaPromesaPago);

                                elemento.pad_saldo = row.Pagar; //row.saldo;//

                                if ((row.referencia == null) || (row.referencia == undefined) || (row.referencia == "")) {
                                    row.referencia = "AUT";
                                }
                                elemento.pad_documento = row.documento;
                                elemento.pad_polReferencia = row.referencia; //FAL 09052015 mandar referencia
                                elemento.tab_revision = 1;
                                array.push(elemento);
                            });
                            var jsIngresos = angular.toJson($rootScope.ingresos); //delete $scope.ingresos['$$hashKey'];
                            var jsTransf = angular.toJson($scope.transferencias);
                            var jsEgresos = angular.toJson($rootScope.egresos);
                            pagoRepository.setDatos(array, $rootScope.currentEmployee, $rootScope.idLotePadre, jsIngresos, jsTransf, $scope.caja, $scope.cobrar, jsEgresos, ($rootScope.estatusLote == 0) ? 1 : 2)
                                .then(function successCallback(response) {
                                    alertFactory.success('Se guardaron los datos.');
                                    $rootScope.estatusLote = 1;
                                    angular.forEach($rootScope.noLotes.data, function(lote, key) {
                                        if (lote.idLotePago == $scope.idLote) {
                                            lote.idLotePago = $rootScope.idLotePadre;
                                            lote.estatus = 1;
                                        }
                                    });
                                    $('#btnGuardando').button('reset');
                                    if (opcion == 2) { //aprobacion
                                        pagoRepository.setAprobacion(1, valor, $rootScope.idEmpresa, $rootScope.idLotePadre, $rootScope.currentEmployee, $rootScope.idAprobador, $rootScope.idAprobacion, $rootScope.idNotify, $rootScope.formData.Observacion)
                                            .then(function successCallback(response) {
                                                if (valor == 3) {
                                                    alertFactory.success('Se aprobo el lote con exito');
                                                    $('#btnAprobar').button('reset');
                                                } else //rechazado
                                                {
                                                    alertFactory.success('Se rechazo el lote con exito');
                                                    $('#btnRechazar').button('reset');
                                                }
                                                $rootScope.idOperacion = 0;
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
                                    if (opcion == 3) { //aprobacion
                                        pagoRepository.setAplicacion($rootScope.idEmpresa, $rootScope.idLotePadre, $rootScope.currentEmployee)
                                            .then(function successCallback(response) {
                                                if (valor == 3) {
                                                    alertFactory.success('Se aprobo el lote con exito');
                                                    $('#btnAprobar').button('reset');
                                                } else //rechazado
                                                {
                                                    alertFactory.success('Se rechazo el lote con exito');
                                                    $('#btnRechazar').button('reset');
                                                }
                                                $rootScope.idOperacion = 0;
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
                angular.forEach($rootScope.ingresos, function(ingreso, key) {
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
        $scope.calculaSaldoIngresos = function(ingreso) {
            var total = 0;
            angular.forEach($scope.transferencias, function(transferencia, key) {
                if (transferencia.bancoOrigen == ingreso.cuenta) {
                    total = parseInt(total) + parseInt(transferencia.importe);
                }
            });
            ingreso.disponible = parseInt(ingreso.saldo) - parseInt(total);
            angular.forEach($rootScope.egresos, function(egreso, key) {
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
                angular.forEach($rootScope.ingresos, function(ingreso, key) {
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
            angular.forEach($rootScope.ingresos, function(ingreso, key) {
                ingreso.disponible = ingreso.saldo;
                angular.forEach($scope.transferencias, function(transferencia, key) {
                    if (ingreso.cuenta == transferencia.bancoOrigen)
                        ingreso.disponible = ingreso.disponible - transferencia.importe;
                });
                angular.forEach($rootScope.TotalxEmpresas, function(empresa, key) {
                    angular.forEach($rootScope.egresos, function(egreso, key) {
                        //FAL integra estos calculos al arreglo de bancos para presentar en tiempo real como se va acabando el dinero.
                        if (empresa.cuentaPagadora == egreso.cuenta)
                            empresa.saldoLote = egreso.total;
                    });
                });
            });
            angular.forEach($rootScope.egresos, function(egreso, key1) {
                angular.forEach($rootScope.grdBancos, function(grdBanco, key2) {
                    if (egreso.cuenta == grdBanco.banco)
                        grdBanco.subtotalLote = egreso.total;
                });
            });
        }
               $scope.calculaTotalOperaciones = function() {
            //$scope.egresos = [{id: 1,nombre:'HSBC', cuenta: 228139,saldo: 90000, aTransferir: 25000, total:0,excedente:0, ingreso:1, egreso:0},
                angular.forEach($rootScope.egresos, function(egreso, keyegreso) {
                var totalDestino = 0;
                var montoApagara = 0;
                angular.forEach($scope.transferencias, function(transferencia, key) {
                    if (transferencia.bancoDestino == egreso.cuenta)
                        totalDestino = totalDestino + parseInt(transferencia.importe);
                });

                angular.forEach($rootScope.ingresos, function(ingreso, key) {
                    if ((ingreso.cuenta == egreso.cuenta) && egreso.ingreso == 1)
                        egreso.saldoIngreso = ingreso.saldo;
                });

                angular.forEach($scope.transferencias, function(retiro, key) {
                    if (retiro.bancoOrigen == egreso.cuenta)
                        $rootScope.egresos[keyegreso].saldoIngreso = $rootScope.egresos[keyegreso].saldoIngreso - parseInt(retiro.importe);
                });

                egreso.aTransferir = totalDestino;
                var sss = parseInt(egreso.ingreso);
                var suma = (sss == 1) ? parseInt(egreso.saldoIngreso) : parseInt(egreso.saldo);
                
                egreso.total = parseInt(egreso.aTransferir) + suma;

                angular.forEach($rootScope.grdBancos, function(banco, key) {
                    if (banco.banco == egreso.cuenta)
                        egreso.excedente = egreso.total - banco.subtotal;
                });
                
                // 
                //egreso.excedente = egreso.totalPagar - egreso.total;
                // egreso.excedente = parseInt(egreso.total) - parseInt(egreso.totalPagar) ;
            });
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
                        angular.forEach($rootScope.egresos, function(egreso, key) {
                            total += parseInt(egreso.total);
                        });
                        $rootScope.FlujoEfectivo = total;
                        break;
                    case 'ingresoSaldo':
                        angular.forEach($rootScope.ingresos, function(ingreso, key) {
                            total += parseInt((ingreso.saldo == '') ? 0 : ingreso.saldo);
                        });
                        break;
                    case 'ingresoDisponible':
                        angular.forEach($rootScope.ingresos, function(ingreso, key) {
                            total += parseInt((ingreso.disponible == '') ? 0 : ingreso.disponible);
                        });
                        break;
                    case 'excedente':
                        angular.forEach($rootScope.egresos, function(egreso, key) {
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
                        angular.forEach($rootScope.egresos, function(egreso, key) {
                            total += (egreso.ingreso == 1) ? parseInt(egreso.saldoIngreso) : parseInt(egreso.saldo);
                        });
                        break;
                    case 'aTransferir':
                        angular.forEach($rootScope.egresos, function(egreso, key) {
                            total += parseInt(egreso.aTransferir);
                        });
                        break;
                }
                return total;
            } //get total end
            //LQMA 10032016
        $rootScope.CrearNuevoLote = function() {
                $('#closeMenu').click();
                $rootScope.ProgPago = true;

                var lotesPendientes = $.grep($rootScope.noLotes.data, function(n, i) {
                    return n.estatus === 0;
                });
                if (lotesPendientes.length > 0)
                    alertFactory.warning('Existe lotes sin guardar.');
                else {
                    if ($rootScope.pdPlanta || $rootScope.pdBanco) {
                        $rootScope.selPagoDirecto = true;
                    }

                    $rootScope.NuevoLote = true;
                    $rootScope.accionPagina = false;
                    $('#btnCrealote').button('reset');
                    $('#btnCrealotePD').button('reset');
                    pagoRepository.getLotes($rootScope.idEmpresa, $rootScope.currentEmployee, 0, 0)
                        .then(function successCallback(data) {
                                $rootScope.noLotes = data;
                                var date = new Date();
                                $rootScope.formData.nombreLoteNuevo = ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + date.getFullYear() + '-' + $rootScope.rfc + '-' + ('0' + ($rootScope.noLotes.data.length + 1)).slice(-2); //data.length + 1;
                                $('#inicioModal').modal('show');
                            },
                            function errorCallback(response) {
                                alertFactory.error('Error al obtener los Lotes');
                                $rootScope.formData.nombreLoteNuevo = '0000';
                                $('#inicioModal').modal('show');
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
        $scope.GenerarArchivo = function() {
            $('#processing-modal').modal('show');
            pagoRepository.setArchivo($rootScope.idEmpresa, $scope.gridOptions.data, $rootScope.idLotePadre)
                .then(function successCallback(response) {
                    $scope.documentoIni = '<div><object id="ifDocument" data="' + response.data + '" type="application/txt" width="100%"><p>Descargar archivo de pagos <a href="../../files/' + response.data + '" target="_blank"><img border="0" alt="descargar" src="image/gifs/download.jpg" width="50" height="50"></a></p></object> </div>';
                    setTimeout(function() {
                        $('#processing-modal').modal('hide');
                    }, 1000);
                    setTimeout(function() {
                        $window.location.href = '../../files/' + response.data;
                    }, 2000);
                    //$("#divDocumento").append($scope.documentoIni);

                }, function errorCallback(response) {
                    alertFactory.error('Error al generar el archivo');
                    setTimeout(function() {
                        $('#processing-modal').modal('hide');
                    }, 1000);
                });
        };

        $rootScope.AbreConsultaLotes = function() {
            $('#closeMenu').click();
            $('#consultaModal').modal('show');

        };

        $rootScope.Abrecuentas = function() {
            $('#closeMenu').click();
            $window.location.href = '/cuentas';

        };

        $rootScope.AbreAgrupador = function() {
            $('#closeMenu').click();
            $window.location.href = '/agrupador';

        };

        $rootScope.AbreAdministrador = function() {
            $('#closeMenu').click();
             $window.location.href = '/loteAdmin';

        };

        //FAL funciones de calendar

        $scope.today = function() {
            $scope.dt = new Date();
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
            dateDisabled: disabled,
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

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
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
        $rootScope.EnviaAprobacion = function() {
            $('#btnEnviaApro').button('loading');
            pagoRepository.setSolAprobacion(1, 8, $rootScope.idEmpresa, $rootScope.idLotePadre)
                .then(function successCallback(response) {
                    alertFactory.success('Se envio la solicitud con exito');
                    $('#btnEnviaApro').button('reset');
                    $rootScope.idOperacion = 1;
                }, function errorCallback(response) {
                    alertFactory.error('Error al enviar solicitud de aprobación');
                    $('#btnEnviaApro').button('reset');
                });
        }; //LQMA End EnviaAprobacion
        //LQMA 09042016
        $rootScope.AprobarLote = function(valor) {
            $('#btnAprobar').button('loading');
            $scope.Guardar(2, valor);
        }; //LQMA End EnviaAprobacion

        $rootScope.AprobarLotePD = function(valor) {
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
