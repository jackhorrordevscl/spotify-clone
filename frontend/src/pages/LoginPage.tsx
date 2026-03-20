import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Email o contraseña incorrectos");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-2xl flex flex-col gap-6"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          padding: '15px',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <span style={{ fontSize: 22, color: "#080d12", fontWeight: 700 }}>
              A
            </span>
          </div>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Iniciar sesión
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div
            className="text-sm text-center px-3 py-2 rounded-lg"
            style={{
              background: "#162030",
              color: "#f87171",
              border: "1px solid #3d1515",
            }}
          >
            {error}
          </div>
        )}

        {/* Formulario */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)", paddingBottom: '5px' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="px-3 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                padding: '5px',
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)", paddingBottom: '5px'}}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-3 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                padding: '5px',
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="py-2 rounded-lg text-sm font-semibold transition-opacity"
            style={{
              background: "var(--accent)",
              color: "#080d12",
              opacity: isLoading ? 0.6 : 1,
              padding: '5px'
            }}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        {/* Registro */}
        <p
          className="text-center text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="font-medium transition-colors"
            style={{ color: "var(--accent)" }}
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
