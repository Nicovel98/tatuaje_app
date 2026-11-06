const { Router } = require("express");
const clienteController = require("../controllers/cliente.controller");
const router = Router();

router.get("/clientes", (req, res) => clienteController.listar(req, res));
router.get("/clientes/:id/estado-cuenta", (req, res) => clienteController.estadoCuenta(req, res));
router.post("/clientes", (req, res) => clienteController.crear(req, res));
router.put("/clientes/:id", (req, res) => clienteController.actualizar(req, res));
router.delete("/clientes/:id", (req, res) => clienteController.eliminar(req, res));

module.exports = router;
