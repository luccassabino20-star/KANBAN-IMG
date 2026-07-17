import { useState } from "react";
import { useUsers } from "../state/UsersContext.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { useToast } from "../state/ToastContext.jsx";
import { initials, colorForUser } from "../utils/members.js";

export default function UsersPanel({ onClose }) {
  const { users, createUser, deleteUser, resetPassword } = useUsers();
  const { user: currentUser } = useAuth();
  const showToast = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetTargetId, setResetTargetId] = useState(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createUser({ name, email, password });
      setName("");
      setEmail("");
      setPassword("");
      setShowCreate(false);
      showToast("Usuário criado");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Excluir o usuário "${u.name}"? Ele será removido de todos os cartões atribuídos.`)) return;
    try {
      await deleteUser(u.id);
      showToast("Usuário excluído");
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    if (resetPasswordValue.length < 6) {
      alert("A nova senha deve ter ao menos 6 caracteres");
      return;
    }
    try {
      await resetPassword(resetTargetId, resetPasswordValue);
      showToast("Senha redefinida");
      setResetTargetId(null);
      setResetPasswordValue("");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal modal-wide">
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          &times;
        </button>
        <div className="modal-header">
          <h2 className="members-modal-title">Painel de usuários</h2>
        </div>
        <div className="modal-body">
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Papel</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="avatar avatar-small" style={{ background: colorForUser(u.id) }}>
                        {initials(u.name)}
                      </span>
                    </td>
                    <td>
                      {u.name}
                      {u.id === currentUser.id && <span className="users-table-you"> (você)</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={"role-badge" + (u.role === "master" ? " master" : "")}>
                        {u.role === "master" ? "Master" : "Membro"}
                      </span>
                    </td>
                    <td className="users-table-actions">
                      {u.role !== "master" && (
                        <>
                          <button
                            className="btn-ghost btn-small"
                            onClick={() => {
                              setResetTargetId(u.id);
                              setResetPasswordValue("");
                            }}
                          >
                            Redefinir senha
                          </button>
                          <button className="btn-danger btn-small" onClick={() => handleDelete(u)}>
                            Excluir
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {resetTargetId && (
            <form className="users-reset-form" onSubmit={handleResetSubmit}>
              <label className="auth-field">
                <span>Nova senha para {users.find((u) => u.id === resetTargetId)?.name}</span>
                <input
                  type="password"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  minLength={6}
                  required
                  autoFocus
                />
              </label>
              <div className="composer-actions">
                <button type="submit" className="btn-primary btn-small">
                  Salvar nova senha
                </button>
                <button type="button" className="btn-cancel" onClick={() => setResetTargetId(null)}>
                  &times;
                </button>
              </div>
            </form>
          )}

          <div className="sidebar-divider" />

          {showCreate ? (
            <form className="users-create-form" onSubmit={handleCreate}>
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
              {error && <div className="auth-error">{error}</div>}
              <div className="composer-actions">
                <button type="submit" className="btn-primary btn-small" disabled={submitting}>
                  {submitting ? "Criando..." : "Criar usuário"}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowCreate(false)}>
                  &times;
                </button>
              </div>
            </form>
          ) : (
            <button className="btn-primary btn-small" onClick={() => setShowCreate(true)}>
              + Novo usuário
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
