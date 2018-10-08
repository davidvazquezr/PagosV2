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

    var params = [{ name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT }];

    this.model.query('SEL_PROGRAMACION_PAGOSXVENCER_SP', params, function(error, result) {

        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

carteraVencer.prototype.get_datosAprob = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idPadre', value: req.query.idLote, type: self.model.types.INT }];

    this.model.query('SEL_PROG_PAGOS_GUARDADA_SP', params, function(error, result) {

        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

carteraVencer.prototype.get_otrosIngresos = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idLotePago', value: req.query.idLote, type: self.model.types.INT }];

    this.model.query('SEL_CUENTAS_TRANSFERENCIAS_SP', params, function(error, result) {

        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

carteraVencer.prototype.get_transferencias = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idLotePago', value: req.query.idLote, type: self.model.types.INT }];

    this.model.query('SEL_INGRESO_OTROS_SP', params, function(error, result) {

        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

carteraVencer.prototype.get_ingresos = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
                  { name: 'numLote', value: req.query.idLote, type: self.model.types.INT }];

    this.model.query('SEL_CUENTAS_INGRESOS_SP', params, function(error, result) {

        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

module.exports = carteraVencer;