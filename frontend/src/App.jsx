import { useState, useEffect } from 'react';
import axios from 'axios';
import LoginForm from './components/LoginForm';
import UsuarioForm from './components/UsuarioForm';
import ClienteForm from './components/ClienteForm';
import ClienteList from './components/ClienteList';
import TatuajeForm from './components/TatuajeForm';
import TatuajeList from './components/TatuajeList';
import TarifaForm from './components/TarifaForm'; 
import TarifaList from './components/TarifaList'; 
import SesionForm from './components/SesionForm'; 
import FacturaForm from './components/FacturaForm'; 
import './App.css';

function App() {
  const [usuario, setUsuario] = useState(null); 
  const [vistaActiva, setVistaActiva] = useState('clientes'); // Controla el menú: clientes, tatuajes, tarifas, facturacion, usuarios
  const [clientes, setClientes] = useState([]);
  const [tatuajes, setTatuajes] = useState([]);
  const [tarifas, setTarifas] = useState([]); 

  const cargarClientes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error("Error cargando clientes", err);
    }
  };

  const cargarTatuajes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tatuajes');
      setTatuajes(res.data);
    } catch (err) {
      console.error("Error cargando tatuajes", err);
    }
  };

  const cargarTarifas = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tarifas');
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

    const cargarDatosDashboard = async () => {
      try {
        const [resClientes, resTatuajes, resTarifas] = await Promise.all([
          axios.get('http://localhost:5000/api/clientes'),
          axios.get('http://localhost:5000/api/tatuajes'),
          axios.get('http://localhost:5000/api/tarifas')
        ]);

        if (estaActivo) {
          setClientes(resClientes.data);
          setTatuajes(resTatuajes.data);
          setTarifas(resTarifas.data);
        }
      } catch (err) {
        console.error("Error al sincronizar los datos del estudio", err);
      }
    };

    cargarDatosDashboard();

    return () => {
      estaActivo = false;
    };
  }, [usuario]); 

  if (!usuario) {
    return (
      <div className="login-container">
        <LoginForm onLoginExitoso={(usuarioLogueado) => setUsuario(usuarioLogueado)} />
      </div>
    );
  }

  return (
    <div className="layout-main">
      {/* 📌 BARRA LATERAL DE NAVEGACIÓN PROFESIONAL */}
      <aside className="sidebar no-print">
        <div className="sidebar-logo">
          <h2>ART INK</h2>
          <p>Tattoo Studio</p>
        </div>
        
        <div className="sidebar-user">
          <p className="user-name">👤 {usuario.nombre}</p>
          <span className="user-rol">{usuario.rol}</span>
        </div>

        <nav className="sidebar-menu">
          <button className={vistaActiva === 'clientes' ? 'active' : ''} onClick={() => setVistaActiva('clientes')}>
            👥 Gestión Clientes
          </button>
          
          <button className={vistaActiva === 'tatuajes' ? 'active' : ''} onClick={() => setVistaActiva('tatuajes')}>
            🎨 Diseños & Tatuajes
          </button>
          
          <button className={vistaActiva === 'tarifas' ? 'active' : ''} onClick={() => setVistaActiva('tarifas')}>
            💰 Catálogo Tarifas
          </button>

          <button className={vistaActiva === 'facturacion' ? 'active' : ''} onClick={() => setVistaActiva('facturacion')}>
            🖨️ Facturación Caja
          </button>

          {usuario.rol === 'ADMINISTRADOR' && (
            <button className={vistaActiva === 'usuarios' ? 'active' : ''} onClick={() => setVistaActiva('usuarios')}>
              ⚙️ Control Personal
            </button>
          )}
        </nav>

        <button className="btn-sidebar-logout" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      {/* 📌 CONTENIDO CENTRAL DINÁMICO */}
      <main className="content-area">
        {vistaActiva === 'clientes' && (
          <div className="fade-in animate-view">
            <h2>Módulo de Clientes (HU-01)</h2>
            <div className="view-grid">
              <ClienteForm onClienteCreado={cargarClientes} />
              <ClienteList clientes={clientes} />
            </div>
          </div>
        )}

        {vistaActiva === 'tatuajes' && (
          <div className="fade-in animate-view">
            <h2>Módulo de Diseños y Tatuajes</h2>
            <div className="view-grid">
              <div className="columna-view">
                <TatuajeForm clientes={clientes} onTatuajeCreado={cargarTatuajes} />
                <SesionForm tatuajes={tatuajes} tarifas={tarifas} usuarioActivo={usuario} onSesionCreada={() => console.log("Sesión añadida")} />
              </div>
              <TatuajeList tatuajes={tatuajes} />
            </div>
          </div>
        )}

        {vistaActiva === 'tarifas' && (
          <div className="fade-in animate-view">
            <h2>Configuración de Tarifas (HU-04)</h2>
            <div className="view-grid">
              <TarifaForm onTarifaCreada={cargarTarifas} />
              <TarifaList tarifas={tarifas} />
            </div>
          </div>
        )}

        {vistaActiva === 'facturacion' && (
          <div className="fade-in animate-view">
            <h2>Caja y Emisión de Facturas (HU-05, HU-06)</h2>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <FacturaForm tatuajes={tatuajes} onFacturaGenerada={() => console.log("Factura emitida")} />
            </div>
          </div>
        )}

        {vistaActiva === 'usuarios' && usuario.rol === 'ADMINISTRADOR' && (
          <div className="fade-in animate-view">
            <h2>Gestión de Personal y Tatuadores (HU-11)</h2>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <UsuarioForm />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;