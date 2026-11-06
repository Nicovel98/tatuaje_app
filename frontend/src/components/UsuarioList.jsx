export default function UsuarioList({ usuarios }) {
  const getIniciales = (nombre) => {
    if (!nombre) return "US";
    const partes = nombre.trim().split(" ");
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return partes[0].slice(0, 2).toUpperCase();
  };

  const colorRol = (rol) =>
    rol === "ADMINISTRADOR" ? "var(--accent-color)" : "var(--color-info)";

  return (
    <div className="card-list">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Personal y Tatuadores Activos</h3>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            {usuarios.length} colaboradores registrados
          </p>
        </div>
      </div>

      {usuarios.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)" }}>
          <p style={{ margin: 0, fontSize: "14px" }}>No hay colaboradores registrados.</p>
        </div>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {usuarios.map((u) => (
            <li
              key={u.id_usuario}
              style={{
                background: "var(--bg-main)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Avatar con iniciales */}
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${colorRol(u.rol)}22, ${colorRol(u.rol)}08)`,
                    border: `1px solid ${colorRol(u.rol)}55`,
                    color: colorRol(u.rol),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "13px",
                    flexShrink: 0,
                  }}
                >
                  {getIniciales(u.nombre)}
                </div>

                <div>
                  <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)" }}>
                    {u.nombre}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>
                    ✉️ {u.correo}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                {/* Badge de rol */}
                <span
                  style={{
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    background: `${colorRol(u.rol)}20`,
                    color: colorRol(u.rol),
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {u.rol === "ADMINISTRADOR" ? "Admin" : "Tatuador"}
                </span>
                {/* Badge de estado */}
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: "rgba(46, 204, 113, 0.15)",
                    color: "var(--color-success)",
                    fontWeight: "600",
                  }}
                >
                  {u.estado}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
