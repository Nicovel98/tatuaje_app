import { useState } from "react";
import axios from "axios";

export default function SesionForm({
  tatuajes,
  tarifas,
  usuarioActivo,
  onSesionCreada,
}) {
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

  // Sincronización controlada por eventos: Se ejecuta de forma segura al interactuar
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
      console.error("Error al validar el plazo del retoque", err);
    }
  };

  const handleCambioCampo = (campo, valorCampo) => {
    const nuevoFormData = { ...formData, [campo]: valorCampo };

    // Si cambian a modo Retoque o seleccionan un Tatuaje en modo Retoque
    if (
      (campo === "es_retoque" && valorCampo === "S") ||
      (campo === "TATUAJE_id_tatuaje" && nuevoFormData.es_retoque === "S")
    ) {
      verificarPlazoRetoque(nuevoFormData.TATUAJE_id_tatuaje, nuevoFormData);
    }
    // Si desactivan el modo retoque, limpiamos las alertas de forma inmediata
    else if (campo === "es_retoque" && valorCampo === "N") {
      setInfoRetoque("");
      nuevoFormData.valor = recalcularValor(
        nuevoFormData.duracion_horas,
        nuevoFormData.TARIFA_id_tarifa,
        "N",
      );
    }
    // Comportamiento normal para horas o tarifas
    else if (campo === "duracion_horas" || campo === "TARIFA_id_tarifa") {
      const deMomentoGratis = infoRetoque.includes("¡Retoque Gratuito!");
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
      !formData.TATUAJE_id_tatuaje ||
      !formData.TARIFA_id_tarifa
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const datosEnviar = {
        ...formData,
        USUARIO_id_usuario: usuarioActivo.id_usuario,
      };
      await axios.post("http://localhost:5000/api/sesiones", datosEnviar);

      setExito("¡Sesión registrada exitosamente!");
      setError("");
      setInfoRetoque("");
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
      setError(
        err.response?.data?.error || "Error al registrar la sesión de trabajo",
      );
    }
  };

  return (
    <div className="card-form">
      <h3>Registrar Sesión de Trabajo / Retoque (HU-02, HU-07)</h3>
      {error && <p className="error">{error}</p>}
      {exito && (
        <p className="exito" style={{ color: "#2ecc71" }}>
          {exito}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="ID Sesión"
          value={formData.id_sesion}
          onChange={(e) => handleCambioCampo("id_sesion", e.target.value)}
        />
        <input
          type="date"
          value={formData.fecha}
          onChange={(e) => handleCambioCampo("fecha", e.target.value)}
        />
        <input
          type="number"
          step="0.1"
          placeholder="Duración en Horas"
          value={formData.duracion_horas}
          onChange={(e) => handleCambioCampo("duracion_horas", e.target.value)}
        />

        <label
          style={{
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          ¿Esta sesión corresponde a un retoque?
          <select
            value={formData.es_retoque}
            onChange={(e) => handleCambioCampo("es_retoque", e.target.value)}
            style={{ width: "auto", padding: "5px" }}
          >
            <option value="N">No (Sesión regular)</option>
            <option value="S">Sí (Módulo Retoques - HU-07)</option>
          </select>
        </label>

        {infoRetoque && (
          <div
            style={{
              fontSize: "13px",
              padding: "10px",
              borderRadius: "6px",
              background: infoRetoque.includes("¡Retoque Gratuito!")
                ? "rgba(46, 204, 113, 0.15)"
                : "rgba(231, 76, 60, 0.15)",
              color: infoRetoque.includes("¡Retoque Gratuito!")
                ? "#2ecc71"
                : "#e74c3c",
              fontWeight: "600",
            }}
          >
            {infoRetoque}
          </div>
        )}

        <select
          value={formData.TARIFA_id_tarifa}
          onChange={(e) =>
            handleCambioCampo("TARIFA_id_tarifa", e.target.value)
          }
        >
          <option value="">-- Selecciona el Tipo de Trabajo / Tarifa --</option>
          {tarifas.map((t) => (
            <option key={t.id_tarifa} value={t.id_tarifa}>
              {t.tipo_trabajo} ($
              {parseFloat(t.valor_hora).toLocaleString("es-CO")}/h)
            </option>
          ))}
        </select>

        <select
          value={formData.TATUAJE_id_tatuaje}
          onChange={(e) =>
            handleCambioCampo("TATUAJE_id_tatuaje", e.target.value)
          }
        >
          <option value="">-- Selecciona el Tatuaje Vinculado --</option>
          {tatuajes.map((t) => (
            <option key={t.id_tatuaje} value={t.id_tatuaje}>
              {t.diseno} (ID: {t.id_tatuaje})
            </option>
          ))}
        </select>

        <div
          style={{
            padding: "12px",
            background: "var(--bg-main)",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
          }}
        >
          <strong>Valor Final de la Sesión:</strong> $
          {parseFloat(formData.valor).toLocaleString("es-CO")}
        </div>

        <button type="submit">Guardar Sesión / Retoque</button>
      </form>
    </div>
  );
}
