const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const router = Router();

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Iniciar sesión en la aplicación
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, clave]
 *             properties:
 *               correo:
 *                 type: string
 *                 example: admin@estudio.com
 *               clave:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales incorrectas
 */
router.post("/login", (req, res) => authController.login(req, res));

module.exports = router;
