var request = require('request'),
    empresasModel = require('../models/dataAccess'),
    empresasView = require('../views/pagos');


var empresas = function(conf) {
    this.conf = conf || {};
    this.view = new empresasView();
    this.model = new empresasModel({
        parameters: this.conf.parameters
    });
    /*if (conf) {
        this.url = this.conf.parameters.server + "cargaapi/"
    }*/
    this.response = function() {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    }
}

empresas.prototype.get_empresas = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT }];

    this.model.query('SEL_EMPRESAS_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}


module.exports = empresas;