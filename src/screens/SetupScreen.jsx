import { useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function SetupScreen() {
  const { setupMaster } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }
    setSubmitting(true);
    try {
      await setupMaster({ name, email, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <ThemeToggle className="auth-theme-toggle" />
      <div className="auth-brand">
        <div className="auth-brand-icon">IMG</div>
        <h1>Kanban IMG</h1>
        <p>Bem-vindo! Vamos configurar a conta master que administrará os usuários deste espaço.</p>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Configuração inicial</h2>
            <p>Esta será a conta master, com acesso total e ao painel de usuários.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Nome</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            </label>
            <label className="auth-field">
              <span>E-mail</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="auth-field">
              <span>Senha</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </label>
            <label className="auth-field">
              <span>Confirmar senha</span>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn-primary auth-submit" disabled={submitting}>
              {submitting ? "Criando..." : "Criar conta master"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
