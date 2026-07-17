import { useEffect, useState } from "react";
import { useBoardDispatch } from "../state/BoardContext.jsx";
import { useUsers } from "../state/UsersContext.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { useToast } from "../state/ToastContext.jsx";
import { initials, colorForUser } from "../utils/members.js";
import AccountMenu from "./AccountMenu.jsx";
import UsersPanel from "./UsersPanel.jsx";
import BoardBackgroundMenu from "./BoardBackgroundMenu.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function TopBar({ board, onToggleSidebar, searchQuery, onSearchChange, memberFilter, onFilterChange }) {
  const dispatch = useBoardDispatch();
  const { users } = useUsers();
  const { user } = useAuth();
  const showToast = useToast();
  const [title, setTitle] = useState(board?.title || "");
  const [usersPanelOpen, setUsersPanelOpen] = useState(false);

  useEffect(() => {
    setTitle(board?.title || "");
  }, [board?.id, board?.title]);

  function commitTitle() {
    if (!board) return;
    const val = title.trim() || "Quadro sem nome";
    dispatch({ type: "RENAME_BOARD", boardId: board.id, title: val });
    setTitle(val);
  }

  function clearBoard() {
    if (!board) return;
    if (confirm("Isso vai apagar todas as listas e cartões deste quadro. Continuar?")) {
      dispatch({ type: "CLEAR_BOARD", boardId: board.id });
      showToast("Quadro limpo");
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn" onClick={onToggleSidebar} title="Mostrar/ocultar barra lateral" aria-label="Menu">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
          </svg>
        </button>
        {board && (
          <>
            <input
              className="board-title"
              value={title}
              spellCheck={false}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
            {board.visibility === "private" && (
              <span className="board-title-lock" title="Quadro privado — visível só para você">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path fill="currentColor" d="M12 2a4 4 0 0 1 4 4v3h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v3h4V6a2 2 0 0 0-2-2z" />
                </svg>
              </span>
            )}
          </>
        )}
      </div>
      <div className="topbar-right">
        {users.length > 0 && (
          <div className="topbar-members">
            {users.slice(0, 6).map((m) => (
              <button
                key={m.id}
                className={"avatar avatar-small topbar-avatar" + (memberFilter === m.id ? " active" : "")}
                style={{ background: colorForUser(m.id) }}
                title={`Filtrar por ${m.name}`}
                onClick={() => onFilterChange(memberFilter === m.id ? null : m.id)}
              >
                {initials(m.name)}
              </button>
            ))}
          </div>
        )}
        {user?.role === "master" && (
          <button className="btn-ghost" onClick={() => setUsersPanelOpen(true)}>
            Usuários
          </button>
        )}
        <div className="search-box">
          <svg viewBox="0 0 24 24" width="15" height="15">
            <path
              fill="currentColor"
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14"
            />
          </svg>
          <input type="text" placeholder="Buscar cartões..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
        </div>
        {board && <BoardBackgroundMenu board={board} />}
        <button className="btn-ghost" onClick={clearBoard} disabled={!board}>
          Limpar quadro
        </button>
        <ThemeToggle />
        <AccountMenu />
      </div>
      {usersPanelOpen && <UsersPanel onClose={() => setUsersPanelOpen(false)} />}
    </header>
  );
}
