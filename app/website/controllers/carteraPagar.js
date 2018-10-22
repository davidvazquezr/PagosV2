var request = require('request'),
    carteraPagarModel = require('../models/dataAccess'),
    carteraPagarView = require('../views/pagos');


var carteraPagar = function(conf) {
    this.conf = conf || {};
    this.view = new carteraPagarView();
    this.model = new carteraPagarModel({
        parameters: this.conf.parameters
    });
  
    this.response = function() {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    }
}

carteraPagar.prototype.get_datosCarteraPagar = function(req, res, next) {

    var self = this;

    var dia = new Date();
    dia = dia.getDay();

    var params = [{ name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
                  { name: 'diaDeLaSemana', value: dia, type: self.model.types.INT }];
    this.model.query('SEL_PROGRAMACION_PAGOS_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}


module.exports = carteraPagar;