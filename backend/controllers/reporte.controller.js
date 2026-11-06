const reporteService = require("../services/reporte.service");

class ReporteController {
  async comisiones(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const datos = await reporteService.obtenerComisiones(fecha_inicio, fecha_fin);
      return res.json(datos);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async historialFacturas(req, res) {
    try {
      const datos = await reporteService.obtenerHistorialFacturas();
      return res.json(datos);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ReporteController();
