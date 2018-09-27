var request = require('request'),
    aprobModel = require('../models/dataAccess'),
    noView = require('../views/pagos');


var main = function(conf) {
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

main.prototype.get_usuario = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idEmpleado', value: req.query.idUsuario, type: self.model.types.INT }
    ];

    this.model.query('SEL_EMPLEADO_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}


module.exports = main;