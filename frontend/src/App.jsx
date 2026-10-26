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
import "./App.css";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("clientes");
  const [clientes, setClientes] = useState([]);
  const [tatuajes, setTatuajes] = useState([]);
  const [tarifas, setTarifas] = useState([]);

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

  const handleLogout = () => {
    setUsuario(null);
    setClientes([]);
    setTatuajes([]);
    setTarifas([]);
  };

  useEffect(() => {
    if (!usuario) return;
    let estaActivo = true;
    const cargarDatos = async () => {
      try {
        const [resC, resT, resTar] = await Promise.all([
          axios.get("http://localhost:5000/api/clientes"),
          axios.get("http://localhost:5000/api/tatuajes"),
          axios.get("http://localhost:5000/api/tarifas"),
        ]);
        if (estaActivo) {
          setClientes(resC.data);
          setTatuajes(resT.data);
          setTarifas(resTar.data);
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
            Gestion Clientes
          </button>
          <button className={vistaActiva === "tatuajes" ? "active" : ""} onClick={() => setVistaActiva("tatuajes")}>
            Disenos y Tatuajes
          </button>
          <button className={vistaActiva === "tarifas" ? "active" : ""} onClick={() => setVistaActiva("tarifas")}>
            Catalogo Tarifas
          </button>
          <button className={vistaActiva === "facturacion" ? "active" : ""} onClick={() => setVistaActiva("facturacion")}>
            Facturacion
          </button>
          {usuario.rol === "ADMINISTRADOR" && (
            <button className={vistaActiva === "reportes" ? "active" : ""} onClick={() => setVistaActiva("reportes")}>
              Cierre y Reportes
            </button>
          )}
        </nav>

        <button className="btn-sidebar-logout" onClick={handleLogout}>
          Cerrar Sesion
        </button>
      </aside>

      <main className="content-area">
        {vistaActiva === "clientes" && (
          <div className="fade-in animate-view">
            <h2>Modulo de Clientes</h2>
            <div className="view-grid">
              <ClienteForm onClienteCreado={cargarClientes} />
              <ClienteList clientes={clientes} onClienteActualizado={cargarClientes} />
            </div>
          </div>
        )}

        {vistaActiva === "tatuajes" && (
          <div className="fade-in animate-view">
            <h2>Modulo de Disenos y Tatuajes</h2>
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
            <h2>Catalogo de Tarifas y Tatuadores</h2>
            <div className="view-grid">
              <TarifaForm onTarifaCreada={cargarTarifas} />
              <TarifaList tarifas={tarifas} onTarifaActualizada={cargarTarifas} />
            </div>
          </div>
        )}

        {vistaActiva === "facturacion" && (
          <div className="fade-in animate-view">
            <h2>Facturacion Electronica</h2>
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              <FacturaForm tatuajes={tatuajes} usuarioActivo={usuario} onFacturaGenerada={cargarTatuajes} />
            </div>
          </div>
        )}

        {vistaActiva === "reportes" && usuario.rol === "ADMINISTRADOR" && (
          <ReportesView />
        )}
      </main>
    </div>
  );
}

export default App;
