const { Router } = require("express");
const clienteController = require("../controllers/cliente.controller");
const router = Router();

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtener la lista de todos los clientes activos
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 *   post:
 *     summary: Registrar un nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_cliente, nombre, telefono, correo]
 *             properties:
 *               id_cliente:
 *                 type: integer
 *                 example: 101
 *               nombre:
 *                 type: string
 *                 example: Juan Perez
 *               telefono:
 *                 type: string
 *                 example: 3001234567
 *               correo:
 *                 type: string
 *                 example: juan@gmail.com
 *     responses:
 *       201:
 *         description: Cliente creado
 */
router.get("/clientes", (req, res) => clienteController.listar(req, res));
router.post("/clientes", (req, res) => clienteController.crear(req, res));
router.put("/clientes/:id", (req, res) => clienteController.actualizar(req, res));
router.delete("/clientes/:id", (req, res) => clienteController.eliminar(req, res));

module.exports = router;
