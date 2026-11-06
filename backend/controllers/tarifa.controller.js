const tarifaService = require("../services/tarifa.service");

class TarifaController {
  async crear(req, res) {
    try {
      const { id_tarifa, tipo_trabajo, valor_hora, tatuador_nombre, usuario_creacion } = req.body;
      const tarifa = await tarifaService.crearTarifa({
        id_tarifa,
        tipo_trabajo,
        valor_hora,
        tatuador_nombre,
        usuario_creacion: usuario_creacion || "ADMIN",
      });
      return res.status(201).json({
        mensaje: "Tarifa registrada con éxito",
        tarifa,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listar(req, res) {
    try {
      const tarifas = await tarifaService.listar();
      return res.json(tarifas);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async siguienteId(req, res) {
    try {
      const siguiente = await tarifaService.obtenerSiguienteId();
      return res.json({ siguiente });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { tipo_trabajo, valor_hora, tatuador_nombre, usuario_modificador } = req.body;
      const tarifa = await tarifaService.actualizarTarifa(
        id,
        { tipo_trabajo, valor_hora, tatuador_nombre },
        usuario_modificador
      );
      return res.json({
        mensaje: "Tarifa actualizada con éxito",
        tarifa,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const { usuario_modificador } = req.body;
      await tarifaService.eliminarTarifa(id, usuario_modificador);
      return res.json({ mensaje: "Tarifa eliminada con éxito (soft delete)" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new TarifaController();
