var request = require('request'),
    monitorModel = require('../models/dataAccess'),
    monitorView = require('../views/pagos');


var monitor = function(conf) {
    this.conf = conf || {};
    this.view = new monitorView();
    this.model = new monitorModel({
        parameters: this.conf.parameters
    });
 
    this.response = function() {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    }
}

monitor.prototype.get_lotesxFechas = function(req, res, next) {

     var self = this;

    var params = [{ name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT },
        { name: 'fecha_ini', value: req.query.fechaini, type: self.model.types.STRING },
        { name: 'fecha_fin', value: req.query.fechafin, type: self.model.types.STRING },
        { name: 'estatus', value: req.query.estatus, type: self.model.types.INT }
    ];

    console.log('SEL_LOTES_POR_FECHA_SP', params);

    this.model.query('SEL_LOTES_POR_FECHA_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}


module.exports = monitor;