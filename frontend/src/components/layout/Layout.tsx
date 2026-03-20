import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Player from "../player/Player";
import { Menu, X } from "lucide-react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="flex"
      style={{ height: "100vh", background: "var(--bg-primary)" }}
    >
      {/* ==================== OVERLAY MOBILE ==================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(8,13,18,0.75)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ==================== SIDEBAR  ==================== */}

      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:static md:translate-x-0 md:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: "16rem" }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ==================== CONTENIDO PRINCIPAL + PLAYER ==================== */}

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* ========== TOP BAR MOBILE ========== */}

        <div
          className="flex items-center gap-3 md:hidden shrink-0"
          style={{
            height: "52px",
            padding: '0 1rem',
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ color: "var(--text-secondary)" }}
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <span style={{ fontSize: 13, color: '#080d12', fontWeight: 700 }}>A</span>
            </div>
            <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              Arctic
            </span>
          </div>
        </div>

        {/* ==================== AREA DE CONTENIDO SCROLLEABLE ==================== */}

        <main
          className="flex-1 overflow-y-auto"
          style={{
            background: "var(--bg-primary)",
            //padding: "2rem 2.5rem",
            padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 4vw, 3rem)',
          }}
        >
          <Outlet />
        </main>

        {/* ==================== PLAYER FIJO EN LA PARTE INFERIOR ==================== */}

        <Player />
      </div>
    </div>
  )
}

export default Layout;
