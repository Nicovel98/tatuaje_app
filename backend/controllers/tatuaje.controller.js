const tatuajeService = require("../services/tatuaje.service");
const TatuajeResponseDto = require("../dtos/tatuaje/tatuaje-response.dto");

class TatuajeController {
  async crear(req, res) {
    try {
      const { id_tatuaje, diseno, zona_cuerpo, estado, horas_estimadas, valor_estimado, anticipo, usuario_creacion } = req.body;
      const tatuaje = await tatuajeService.crearTatuaje({
        id_tatuaje,
        diseno,
        zona_cuerpo,
        estado,
        horas_estimadas,
        valor_estimado,
        anticipo,
        usuario_creacion,
      });

      return res.status(201).json({
        mensaje: "Tatuaje registrado con éxito",
        tatuaje: TatuajeResponseDto.fromModel(tatuaje),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listar(req, res) {
    try {
      const tatuajes = await tatuajeService.listar();
      return res.json(TatuajeResponseDto.fromModelList(tatuajes));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { usuario_modificador, ...datos } = req.body;
      const tatuaje = await tatuajeService.actualizarTatuaje(id, datos, usuario_modificador);

      return res.json({
        mensaje: "Tatuaje actualizado con éxito",
        tatuaje: TatuajeResponseDto.fromModel(tatuaje),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado, usuario_modificador } = req.body;
      const tatuaje = await tatuajeService.actualizarEstado(id, estado, usuario_modificador);

      return res.json({
        mensaje: "Estado del tatuaje actualizado con éxito",
        tatuaje: TatuajeResponseDto.fromModel(tatuaje),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const { usuario_modificador } = req.body;
      await tatuajeService.eliminarTatuaje(id, usuario_modificador);
      return res.json({ mensaje: "Tatuaje eliminado con éxito (soft delete)" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new TatuajeController();
