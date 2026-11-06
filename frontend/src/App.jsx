import { useState, useEffect } from "react";
import axios from "axios";
import LoginForm from "./components/LoginForm";
import ClienteForm from "./components/ClienteForm";
import ClienteList from "./components/ClienteList";
import TatuajeForm from "./components/TatuajeForm";
import TatuajeList from "./components/TatuajeList";
import TarifaForm from "./components/TarifaForm";
import TarifaList from "./components/TarifaList";
import SesionForm from "./components/SesionForm";
import FacturaForm from "./components/FacturaForm";
import ReportesView from "./components/ReportesView";
import UsuarioForm from "./components/UsuarioForm";
import UsuarioList from "./components/UsuarioList";
import "./App.css";

// ── Skeleton de carga ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: "var(--bg-card)",
      borderRadius: "10px",
      padding: "20px",
      border: "1px solid var(--border-color)",
    }}>
      {[80, 60, 90, 50].map((w, i) => (
        <div key={i} style={{
          height: "12px",
          width: `${w}%`,
          borderRadius: "6px",
          background: "var(--border-color)",
          marginBottom: "12px",
          animation: "pulse 1.5s ease-in-out infinite",
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
    </div>
  );
}

function App() {
  const [usuario, setUsuario] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("clientes");
  const [clientes, setClientes] = useState([]);
  const [tatuajes, setTatuajes] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [tema, setTema] = useState(() => localStorage.getItem("theme") || "dark-soft");

  // ── Inicializar tema desde localStorage ──
  useEffect(() => {
    document.documentElement.dataset.theme = tema;
  }, [tema]);

  const toggleTema = () => {
    const nuevo = tema === "dark-soft" ? "light" : "dark-soft";
    setTema(nuevo);
    localStorage.setItem("theme", nuevo);
  };

  const cargarClientes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/clientes");
      setClientes(res.data);
    } catch (err) {
      console.error("Error cargando clientes", err);
    }
  };

  const cargarTatuajes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tatuajes");
      setTatuajes(res.data);
    } catch (err) {
      console.error("Error cargando tatuajes", err);
    }
  };

  const cargarTarifas = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tarifas");
      setTarifas(res.data);
    } catch (err) {
      console.error("Error cargando tarifas", err);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error cargando colaboradores", err);
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    setClientes([]);
    setTatuajes([]);
    setTarifas([]);
    setUsuarios([]);
  };

  useEffect(() => {
    if (!usuario) return;
    let estaActivo = true;
    const cargarDatos = async () => {
      setCargandoDatos(true);
      try {
        const peticiones = [
          axios.get("http://localhost:5000/api/clientes"),
          axios.get("http://localhost:5000/api/tatuajes"),
          axios.get("http://localhost:5000/api/tarifas"),
        ];
        if (usuario.rol === "ADMINISTRADOR") {
          peticiones.push(axios.get("http://localhost:5000/api/usuarios"));
        }
        const [resC, resT, resTar, resU] = await Promise.all(peticiones);
        if (estaActivo) {
          setClientes(resC.data);
          setTatuajes(resT.data);
          setTarifas(resTar.data);
          if (resU) setUsuarios(resU.data);
        }
      } catch (err) {
        console.error("Error al sincronizar datos", err);
      } finally {
        if (estaActivo) setCargandoDatos(false);
      }
    };
    cargarDatos();
    return () => { estaActivo = false; };
  }, [usuario]);

  if (!usuario) {
    return (
      <div className="login-container">
        <LoginForm onLoginExitoso={(u) => setUsuario(u)} />
      </div>
    );
  }

  // ── Spinner / Skeleton de carga global ──
  if (cargandoDatos) {
    return (
      <div className="layout-main">
        <aside className="sidebar no-print">
          <div className="sidebar-logo">
            <h2>ART INK</h2>
            <p>Tattoo Studio</p>
          </div>
        </aside>
        <main className="content-area">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "900px" }}>
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="layout-main">
      <aside className="sidebar no-print">
        <div className="sidebar-logo">
          <svg width="40" height="40" viewBox="0 0 100 100" style={{ display: "block", margin: "0 auto 6px" }}>
            <circle cx="50" cy="50" r="48" fill="none" stroke="var(--accent-color)" strokeWidth="1.5"/>
            <g transform="translate(50,50)" fill="none" stroke="var(--accent-color)" strokeWidth="1.2" strokeLinecap="round">
              <ellipse rx="12" ry="18" transform="rotate(0)" opacity="0.9"/>
              <ellipse rx="12" ry="18" transform="rotate(60)" opacity="0.9"/>
              <ellipse rx="12" ry="18" transform="rotate(120)" opacity="0.9"/>
              <ellipse rx="12" ry="18" transform="rotate(180)" opacity="0.9"/>
              <ellipse rx="12" ry="18" transform="rotate(240)" opacity="0.9"/>
              <circle r="5" fill="var(--accent-color)" stroke="none" opacity="0.8"/>
            </g>
          </svg>
          <h2>ART INK</h2>
          <p>Tattoo Studio</p>
        </div>

        <div className="sidebar-user">
          <p className="user-name">{usuario.nombre}</p>
          <span className="user-rol">{usuario.rol}</span>
        </div>

        <nav className="sidebar-menu">
          <button className={vistaActiva === "clientes" ? "active" : ""} onClick={() => setVistaActiva("clientes")}>
            👥 Gestión Clientes
          </button>
          <button className={vistaActiva === "tatuajes" ? "active" : ""} onClick={() => setVistaActiva("tatuajes")}>
            🎨 Diseños y Tatuajes
          </button>
          <button className={vistaActiva === "tarifas" ? "active" : ""} onClick={() => setVistaActiva("tarifas")}>
            💲 Catálogo Tarifas
          </button>
          <button className={vistaActiva === "facturacion" ? "active" : ""} onClick={() => setVistaActiva("facturacion")}>
            🧾 Facturación
          </button>
          {usuario.rol === "ADMINISTRADOR" && (
            <>
              <button className={vistaActiva === "usuarios" ? "active" : ""} onClick={() => setVistaActiva("usuarios")}>
                🧑‍🎨 Gestión Personal
              </button>
              <button className={vistaActiva === "reportes" ? "active" : ""} onClick={() => setVistaActiva("reportes")}>
                📊 Cierre y Reportes
              </button>
            </>
          )}
        </nav>

        {/* ── Conmutador de tema ── */}
        <button
          onClick={toggleTema}
          aria-label={tema === "dark-soft" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            padding: "10px 16px",
            width: "100%",
            textAlign: "left",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
        >
          {tema === "dark-soft" ? "☀️ Tema Claro" : "🌙 Tema Oscuro"}
        </button>

        <button className="btn-sidebar-logout" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      <main className="content-area">
        {vistaActiva === "clientes" && (
          <div className="fade-in animate-view">
            <h2>Módulo de Clientes</h2>
            <div className="view-grid">
              <ClienteForm onClienteCreado={cargarClientes} />
              <ClienteList clientes={clientes} onClienteActualizado={cargarClientes} />
            </div>
          </div>
        )}

        {vistaActiva === "tatuajes" && (
          <div className="fade-in animate-view">
            <h2>Módulo de Diseños y Tatuajes</h2>
            <div className="view-grid">
              <div className="columna-view">
                <TatuajeForm clientes={clientes} tarifas={tarifas} onTatuajeCreado={cargarTatuajes} />
                <SesionForm tatuajes={tatuajes} tarifas={tarifas} usuarioActivo={usuario} onSesionCreada={cargarTatuajes} />
              </div>
              <TatuajeList tatuajes={tatuajes} onTatuajeActualizado={cargarTatuajes} />
            </div>
          </div>
        )}

        {vistaActiva === "tarifas" && (
          <div className="fade-in animate-view">
            <h2>Catálogo de Tarifas y Tatuadores</h2>
            <div className="view-grid">
              <TarifaForm onTarifaCreada={cargarTarifas} />
              <TarifaList tarifas={tarifas} onTarifaActualizada={cargarTarifas} />
            </div>
          </div>
        )}

        {vistaActiva === "facturacion" && (
          <div className="fade-in animate-view">
            <h2>Facturación Electrónica</h2>
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              <FacturaForm tatuajes={tatuajes} usuarioActivo={usuario} onFacturaGenerada={cargarTatuajes} />
            </div>
          </div>
        )}

        {vistaActiva === "usuarios" && usuario.rol === "ADMINISTRADOR" && (
          <div className="fade-in animate-view">
            <h2>Gestión de Personal y Tatuadores</h2>
            <div className="view-grid">
              <UsuarioForm onUsuarioCreado={cargarUsuarios} />
              <UsuarioList usuarios={usuarios} />
            </div>
          </div>
        )}

        {vistaActiva === "reportes" && usuario.rol === "ADMINISTRADOR" && (
          <ReportesView usuarioActivo={usuario} />
        )}
      </main>
    </div>
  );
}

export default App;
