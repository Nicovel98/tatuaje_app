const { Router } = require("express");
const usuarioController = require("../controllers/usuario.controller");
const router = Router();

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar todos los colaboradores y usuarios activos
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *   post:
 *     summary: Crear un nuevo usuario o tatuador (HU-11)
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_usuario, nombre, correo, clave, rol]
 *             properties:
 *               id_usuario:
 *                 type: integer
 *                 example: 3
 *               nombre:
 *                 type: string
 *                 example: Laura Artista
 *               correo:
 *                 type: string
 *                 example: laura@estudio.com
 *               clave:
 *                 type: string
 *                 example: laura2026
 *               rol:
 *                 type: string
 *                 enum: [ADMINISTRADOR, TATUADOR]
 *                 example: TATUADOR
 *               usuario_creacion:
 *                 type: string
 *                 example: Admin Estudio
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error de validación
 */
router.get("/usuarios", (req, res) => usuarioController.listar(req, res));
router.post("/usuarios", (req, res) => usuarioController.crear(req, res));
router.put("/usuarios/:id", (req, res) => usuarioController.actualizar(req, res));

/**
 * @swagger
 * /api/usuarios/{id}/inactivar:
 *   put:
 *     summary: Inactivar usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario inactivado
 */
router.put("/usuarios/:id/inactivar", (req, res) => usuarioController.inactivar(req, res));

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario (soft delete)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 */
router.delete("/usuarios/:id", (req, res) => usuarioController.eliminar(req, res));

module.exports = router;
