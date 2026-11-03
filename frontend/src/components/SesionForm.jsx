import { useState } from "react";
import axios from "axios";

export default function SesionForm({
  tatuajes,
  clientes,
  usuarios,
  usuarioActivo,
  onSesionCreada,
}) {
  const [formData, setFormData] = useState({
    tatuaje_id: "",
    cliente_id: "",
    usuario_id: usuarioActivo?.id_usuario || "",
    fecha: new Date().toISOString().split("T")[0],
    duracion_horas: "2.0",
    es_retoque: "N",
    valor: "",
    ultima_sesion: false,
  });

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!formData.tatuaje_id || !formData.cliente_id || !formData.usuario_id || !formData.valor) {
      setError("Todos los campos de la sesión son obligatorios.");
      return;
    }

    try {
      const payload = {
        tatuaje_id: parseInt(formData.tatuaje_id),
        cliente_id: parseInt(formData.cliente_id),
        usuario_id: parseInt(formData.usuario_id),
        fecha: formData.fecha,
        duracion_horas: parseFloat(formData.duracion_horas),
        es_retoque: formData.es_retoque,
        valor: parseFloat(formData.valor),
        ultima_sesion: formData.ultima_sesion,
        usuario_creacion: usuarioActivo?.nombre || "SISTEMA",
      };

      await axios.post("http://localhost:5000/api/sesiones", payload);
      setExito("¡Sesión registrada exitosamente!");
      setFormData({
        tatuaje_id: "",
        cliente_id: "",
        usuario_id: usuarioActivo?.id_usuario || "",
        fecha: new Date().toISOString().split("T")[0],
        duracion_horas: "2.0",
        es_retoque: "N",
        valor: "",
        ultima_sesion: false,
      });
      if (onSesionCreada) onSesionCreada();
    } catch (err) {
      setError(err.response?.data?.error || "Error al agendar la sesión.");
    }
  };

  return (
    <div className="card-form" style={{ marginTop: "20px" }}>
      <h3>Agendar Nueva Sesión de Tatuaje</h3>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
        Vinculación 1:1 con cliente, diseño asignado y tatuador responsable.
      </p>

      {error && <p className="error">{error}</p>}
      {exito && <p className="exito" style={{ color: "#2ecc71" }}>{exito}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Fecha de Cita</label>
          <input
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            required
          />
        </div>

        <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Cliente (Relación 1:1 con Sesión)</label>
        <select
          value={formData.cliente_id}
          onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
          required
        >
          <option value="">-- Selecciona el cliente --</option>
          {(clientes || []).map((c) => (
            <option key={c.id_cliente} value={c.id_cliente}>
              {c.nombre} (ID: #{c.id_cliente})
            </option>
          ))}
        </select>

        <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Diseño de Tatuaje</label>
        <select
          value={formData.tatuaje_id}
          onChange={(e) => {
            const tId = e.target.value;
            const tSel = (tatuajes || []).find((t) => t.id_tatuaje === parseInt(tId));
            setFormData({
              ...formData,
              tatuaje_id: tId,
              valor: tSel ? String(tSel.valor_estimado) : formData.valor,
            });
          }}
          required
        >
          <option value="">-- Selecciona el diseño --</option>
          {(tatuajes || []).map((t) => (
            <option key={t.id_tatuaje} value={t.id_tatuaje}>
              {t.diseno} ({t.zona_cuerpo}) - ${Number(t.valor_estimado).toLocaleString("es-CO")}
            </option>
          ))}
        </select>

        <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Tatuador Responsable</label>
        <select
          value={formData.usuario_id}
          onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
          required
        >
          <option value="">-- Selecciona el tatuador --</option>
          {(usuarios || []).map((u) => (
            <option key={u.id_usuario} value={u.id_usuario}>
              {u.nombre} ({u.rol})
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Duración (Horas)</label>
            <input
              type="number"
              step="0.5"
              placeholder="Horas"
              value={formData.duracion_horas}
              onChange={(e) => setFormData({ ...formData, duracion_horas: e.target.value })}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Valor Sesión ($)</label>
            <input
              type="number"
              placeholder="Monto a liquidar"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              required
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>¿Es retoque?</label>
            <select
              value={formData.es_retoque}
              onChange={(e) => setFormData({ ...formData, es_retoque: e.target.value })}
            >
              <option value="N">No (Sesión Normal)</option>
              <option value="S">Sí (Retoque / Ajuste)</option>
            </select>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", paddingTop: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px" }}>
              <input
                type="checkbox"
                checked={formData.ultima_sesion}
                onChange={(e) => setFormData({ ...formData, ultima_sesion: e.target.checked })}
              />
              ¿Es última sesión (Finaliza)?
            </label>
          </div>
        </div>

        <button type="submit" style={{ marginTop: "14px" }}>Registrar Sesión</button>
      </form>
    </div>
  );
}
