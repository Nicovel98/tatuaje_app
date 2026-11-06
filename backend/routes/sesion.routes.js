const { Router } = require("express");
const sesionController = require("../controllers/sesion.controller");
const router = Router();

/**
 * @swagger
 * /api/sesiones:
 *   get:
 *     summary: Listar todas las sesiones con sus detalles de tatuaje, cliente y tatuador
 *     tags: [Sesiones]
 *     responses:
 *       200:
 *         description: Lista de sesiones
 *   post:
 *     summary: Registrar una nueva sesión de tatuaje
 *     tags: [Sesiones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tatuaje_id, cliente_id, usuario_id, fecha, duracion_horas, valor]
 *             properties:
 *               id_sesion:
 *                 type: integer
 *                 example: 301
 *               tatuaje_id:
 *                 type: integer
 *                 example: 201
 *               cliente_id:
 *                 type: integer
 *                 example: 101
 *               usuario_id:
 *                 type: integer
 *                 example: 2
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2026-11-03"
 *               duracion_horas:
 *                 type: number
 *                 example: 3.0
 *               es_retoque:
 *                 type: string
 *                 enum: [S, N]
 *                 example: N
 *               valor:
 *                 type: number
 *                 example: 250000
 *               anticipo:
 *                 type: number
 *                 example: 50000
 *               ultima_sesion:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Sesión registrada
 */
router.get("/sesiones", (req, res) => sesionController.listar(req, res));
router.get("/sesiones/pendientes-factura", (req, res) => sesionController.listarPendientesFactura(req, res));
router.post("/sesiones", (req, res) => sesionController.crear(req, res));
router.put("/sesiones/:id", (req, res) => sesionController.actualizar(req, res));
router.delete("/sesiones/:id", (req, res) => sesionController.eliminar(req, res));

module.exports = router;
