var request = require('request'),
    consultaLoteModel = require('../models/dataAccess'),
    consultaLoteView = require('../views/pagos');


var consultaLote = function(conf) {
    this.conf = conf || {};
    this.view = new consultaLoteView();
    this.model = new consultaLoteModel({
        parameters: this.conf.parameters
    });
 
    this.response = function() {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    }
}

consultaLote.prototype.get_liberarDocs = function(req, res, next) {

     var self = this;

    var params = [{ name: 'idLote', value: req.query.idLote, type: self.model.types.INT}];

    this.model.query('SEL_LIBERAR_CXP_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}


module.exports = consultaLote;