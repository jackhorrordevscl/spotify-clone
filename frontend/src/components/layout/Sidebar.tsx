import { Home, Search, Library, Plus, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { usePlaylistStore } from "../../store/playlistStore";

interface Props {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: Props) => {
  const { user, logout } = useAuthStore();
  const { playlists } = usePlaylistStore();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: "16rem",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        padding: "1.25rem 0.875rem",
      }}
    >
      {/* ========== LOGO ========== */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: "1.75rem" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: "36px",
              height: "36px",
              background: "var(--accent)",
            }}
          >
            <span style={{ fontSize: 15, color: "#080d12", fontWeight: 700 }}>
              A
            </span>
          </div>
          <span
            className="font-bold text-xl tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            Arctic
          </span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <X size={18} />
        </button>
      </div>

      {/* ========== NAV ========== */}
      <nav
        className="flex flex-col"
        style={{ gap: "0.25rem", marginBottom: "1.5rem" }}
      >
        {[
          { to: "/", label: "Inicio", icon: <Home size={19} />, end: true },
          { to: "/search", label: "Buscar", icon: <Search size={19} /> },
          {
            to: "/library",
            label: "Tu biblioteca",
            icon: <Library size={19} />,
          },
        ].map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl transition-colors text-sm font-medium ${
                isActive
                  ? "bg-bg-tertiary text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
              }`
            }
            style={{ padding: "0.625rem 0.75rem" }}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          marginBottom: "1.25rem",
        }}
      />

      {/* ========== PLAYLISTS ========== */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ gap: "0.75rem" }}
      >
        <div
          className="flex items-center justify-between"
          style={{ padding: "0 0.25rem" }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Playlists
          </span>
          <button
            style={{ color: "var(--text-muted)" }}
            onClick={() => handleNavigate("/library")}
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

        <div
          className="flex-1 overflow-y-auto flex flex-col"
          style={{ gap: "0.125rem" }}
        >
          {playlists.length === 0 && (
            <p
              className="text-xs"
              style={{ color: "var(--text-muted)", padding: "0.25rem 0.5rem" }}
            >
              Aún no tienes playlists
            </p>
          )}
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handleNavigate(`/playlist/${playlist.id}`)}
              className="text-left truncate w-full rounded-lg text-sm transition-colors"
              style={{
                color: "var(--text-secondary)",
                padding: "0.5rem 0.75rem",
              }}
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

      {/* ========== USUARIO ========== */}
      <div
        className="flex items-center justify-between gap-2"
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1rem",
          marginTop: "0.5rem",
        }}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{
              width: "32px",
              height: "32px",
              background: "var(--bg-tertiary)",
            }}
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
          onClick={() => {
            logout();
            onClose?.();
          }}
          className="text-xs shrink-0 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          Salir
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
