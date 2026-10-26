import { useState, useEffect } from "react";
import axios from "axios";

export default function SesionForm({
  tatuajes,
  tarifas,
  usuarioActivo,
  onSesionCreada,
}) {
  const [tipoSesion, setTipoSesion] = useState(null);
  const [ultimaSesion, setUltimaSesion] = useState(false);
  const [formData, setFormData] = useState({
    id_sesion: "",
    fecha: "",
    duracion_horas: "",
    es_retoque: "N",
    valor: "0",
    TATUAJE_id_tatuaje: "",
    TARIFA_id_tarifa: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [infoRetoque, setInfoRetoque] = useState("");
  const [siguienteId, setSiguienteId] = useState(null);

  const cargarSiguienteId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sesiones/siguiente-id");
      setSiguienteId(res.data.siguiente);
    } catch (err) {
      console.error("Error cargando siguiente ID", err);
    }
  };

  useEffect(() => {
    cargarSiguienteId();
  }, []);

  const recalcularValor = (horas, tarifaId, esRetoque, esGratis = true) => {
    let nuevoValor = "0";
    if (horas && tarifaId && (esRetoque === "N" || !esGratis)) {
      const tarifaSeleccionada = tarifas.find(
        (t) => t.id_tarifa === parseInt(tarifaId),
      );
      if (tarifaSeleccionada) {
        nuevoValor = (
          parseFloat(horas) * parseFloat(tarifaSeleccionada.valor_hora)
        ).toString();
      }
    }
    return nuevoValor;
  };

  const verificarPlazoRetoque = async (tatuajeId, formularioActual) => {
    if (!tatuajeId) {
      setInfoRetoque("");
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:5000/api/tatuajes/validar-retoque/${tatuajeId}`,
      );
      setInfoRetoque(res.data.mensaje);

      if (res.data.califica_gratis) {
        setFormData((prev) => ({ ...prev, valor: "0" }));
      } else {
        setFormData((prev) => ({
          ...prev,
          valor: recalcularValor(
            formularioActual.duracion_horas,
            formularioActual.TARIFA_id_tarifa,
            "S",
            false,
          ),
        }));
      }
    } catch (err) {
      console.error("Error al validar retoque", err);
    }
  };

  const handleSeleccionTipo = (tipo) => {
    setTipoSesion(tipo);
    setUltimaSesion(false);
    setError("");
    setExito("");
    setInfoRetoque("");

    if (tipo === "retoque") {
      setFormData((prev) => ({ ...prev, es_retoque: "S" }));
    } else {
      setFormData((prev) => ({ ...prev, es_retoque: "N", valor: recalcularValor(prev.duracion_horas, prev.TARIFA_id_tarifa, "N") }));
    }
  };

  const handleCambioCampo = (campo, valorCampo) => {
    const nuevoFormData = { ...formData, [campo]: valorCampo };

    if (campo === "TATUAJE_id_tatuaje") {
      const tatSeleccionado = tatuajes.find((t) => t.id_tatuaje === parseInt(valorCampo));
      if (tatSeleccionado && tatSeleccionado.TARIFA_id_tarifa) {
        nuevoFormData.TARIFA_id_tarifa = String(tatSeleccionado.TARIFA_id_tarifa);
      }

      if (nuevoFormData.es_retoque === "S") {
        verificarPlazoRetoque(nuevoFormData.TATUAJE_id_tatuaje, nuevoFormData);
      } else if (nuevoFormData.duracion_horas && nuevoFormData.TARIFA_id_tarifa) {
        nuevoFormData.valor = recalcularValor(
          nuevoFormData.duracion_horas,
          nuevoFormData.TARIFA_id_tarifa,
          nuevoFormData.es_retoque,
        );
      }
    } else if (campo === "duracion_horas") {
      const deMomentoGratis = infoRetoque.includes("Retoque Gratuito");
      nuevoFormData.valor = recalcularValor(
        nuevoFormData.duracion_horas,
        nuevoFormData.TARIFA_id_tarifa,
        nuevoFormData.es_retoque,
        nuevoFormData.es_retoque === "S" ? deMomentoGratis : true,
      );
    }

    setFormData(nuevoFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.id_sesion ||
      !formData.fecha ||
      !formData.duracion_horas ||
      !formData.TATUAJE_id_tatuaje
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const tarifaId = formData.TARIFA_id_tarifa || (tarifas.length > 0 ? tarifas[0].id_tarifa : 1);
      await axios.post("http://localhost:5000/api/sesiones", {
        ...formData,
        TARIFA_id_tarifa: tarifaId,
        USUARIO_id_usuario: usuarioActivo?.id_usuario || 1,
        ultima_sesion: ultimaSesion,
      });

      setExito(
        ultimaSesion
          ? "Sesion registrada y tatuaje marcado como finalizado!"
          : "Sesion registrada exitosamente!"
      );
      setError("");
      setInfoRetoque("");
      cargarSiguienteId();
      setTipoSesion(null);
      setUltimaSesion(false);
      setFormData({
        id_sesion: "",
        fecha: "",
        duracion_horas: "",
        es_retoque: "N",
        valor: "0",
        TATUAJE_id_tatuaje: "",
        TARIFA_id_tarifa: "",
      });
      if (onSesionCreada) onSesionCreada();
    } catch (err) {
      setExito("");
      setError(err.response?.data?.error || "Error al registrar la sesion");
    }
  };

  const tatuajesFiltrados = tipoSesion === "retoque"
    ? tatuajes.filter((t) => t.estado === "FINALIZADO")
    : tatuajes.filter((t) => t.estado === "PENDIENTE" || t.estado === "PROGRAMADO");

  return (
    <div className="card-form">
      <h3>Registrar Sesion de Trabajo</h3>
      {error && <p className="error">{error}</p>}
      {exito && <p className="exito" style={{ color: "#2ecc71" }}>{exito}</p>}

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={() => handleSeleccionTipo("trabajo")}
          style={{
            flex: 1, padding: "14px", borderRadius: "8px",
            border: tipoSesion === "trabajo" ? "2px solid var(--color-info)" : "1px solid var(--border-color)",
            background: tipoSesion === "trabajo" ? "rgba(52, 152, 218, 0.15)" : "var(--bg-input)",
            color: tipoSesion === "trabajo" ? "var(--color-info)" : "var(--text-muted)",
            cursor: "pointer", fontWeight: "700", fontSize: "13px", textTransform: "uppercase",
          }}
        >
          Sesion de Trabajo
        </button>
        <button
          type="button"
          onClick={() => handleSeleccionTipo("retoque")}
          style={{
            flex: 1, padding: "14px", borderRadius: "8px",
            border: tipoSesion === "retoque" ? "2px solid var(--color-warning)" : "1px solid var(--border-color)",
            background: tipoSesion === "retoque" ? "rgba(243, 156, 18, 0.15)" : "var(--bg-input)",
            color: tipoSesion === "retoque" ? "var(--color-warning)" : "var(--text-muted)",
            cursor: "pointer", fontWeight: "700", fontSize: "13px", textTransform: "uppercase",
          }}
        >
          Retoque / Correccion
        </button>
      </div>

      {tipoSesion && (
        <form onSubmit={handleSubmit}>
          <div style={{ position: "relative" }}>
            <input type="number" placeholder="ID Sesion" value={formData.id_sesion}
              onChange={(e) => handleCambioCampo("id_sesion", e.target.value)} />
            {siguienteId && !formData.id_sesion && (
              <button
                type="button"
                onClick={() => handleCambioCampo("id_sesion", String(siguienteId))}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(244, 208, 63, 0.15)",
                  color: "var(--accent-color)",
                  border: "1px solid var(--accent-color)",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Siguiente: #{siguienteId}
              </button>
            )}
          </div>
          <input type="date" value={formData.fecha}
            onChange={(e) => handleCambioCampo("fecha", e.target.value)} />
          <input type="number" step="0.1" placeholder="Duracion en Horas" value={formData.duracion_horas}
            onChange={(e) => handleCambioCampo("duracion_horas", e.target.value)} />

          {infoRetoque && (
            <div style={{
              fontSize: "13px", padding: "10px", borderRadius: "6px",
              background: infoRetoque.includes("Retoque Gratuito") ? "rgba(46, 204, 113, 0.15)" : "rgba(231, 76, 60, 0.15)",
              color: infoRetoque.includes("Retoque Gratuito") ? "#2ecc71" : "#e74c3c",
              fontWeight: "600",
            }}>
              {infoRetoque}
            </div>
          )}


          <select value={formData.TATUAJE_id_tatuaje}
            onChange={(e) => handleCambioCampo("TATUAJE_id_tatuaje", e.target.value)}>
            <option value="">
              {tipoSesion === "retoque" ? "-- Tatuaje Finalizado para Retoque --" : "-- Tatuaje en Progreso --"}
            </option>
            {tatuajesFiltrados.map((t) => (
              <option key={t.id_tatuaje} value={t.id_tatuaje}>
                #{t.id_tatuaje} {t.diseno} — {t.nombre_cliente} ({t.estado})
              </option>
            ))}
          </select>

          {(() => {
            const tat = tatuajes.find((t) => t.id_tatuaje === parseInt(formData.TATUAJE_id_tatuaje));
            if (!tat || !tat.tipo_trabajo) return null;
            return (
              <div style={{
                padding: "10px 14px",
                background: "rgba(244, 208, 63, 0.08)",
                borderRadius: "8px",
                border: "1px solid rgba(244, 208, 63, 0.2)",
                fontSize: "13px",
              }}>
                <strong style={{ color: "var(--accent-color)" }}>Tarifa:</strong>{" "}
                {tat.tipo_trabajo} — ${parseFloat(tat.valor_hora).toLocaleString("es-CO")}/h
                {tat.tatuador_nombre && <span style={{ color: "var(--text-muted)" }}> ({tat.tatuador_nombre})</span>}
              </div>
            );
          })()}

          <div style={{ padding: "12px", background: "var(--bg-main)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <strong>Valor Final de la Sesion:</strong> ${parseFloat(formData.valor).toLocaleString("es-CO")}
          </div>

          {tipoSesion === "trabajo" && (
            <button
              type="button"
              onClick={() => setUltimaSesion(!ultimaSesion)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: ultimaSesion ? "2px solid var(--color-success)" : "1px solid var(--border-color)",
                background: ultimaSesion ? "rgba(46, 204, 113, 0.15)" : "var(--bg-input)",
                color: ultimaSesion ? "var(--color-success)" : "var(--text-muted)",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                transition: "all 0.2s ease",
              }}
            >
              {ultimaSesion ? "✓ MARCADA COMO ULTIMA SESION" : "Marcar como Ultima Sesion"}
            </button>
          )}

          <button type="submit">
            {tipoSesion === "retoque" ? "Registrar Retoque" : "Registrar Sesion"}
          </button>
        </form>
      )}

      {!tipoSesion && (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
          Selecciona el tipo de sesion para continuar.
        </p>
      )}
    </div>
  );
}
