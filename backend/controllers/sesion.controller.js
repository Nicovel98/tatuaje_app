const sesionService = require("../services/sesion.service");
const SesionResponseDto = require("../dtos/sesion/sesion-response.dto");

class SesionController {
  async crear(req, res) {
    try {
      const {
        id_sesion,
        tatuaje_id,
        cliente_id,
        usuario_id,
        fecha,
        duracion_horas,
        es_retoque,
        valor,
        ultima_sesion,
        usuario_creacion,
      } = req.body;

      const sesion = await sesionService.crearSesion({
        id_sesion,
        tatuaje_id,
        cliente_id,
        usuario_id,
        fecha,
        duracion_horas,
        es_retoque,
        valor,
        ultima_sesion,
        usuario_creacion,
      });

      return res.status(201).json({
        mensaje: "Sesión registrada con éxito",
        sesion: SesionResponseDto.fromModel(sesion),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listar(req, res) {
    try {
      const sesiones = await sesionService.listarConDetalles();
      return res.json(SesionResponseDto.fromModelList(sesiones));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async listarPendientesFactura(req, res) {
    try {
      const sesiones = await sesionService.listarPendientesDeFactura();
      return res.json(SesionResponseDto.fromModelList(sesiones));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { usuario_modificador, ...datos } = req.body;
      const sesion = await sesionService.actualizarSesion(id, datos, usuario_modificador);

      return res.json({
        mensaje: "Sesión actualizada con éxito",
        sesion: SesionResponseDto.fromModel(sesion),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const { usuario_modificador } = req.body;
      await sesionService.eliminarSesion(id, usuario_modificador);
      return res.json({ mensaje: "Sesión eliminada con éxito (soft delete)" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new SesionController();
