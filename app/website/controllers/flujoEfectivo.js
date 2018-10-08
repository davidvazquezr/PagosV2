var request = require('request'),
    aprobModel = require('../models/dataAccess'),
    noView = require('../views/pagos');


var flujoEfectivo = function(conf) {
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

flujoEfectivo.prototype.get_bancoPagadorLote = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idLote', value: req.query.idLote, type: self.model.types.INT }];

    this.model.query('SEL_BANCO_PAGADOR_LOTE_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

flujoEfectivo.prototype.get_ingresos = function(req, res, next) {

    var self = this;

    var params = [{ name: 'numLote', value: req.query.idLote, type: self.model.types.INT },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT }
    ];

    this.model.query('SEL_INGRESOS_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

module.exports = flujoEfectivo;