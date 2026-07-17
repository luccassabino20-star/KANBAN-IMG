import { useState } from "react";
import { useMinutes } from "../state/MinutesContext.jsx";
import { useUsers } from "../state/UsersContext.jsx";
import { initials, colorForUser } from "../utils/members.js";
import MinuteModal from "../components/MinuteModal.jsx";

function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function MinutesScreen({ onToggleSidebar }) {
  const { minutes, loading } = useMinutes();
  const { users } = useUsers();
  const [openId, setOpenId] = useState(undefined); // undefined = closed, null = new, string = editing

  function authorName(authorId) {
    return users.find((u) => u.id === authorId)?.name || "—";
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-btn" onClick={onToggleSidebar} title="Mostrar/ocultar barra lateral" aria-label="Menu">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
            </svg>
          </button>
          <span className="board-title minutes-screen-title">Atas de Reunião</span>
        </div>
        <div className="topbar-right">
          <button className="btn-primary" onClick={() => setOpenId(null)}>
            + Nova ata
          </button>
        </div>
      </header>

      <div className="view-scroll minutes-scroll">
        {loading && <div className="empty-state">Carregando atas...</div>}
        {!loading && minutes.length === 0 && <div className="empty-state">Nenhuma ata registrada ainda.</div>}
        {!loading && minutes.length > 0 && (
          <div className="minutes-list">
            {minutes.map((m) => (
              <button key={m.id} className="minutes-row" onClick={() => setOpenId(m.id)}>
                <span className="minutes-row-date">{formatDate(m.date)}</span>
                <span className="minutes-row-title">{m.title}</span>
                <span className="minutes-row-author">
                  <span className="avatar avatar-small" style={{ background: colorForUser(m.authorId) }}>
                    {initials(authorName(m.authorId))}
                  </span>
                  {authorName(m.authorId)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {openId !== undefined && <MinuteModal minuteId={openId} onClose={() => setOpenId(undefined)} />}
    </>
  );
}
