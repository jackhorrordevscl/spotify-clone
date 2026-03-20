import { useState } from "react";
import { Search, X } from "lucide-react";
import { useSearch } from "../hooks/useSearch";
import SongCard from "../components/ui/SongCard";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const { results, isLoading } = useSearch(query);

  return (
    <div className="flex flex-col gap-6">
      {/* Título */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Buscar
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Encuentra canciones por título o artista
        </p>
      </div>

      {/* Input de búsqueda */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué quieres escuchar?"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none transition-colors"
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            paddingLeft: '35px',
            paddingTop: '5px',
            paddingBottom: '5px',
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Estado vacío — sin query */}
      {!query && (
        <div
          className="flex flex-col items-center gap-3 py-20 rounded-xl"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            paddingTop: '10px',
            paddingBottom: '10px',
          }}
        >
          <Search size={40} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Escribe algo para buscar
          </p>
        </div>
      )}

      {/* Cargando */}
      {query && isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-4 flex flex-col gap-3 animate-pulse"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-full aspect-square rounded-lg"
                style={{ background: "var(--bg-tertiary)" }}
              />
              <div className="flex flex-col gap-2">
                <div
                  className="h-3 rounded w-3/4"
                  style={{ background: "var(--bg-tertiary)" }}
                />
                <div
                  className="h-3 rounded w-1/2"
                  style={{ background: "var(--bg-tertiary)" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {query && !isLoading && results.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 py-20 rounded-xl"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: 40, color: "var(--text-muted)" }}>♪</span>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No se encontraron canciones para "{query}"
          </p>
        </div>
      )}

      {/* Resultados */}
      {query && !isLoading && results.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {results.length} resultado{results.length !== 1 ? "s" : ""} para "
            {query}"
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
