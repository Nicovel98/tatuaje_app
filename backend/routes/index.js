const { Router } = require("express");
const authRoutes = require("./auth.routes");
const usuarioRoutes = require("./usuario.routes");
const clienteRoutes = require("./cliente.routes");
const tatuajeRoutes = require("./tatuaje.routes");
const sesionRoutes = require("./sesion.routes");
const facturaRoutes = require("./factura.routes");
const reporteRoutes = require("./reporte.routes");

const router = Router();

router.use(authRoutes);
router.use(usuarioRoutes);
router.use(clienteRoutes);
router.use(tatuajeRoutes);
router.use(sesionRoutes);
router.use(facturaRoutes);
router.use(reporteRoutes);

module.exports = router;
