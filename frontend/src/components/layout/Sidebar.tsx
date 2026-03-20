import { Home, Search, Library, Plus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { usePlaylistStore } from "../../store/playlistStore";

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { playlists } = usePlaylistStore();
  const navigate = useNavigate();

  return (
    <aside
      className="flex flex-col h-full w-64 p-6 gap-4"
      style={{
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        paddingLeft: '10px',
        paddingRight: '10px'
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-1 py-2" 
        style={{ paddingTop: '10px' }} 
        >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <span style={{ fontSize: 16, color: "#080d12", fontWeight: 700 }}>
            A
          </span>
        </div>
        <span className="text-text-primary font-bold text-xl tracking-wide">
          Arctic
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-1.5">
        {[
          { to: "/", label: "Inicio", icon: <Home size={20} />, end: true },
          { to: "/search", label: "Buscar", icon: <Search size={20} /> },
          {
            to: "/library",
            label: "Tu biblioteca",
            icon: <Library size={20} />,
          },
        ].map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                isActive
                  ? "bg-bg-tertiary text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
              }`
            }
            style={{ padding: '5px' }}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border" />

      {/* PLAYLIST */}

      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Playlists
          </span>
          <button
            className="transition-colors"
            style={{ color: "var(--text-muted)" }}
            onClick={() => navigate("/library")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <Plus size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5">
          {playlists.length === 0 && (
            <p
              className="text-xs px-1 py-1"
              style={{ color: "var(--text-muted)" }}
            >
              Aún no tienes playlists
            </p>
          )}
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="text-left px-3 py-2 rounded-lg text-sm truncate transition-colors w-full"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-tertiary)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              {playlist.title}
            </button>
          ))}
        </div>
      </div>

      {/* Usuario */}
      <div className="border-t border-border pt-4 flex items-center justify-between gap-2"
        style={{ paddingTop: '7px', paddingBottom: '7px' }}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <span
              className="text-xs font-bold"
              style={{ color: "var(--accent)" }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span
            className="text-sm font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {user?.name}
          </span>
        </div>
        <button
          onClick={logout}
          className="text-xs flex-shrink-0 transition-colors"
          style={{  color: 'var(--text-muted)' }}
          onMouseEnter={ (e) => e.currentTarget.style.color = 'var(--accent)' }
          onMouseLeave={ (e) => e.currentTarget.style.color = 'var(--text-muted)' }
        >
          Salir
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
