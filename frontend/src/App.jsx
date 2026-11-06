import { useState, useEffect } from "react";
import api from "./services/api";
import LoginForm from "./components/LoginForm";
import ClienteList from "./components/ClienteList";
import TatuajeList from "./components/TatuajeList";
import SesionList from "./components/SesionList";
import FacturaForm from "./components/FacturaForm";
import ReportesView from "./components/ReportesView";
import UsuarioList from "./components/UsuarioList";
import TarifaForm from "./components/TarifaForm";
import TarifaList from "./components/TarifaList";
import "./App.css";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("clientes");
  const [subVistaTatuajes, setSubVistaTatuajes] = useState("tatuajes"); // "tatuajes" | "sesiones"
  const [clientes, setClientes] = useState([]);
  const [tatuajes, setTatuajes] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tarifas, setTarifas] = useState([]);

  const cargarClientes = async () => {
    try {
      const res = await api.get("/clientes");
      setClientes(res.data);
    } catch (err) {
      console.error("Error cargando clientes", err);
    }
  };

  const cargarTatuajes = async () => {
    try {
      const res = await api.get("/tatuajes");
      setTatuajes(res.data);
    } catch (err) {
      console.error("Error cargando tatuajes", err);
    }
  };

  const cargarSesiones = async () => {
    try {
      const res = await api.get("/sesiones");
      setSesiones(res.data);
    } catch (err) {
      console.error("Error cargando sesiones", err);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await api.get("/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error cargando usuarios", err);
    }
  };

  const cargarTarifas = async () => {
    try {
      const res = await api.get("/tarifas");
      setTarifas(res.data);
    } catch (err) {
      console.error("Error cargando tarifas", err);
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    setClientes([]);
    setTatuajes([]);
    setSesiones([]);
    setUsuarios([]);
    setTarifas([]);
  };

  useEffect(() => {
    if (!usuario) return;
    let estaActivo = true;
    const cargarDatos = async () => {
      try {
        const [resC, resT, resS, resU, resTar] = await Promise.all([
          api.get("/clientes"),
          api.get("/tatuajes"),
          api.get("/sesiones"),
          api.get("/usuarios"),
          api.get("/tarifas").catch(() => ({ data: [] })),
        ]);
        if (estaActivo) {
          setClientes(resC.data);
          setTatuajes(resT.data);
          setSesiones(resS.data);
          setUsuarios(resU.data);
          setTarifas(resTar.data || []);
        }
      } catch (err) {
        console.error("Error al sincronizar datos", err);
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
            Gestión Clientes
          </button>
          <button className={vistaActiva === "tatuajes" ? "active" : ""} onClick={() => setVistaActiva("tatuajes")}>
            Diseños y Sesiones
          </button>
          <button className={vistaActiva === "tarifas" ? "active" : ""} onClick={() => setVistaActiva("tarifas")}>
            Tarifas de Trabajo
          </button>
          <button className={vistaActiva === "facturacion" ? "active" : ""} onClick={() => setVistaActiva("facturacion")}>
            Facturación
          </button>
          {usuario.rol === "ADMINISTRADOR" && (
            <button className={vistaActiva === "usuarios" ? "active" : ""} onClick={() => setVistaActiva("usuarios")}>
              Gestión Usuarios
            </button>
          )}
          {usuario.rol === "ADMINISTRADOR" && (
            <button className={vistaActiva === "reportes" ? "active" : ""} onClick={() => setVistaActiva("reportes")}>
              Cierre y Reportes
            </button>
          )}
        </nav>

        <button className="btn-sidebar-logout" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </aside>

      <main className="content-area">
        {/* VISTA: GESTIÓN DE CLIENTES */}
        {vistaActiva === "clientes" && (
          <div className="fade-in animate-view">
            <h2>Módulo de Clientes</h2>
            <ClienteList
              clientes={clientes}
              onClienteActualizado={cargarClientes}
              usuarioActivo={usuario}
            />
          </div>
        )}

        {/* VISTA: DISEÑOS Y SESIONES (CON PESTAÑAS) */}
        {vistaActiva === "tatuajes" && (
          <div className="fade-in animate-view">
            <h2>Módulo de Diseños y Sesiones</h2>
            <div className="view-tabs">
              <button
                className={`view-tab-btn ${subVistaTatuajes === "tatuajes" ? "active" : ""}`}
                onClick={() => setSubVistaTatuajes("tatuajes")}
              >
                🎨 Catálogo de Diseños
              </button>
              <button
                className={`view-tab-btn ${subVistaTatuajes === "sesiones" ? "active" : ""}`}
                onClick={() => setSubVistaTatuajes("sesiones")}
              >
                📅 Sesiones Agendadas
              </button>
            </div>

            {subVistaTatuajes === "tatuajes" ? (
              <TatuajeList
                tatuajes={tatuajes}
                onTatuajeActualizado={() => {
                  cargarTatuajes();
                  cargarSesiones();
                }}
                usuarioActivo={usuario}
              />
            ) : (
              <SesionList
                sesiones={sesiones}
                tatuajes={tatuajes}
                clientes={clientes}
                usuarios={usuarios}
                tarifas={tarifas}
                usuarioActivo={usuario}
                onSesionActualizada={() => {
                  cargarSesiones();
                  cargarTatuajes();
                }}
              />
            )}
          </div>
        )}

        {/* VISTA: TARIFAS DE TRABAJO (HU-04) */}
        {vistaActiva === "tarifas" && (
          <div className="fade-in animate-view">
            <h2>Configuración de Tarifas por Tipo de Trabajo</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
              <TarifaForm onTarifaCreada={cargarTarifas} />
              <TarifaList tarifas={tarifas} onTarifaActualizada={cargarTarifas} />
            </div>
          </div>
        )}

        {/* VISTA: FACTURACIÓN ELECTRÓNICA */}
        {vistaActiva === "facturacion" && (
          <div className="fade-in animate-view">
            <h2>Facturación Electrónica</h2>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <FacturaForm
                usuarioActivo={usuario}
                onFacturaGenerada={() => {
                  cargarTatuajes();
                  cargarSesiones();
                }}
              />
            </div>
          </div>
        )}

        {/* VISTA: GESTIÓN DE USUARIOS (ADMINISTRADOR) */}
        {vistaActiva === "usuarios" && usuario.rol === "ADMINISTRADOR" && (
          <div className="fade-in animate-view">
            <h2>Módulo de Gestión de Usuarios y Staff</h2>
            <UsuarioList
              usuarios={usuarios}
              onUsuarioActualizado={cargarUsuarios}
              usuarioActivo={usuario}
            />
          </div>
        )}

        {/* VISTA: REPORTES (ADMINISTRADOR) */}
        {vistaActiva === "reportes" && usuario.rol === "ADMINISTRADOR" && (
          <ReportesView />
        )}
      </main>
    </div>
  );
}

export default App;
