const { Router } = require("express");
const tarifaController = require("../controllers/tarifa.controller");

const router = Router();

router.get("/tarifas", (req, res) => tarifaController.listar(req, res));
router.get("/tarifas/siguiente-id", (req, res) => tarifaController.siguienteId(req, res));
router.post("/tarifas", (req, res) => tarifaController.crear(req, res));
router.put("/tarifas/:id", (req, res) => tarifaController.actualizar(req, res));
router.delete("/tarifas/:id", (req, res) => tarifaController.eliminar(req, res));

module.exports = router;
