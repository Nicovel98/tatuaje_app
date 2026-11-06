const { Router } = require("express");
const facturaController = require("../controllers/factura.controller");
const router = Router();

router.get("/facturas", (req, res) => facturaController.listar(req, res));
router.get("/facturas/:id/detalle", (req, res) => facturaController.detalle(req, res));
router.post("/facturas", (req, res) => facturaController.crear(req, res));
router.post("/facturas/tatuaje/:id_tatuaje", (req, res) => facturaController.facturarTatuaje(req, res));
router.patch("/facturas/:id/pago", (req, res) => facturaController.registrarPago(req, res));
router.delete("/facturas/:id", (req, res) => facturaController.eliminar(req, res));

module.exports = router;
