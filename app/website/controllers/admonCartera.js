var request = require('request'),
    aprobModel = require('../models/dataAccess'),
    noView = require('../views/pagos');


var cartera = function(conf) {
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

cartera.prototype.get_cartera = function(req, res, next) {

    var self = this;

    var params = [{ name: 'IdProveedor', value: req.query.idProveedor, type: self.model.types.STRING },
        { name: 'IdEmpresa', value: req.query.idEmpresa, type: self.model.types.STRING },
        { name: 'Vencida', value: req.query.vencida, type: self.model.types.INT }
    ];


    this.model.query('SEL_CARTERA_EMPPROV_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

cartera.prototype.post_pushCartera = function(req, res, next) {

    var self = this;

    var params = [{ name: 'IdCartera', value: req.body.idCartera, type: self.model.types.STRING },
        { name: 'IdEmpresa', value: req.body.idEmpresa, type: self.model.types.STRING },
        { name: 'FechaPromPago', value: req.body.fechaPromesa, type: self.model.types.STRING },
        { name: 'AnioCartera', value: req.body.anioCartera, type: self.model.types.STRING }

    ];


    this.model.query('UPD_CARTERA_FECHAPROMPAGO_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}



module.exports = cartera;