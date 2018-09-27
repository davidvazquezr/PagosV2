var request = require('request'),
    aprobModel = require('../models/dataAccess'),
    noView = require('../views/pagos');


var pago = function(conf) {
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


pago.prototype.post_pagosPadre = function(req, res, next) {

    var self = this;
    if (req.body.idLote == 0) {
        var params = [{ name: 'idEmpresa', value: req.body.idEmpresa, type: self.model.types.INT },
            { name: 'idUsuario', value: req.body.idEmpleado, type: self.model.types.INT },
            { name: 'nombreLote', value: req.body.nombreLote, type: self.model.types.STRING },
            { name: 'estatus', value: 1, type: self.model.types.INT },
            { name: 'esApliacionDirecta', value: req.body.esAplicacionDirecta, type: self.model.types.INT },
            { name: 'cifraControl', value: req.body.cifraControl, type: self.model.types.DECIMAL },
            { name: 'tipoLotePago', value: req.body.tipoLote, type: self.model.types.INT }

        ];
        this.model.query('INS_ENCABEZADO_LOTE_PAGOS_SP', params, function(error, result) {
            self.view.expositor(res, {
                error: error,
                result: result
            });
        });

    } else {
        var respuesta = [{ 'idPadre': req.body.idLote }]
        self.view.expositor(res, {
            result: respuesta
        });
    }

}
pago.prototype.get_proveedor = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idPersona', value: req.query.idProveedor, type: self.model.types.INT }];

    //console.log('SEL_CUENTA_PROVEEDOR_SP', params);

    this.model.query('SEL_DATOS_PROVEEDOR_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

pago.prototype.post_revision = function(req, res, next) {

    var self = this;
    var params = [{ name: 'proc_id', value: req.body.idProc, type: self.model.types.INT },
        { name: 'nodo', value: req.body.nodo, type: self.model.types.INT },
        { name: 'emp_idempresa', value: req.body.idEmpresa, type: self.model.types.INT },
        { name: 'idLote', value: req.body.idLote, type: self.model.types.DECIMAL }
    ];
    this.model.query('INS_REVISION_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

pago.prototype.get_lotes = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idUsuario', value: req.query.idEmpleado, type: self.model.types.INT },
        { name: 'borraLotes', value: req.query.borraLote, type: self.model.types.INT },
        { name: 'idLote', value: req.query.idLote, type: self.model.types.INT }
    ];

    //console.log('SEL_CUENTA_PROVEEDOR_SP', params);

    this.model.query('SEL_ENCABEZADO_LOTE_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

pago.prototype.get_lotesxFechas = function(req, res, next) {

    var self = this;

    var params = [{ name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT },
        { name: 'fecha_ini', value: req.query.fechaini, type: self.model.types.STRING },
        { name: 'fecha_fin', value: req.query.fechafin, type: self.model.types.STRING },
        { name: 'estatus', value: req.query.estatus, type: self.model.types.INT }
    ];

    //console.log('SEL_CUENTA_PROVEEDOR_SP', params);

    this.model.query('SEL_LOTES_POR_FECHA_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

pago.prototype.get_permisosCreacionLote = function(req, res, next) {

    var self = this;

    this.model.query('SEL_HR_CREACION_LOTE_SP ', true, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
}

module.exports = pago;