const { Router } = require("express");
const facturaController = require("../controllers/factura.controller");
const router = Router();

/**
 * @swagger
 * /api/facturas:
 *   get:
 *     summary: Listar todas las facturas con sus detalles de sesión
 *     tags: [Facturación]
 *     responses:
 *       200:
 *         description: Lista de facturas
 *   post:
 *     summary: Emitir una nueva factura vinculada a una sesión (1:N)
 *     tags: [Facturación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_factura, sesion_id, fecha_emision, horas_facturadas, valor_unitario, total]
 *             properties:
 *               id_factura:
 *                 type: integer
 *                 example: 401
 *               sesion_id:
 *                 type: integer
 *                 example: 301
 *               fecha_emision:
 *                 type: string
 *                 format: date
 *                 example: "2026-11-03"
 *               horas_facturadas:
 *                 type: number
 *                 example: 3.0
 *               valor_unitario:
 *                 type: number
 *                 example: 80000
 *               subtotal:
 *                 type: number
 *                 example: 240000
 *               total:
 *                 type: number
 *                 example: 240000
 *               tipo_pago:
 *                 type: string
 *                 enum: [EFECTIVO, TRANSFERENCIA, TARJETA]
 *                 example: EFECTIVO
 *               monto_pagado:
 *                 type: number
 *                 example: 240000
 *     responses:
 *       201:
 *         description: Factura emitida
 */
router.get("/facturas", (req, res) => facturaController.listar(req, res));
router.post("/facturas", (req, res) => facturaController.crear(req, res));
router.put("/facturas/:id/pago", (req, res) => facturaController.registrarPago(req, res));
router.delete("/facturas/:id", (req, res) => facturaController.eliminar(req, res));

module.exports = router;
