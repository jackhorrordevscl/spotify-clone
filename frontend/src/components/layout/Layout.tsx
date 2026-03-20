import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Player from '../player/Player'

const Layout = () => {
    return (
      <div
        className="flex"
        style={{ height: "100vh", background: "var(--bg-primary)" }}
      >
        {/* ==================== SIDEBAR FIJO A LA IZQUIERDA ==================== */}

        <Sidebar />

        {/* ==================== CONTENIDO PRINCIPAL + PLAYER ==================== */}

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* ==================== AREA DE CONTENIDO SCROLLEABLE ==================== */}

          <main
            className="flex-1 overflow-y-auto"
            style={{
              background: "var(--bg-primary)",
              padding: "2rem 2.5rem",
            }}
          >
            <Outlet />
          </main>

          {/* ==================== PLAYER FIJO EN LA PARTE INFERIOR ==================== */}

          <Player />
          
        </div>
      </div>
    );
}

export default Layout