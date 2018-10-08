var request = require('request'),
    carteraRojoModel = require('../models/dataAccess'),
    carteraRojoView = require('../views/pagos');


var carteraRojo = function(conf) {
    this.conf = conf || {};
    this.view = new carteraRojoView();
    this.model = new carteraRojoModel({
        parameters: this.conf.parameters
    });
  
    this.response = function() {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    }
}

carteraRojo.prototype.get_datosEnRojo = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT }];

    this.model.query('SEL_PROGRAMACION_PAGOSENROJO_SP', params, function(error, result) {

        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

module.exports = carteraRojo;