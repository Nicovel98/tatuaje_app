const { Router } = require("express");
const reporteController = require("../controllers/reporte.controller");
const router = Router();

/**
 * @swagger
 * /api/reportes/comisiones-tatuador:
 *   get:
 *     summary: Reporte de comisiones por tatuador filtrado por fechas
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Datos de comisiones
 */
router.get("/reportes/comisiones-tatuador", (req, res) => reporteController.comisiones(req, res));
router.get("/reportes/comisiones", (req, res) => reporteController.comisiones(req, res));

/**
 * @swagger
 * /api/reportes/historial-facturas:
 *   get:
 *     summary: Historial completo de facturas emitidas en el estudio
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Historial de facturas
 */
router.get("/reportes/historial-facturas", (req, res) => reporteController.historialFacturas(req, res));

module.exports = router;
