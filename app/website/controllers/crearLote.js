var request = require('request'),
    aprobModel = require('../models/dataAccess'),
    noView = require('../views/pagos');


var crearLote = function(conf) {
    this.conf = conf || {};
    this.view = new noView();
    this.model = new aprobModel({
        parameters: this.conf.parameters
    });
    /*if (conf) {
        this.url = this.conf.parameters.server + "cargaapi/"
    }*/
    this.response = function() {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    }
}

crearLote.prototype.get_egresos = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT }];

    this.model.query('SEL_EGRESOS_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}
crearLote.prototype.get_bancosCompleta = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT }];

    this.model.query('SEL_TOTAL_BANCOS_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}
crearLote.prototype.get_encabezadoLote = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT },
        { name: 'idLote', value: req.query.idLote, type: self.model.types.INT }
    ];

    this.model.query('SEL_ENCABEZADO_LOTE_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

crearLote.prototype.get_datosxvencer = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT }];

    this.model.query('SEL_PROGRAMACION_PAGOSXVENCER_SP', params, function(error, result) {

        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}


module.exports = crearLote;