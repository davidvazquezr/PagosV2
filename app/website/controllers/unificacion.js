var request = require('request'),
    aprobModel = require('../models/dataAccess'),
    noView = require('../views/pagos');


var unificacion = function(conf) {
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

unificacion.prototype.get_proveedor = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idProveedor', value: req.query.id, type: self.model.types.STRING },
        { name: 'nombreProveedor', value: req.query.nombre, type: self.model.types.STRING },
        { name: 'rfc', value: req.query.rfc, type: self.model.types.STRING }
    ];

    //console.log('SEL_BUSCA_PROVEEDOR_SP', params);

    this.model.query('SEL_BUSCA_PROVEEDOR_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

unificacion.prototype.get_cuentas = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idProveedor', value: req.query.idProveedor, type: self.model.types.INT }];

    //console.log('SEL_CUENTA_PROVEEDOR_SP', params);

    this.model.query('SEL_CUENTA_PROVEEDOR_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

unificacion.prototype.get_comparaCuenta = function(req, res, next) {

    var self = this;

    var params = [{ name: 'ctaBancaria', value: req.query.cuenta, type: self.model.types.STRING },
        { name: 'convenio', value: req.query.convenio, type: self.model.types.STRING },
        { name: 'idProveedor', value: req.query.idProveedor, type: self.model.types.INT },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT }
    ];

    //console.log('SEL_VALIDA_CUENTA_PROV_SP', params);

    this.model.query('SEL_VALIDA_CUENTA_PROV_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

unificacion.prototype.get_unificacion = function(req, res, next) {

    var self = this;

    var params = [{ name: 'cuenta', value: req.query.cuenta, type: self.model.types.STRING },
        { name: 'convenio', value: req.query.convenio, type: self.model.types.STRING },
        { name: 'idProveedor', value: req.query.idProveedor, type: self.model.types.INT },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT }
    ];

    //console.log('INS_BITACORA_CUENTAS_SP', params);

    this.model.query('INS_BITACORA_CUENTAS_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

module.exports = unificacion;