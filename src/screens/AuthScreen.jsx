import { useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function AuthScreen({ onBack }) {
  const { login, registerSelf } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (mode === "signup" && password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await registerSelf({ name, email, password });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError("");
  }

  return (
    <div className="auth-shell">
      <ThemeToggle className="auth-theme-toggle" />
      {onBack && (
        <button className="auth-back-btn" onClick={onBack}>
          ← Voltar
        </button>
      )}
      <div className="auth-brand">
        <div className="auth-brand-icon">IMG</div>
        <h1>Kanban IMG</h1>
        <p>Organize seus projetos em quadros Kanban simples, rápidos e colaborativos.</p>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={"auth-tab" + (mode === "login" ? " active" : "")} onClick={() => switchMode("login")}>
              Entrar
            </button>
            <button className={"auth-tab" + (mode === "signup" ? " active" : "")} onClick={() => switchMode("signup")}>
              Criar conta
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label className="auth-field">
                <span>Nome</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
              </label>
            )}
            <label className="auth-field">
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={mode === "login"}
              />
            </label>
            <label className="auth-field">
              <span>Senha</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </label>
            {mode === "signup" && (
              <label className="auth-field">
                <span>Confirmar senha</span>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
              </label>
            )}

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn-primary auth-submit" disabled={submitting}>
              {submitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
