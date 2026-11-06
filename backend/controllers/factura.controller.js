const facturaService = require("../services/factura.service");
const FacturaResponseDto = require("../dtos/factura/factura-response.dto");

class FacturaController {
  async crear(req, res) {
    try {
      const {
        id_factura,
        sesion_id,
        fecha_emision,
        horas_facturadas,
        valor_unitario,
        subtotal,
        total,
        tipo_pago,
        monto_pagado,
        usuario_creacion,
      } = req.body;

      const factura = await facturaService.crearFactura({
        id_factura,
        sesion_id,
        fecha_emision,
        horas_facturadas,
        valor_unitario,
        subtotal,
        total,
        tipo_pago,
        monto_pagado,
        usuario_creacion,
      });

      return res.status(201).json({
        mensaje: "Factura emitida con éxito",
        factura: FacturaResponseDto.fromModel(factura),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async registrarPago(req, res) {
    try {
      const { id } = req.params;
      const { tipo_pago, monto_pagado, usuario_modificador } = req.body;

      const factura = await facturaService.registrarPago(id, { tipo_pago, monto_pagado }, usuario_modificador);

      return res.json({
        mensaje: "Pago registrado exitosamente",
        factura: FacturaResponseDto.fromModel(factura),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listar(req, res) {
    try {
      const facturas = await facturaService.listarConDetalles();
      return res.json(FacturaResponseDto.fromModelList(facturas));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async obtenerDetalle(req, res) {
    try {
      const { id } = req.params;
      const detalle = await facturaService.obtenerDetalle(id);
      return res.json(detalle);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const { usuario_modificador } = req.body;
      await facturaService.eliminarFactura(id, usuario_modificador);
      return res.json({ mensaje: "Factura eliminada con éxito (soft delete)" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new FacturaController();
