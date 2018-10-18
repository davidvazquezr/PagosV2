var request = require('request'),
    carteraVencerModel = require('../models/dataAccess'),
    carteraVencerView = require('../views/pagos');


var carteraVencer = function(conf) {
    this.conf = conf || {};
    this.view = new carteraVencerView();
    this.model = new carteraVencerModel({
        parameters: this.conf.parameters
    });
  
    this.response = function() {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    }
}

carteraVencer.prototype.get_datosxvencer = function(req, res, next) {

    var self = this;

    var dia = new Date();
    dia = dia.getDay();

    var params = [{ name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
                  { name: 'diaDeLaSemana', value: dia, type: self.model.types.INT }];

    this.model.query('SEL_PROGRAMACION_PAGOSXVENCER_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}


module.exports = carteraVencer;