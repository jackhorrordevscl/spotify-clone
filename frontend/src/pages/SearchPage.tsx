import { useState } from "react";
import { Search, X } from "lucide-react";
import { useSearch } from "../hooks/useSearch";
import SongCard from "../components/ui/SongCard";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const { results, isLoading } = useSearch(query);

  return (
    <div className="flex flex-col" style={{ gap: "1.75rem" }}>
      {/* ========== TÍTULO ========== */}
      <div style={{ paddingTop: "0.25rem" }}>
        <h1
          className="font-bold"
          style={{
            color: "var(--text-primary)",
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            lineHeight: 1.2,
          }}
        >
          Buscar
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.9375rem",
            marginTop: "0.375rem",
          }}
        >
          Encuentra canciones por título o artista
        </p>
      </div>

      {/* ========== INPUT ========== */}
      <div style={{ position: "relative", maxWidth: "480px" }}>
        <Search
          size={15}
          style={{
            color: "var(--text-muted)",
            position: "absolute",
            left: "0.875rem",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué quieres escuchar?"
          className="w-full rounded-xl text-sm outline-none transition-colors"
          style={{
            paddingLeft: "2.5rem",
            paddingRight: query ? "2.5rem" : "1rem",
            paddingTop: "0.75rem",
            paddingBottom: "0.75rem",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{
              color: "var(--text-muted)",
              position: "absolute",
              right: "0.875rem",
              top: "50%",
              transform: "translateY(-50%)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* ========== ESTADO VACÍO ========== */}
      {!query && (
        <div
          className="flex flex-col items-center justify-center"
          style={{
            gap: "0.875rem",
            padding: "5rem 2rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
          }}
        >
          <Search size={40} style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            Escribe algo para buscar
          </p>
        </div>
      )}

      {/* ========== CARGANDO ========== */}
      {query && isLoading && (
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl animate-pulse flex flex-col"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                padding: "0.875rem",
                gap: "0.75rem",
              }}
            >
              <div
                className="w-full aspect-square rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}
              />
              <div className="flex flex-col" style={{ gap: "0.5rem" }}>
                <div
                  className="h-3 rounded-full w-3/4"
                  style={{ background: "var(--bg-tertiary)" }}
                />
                <div
                  className="h-3 rounded-full w-1/2"
                  style={{ background: "var(--bg-tertiary)" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== SIN RESULTADOS ========== */}
      {query && !isLoading && results.length === 0 && (
        <div
          className="flex flex-col items-center justify-center"
          style={{
            gap: "0.875rem",
            padding: "5rem 2rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
          }}
        >
          <span style={{ fontSize: "2.5rem", color: "var(--text-muted)" }}>
            ♪
          </span>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            No se encontraron canciones para "{query}"
          </p>
        </div>
      )}

      {/* ========== RESULTADOS ========== */}
      {query && !isLoading && results.length > 0 && (
        <div className="flex flex-col" style={{ gap: "1.25rem" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            {results.length} resultado{results.length !== 1 ? "s" : ""} para "
            {query}"
          </p>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {results.map((song) => (
              <SongCard key={song.id} song={song} queue={results} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
