const { Router } = require("express");
const tatuajeController = require("../controllers/tatuaje.controller");
const router = Router();

/**
 * @swagger
 * /api/tatuajes:
 *   get:
 *     summary: Listar todos los tatuajes y diseños
 *     tags: [Tatuajes]
 *     responses:
 *       200:
 *         description: Lista de tatuajes
 *   post:
 *     summary: Registrar un nuevo diseño de tatuaje
 *     tags: [Tatuajes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [diseno, zona_cuerpo, valor_estimado]
 *             properties:
 *               id_tatuaje:
 *                 type: integer
 *                 example: 201
 *               diseno:
 *                 type: string
 *                 example: Dragon Oriental
 *               zona_cuerpo:
 *                 type: string
 *                 example: Brazo derecho
 *               estado:
 *                 type: string
 *                 enum: [PENDIENTE, EN_PROGRESO, FINALIZADO, CANCELADO]
 *                 example: PENDIENTE
 *               horas_estimadas:
 *                 type: number
 *                 example: 3.5
 *               valor_estimado:
 *                 type: number
 *                 example: 450000
 *     responses:
 *       201:
 *         description: Tatuaje registrado
 */
router.get("/tatuajes", (req, res) => tatuajeController.listar(req, res));
router.post("/tatuajes", (req, res) => tatuajeController.crear(req, res));
router.put("/tatuajes/:id", (req, res) => tatuajeController.actualizar(req, res));
router.put("/tatuajes/:id/estado", (req, res) => tatuajeController.actualizarEstado(req, res));
router.delete("/tatuajes/:id", (req, res) => tatuajeController.eliminar(req, res));

module.exports = router;
