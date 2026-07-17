import { useRef, useState } from "react";
import { useBoardDispatch, useBoardState, useBoardRefetch } from "../state/BoardContext.jsx";
import { useUsers } from "../state/UsersContext.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { useToast } from "../state/ToastContext.jsx";
import { uid } from "../utils/id.js";
import { exportAll, exportBoard, parseImportFile } from "../utils/importExport.js";
import * as api from "../state/api.js";

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" className="board-lock-icon">
      <path fill="currentColor" d="M12 2a4 4 0 0 1 4 4v3h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v3h4V6a2 2 0 0 0-2-2z" />
    </svg>
  );
}
function NotesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15">
      <path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z" />
    </svg>
  );
}

export default function Sidebar({ collapsed, activeBoardId, onSelectBoard, screen, onOpenMinutes }) {
  const state = useBoardState();
  const dispatch = useBoardDispatch();
  const refetchBoards = useBoardRefetch();
  const { users } = useUsers();
  const { user } = useAuth();
  const showToast = useToast();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrivate, setNewPrivate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const sharedBoards = state.boards.filter((b) => b.visibility !== "private");
  const privateBoards = state.boards.filter((b) => b.visibility === "private");

  function addBoard() {
    const title = newTitle.trim();
    if (!title) {
      setAdding(false);
      return;
    }
    const id = uid();
    dispatch({ type: "ADD_BOARD", id, title, ownerId: user.id, visibility: newPrivate ? "private" : "shared" });
    onSelectBoard(id);
    setNewTitle("");
    setNewPrivate(false);
    setAdding(false);
  }

  function startRename(board) {
    setEditingId(board.id);
    setEditingTitle(board.title);
  }
  function commitRename(board) {
    const title = editingTitle.trim() || board.title;
    dispatch({ type: "RENAME_BOARD", boardId: board.id, title });
    setEditingId(null);
  }
  function deleteBoard(board) {
    if (!confirm(`Excluir o quadro "${board.title}" e todo o seu conteúdo?`)) return;
    dispatch({ type: "DELETE_BOARD", boardId: board.id });
    showToast("Quadro excluído");
  }

  function handleExportCurrent() {
    const board = state.boards.find((b) => b.id === activeBoardId);
    if (!board) return;
    exportBoard(board, users);
    showToast("Quadro exportado");
  }
  function handleExportAll() {
    exportAll(state, users);
    showToast("Backup completo exportado");
  }
  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const parsed = await parseImportFile(file);
      let lastBoardId = null;
      for (const b of parsed.boards) {
        const created = await api.createBoard({ title: b.title || "Quadro importado" });
        lastBoardId = created.id;
        for (const l of b.lists || []) {
          const listCreated = await api.createList(created.id, { title: l.title || "Lista" });
          const cardsById = b.cards || {};
          for (const cardId of l.cardIds || []) {
            const c = cardsById[cardId];
            if (!c) continue;
            const cardCreated = await api.createCard(listCreated.id, { title: c.title || "Sem título" });
            const memberIds = (c.memberIds || []).filter((oldId) => users.some((u) => u.id === oldId));
            await api.updateCard(cardCreated.id, {
              description: c.description || "",
              labels: c.labels || [],
              due: c.due || null,
              checklist: c.checklist || [],
              memberIds,
            });
          }
        }
      }
      await refetchBoards();
      if (lastBoardId) onSelectBoard(lastBoardId);
      showToast("Importação concluída");
    } catch (err) {
      alert("Falha ao importar: " + err.message);
    } finally {
      setImporting(false);
    }
  }

  function renderBoardItem(b) {
    const canDelete = b.visibility === "private" || user.role === "master";
    return (
      <div key={b.id} className={"board-list-item" + (screen === "board" && b.id === activeBoardId ? " active" : "")}>
        {editingId === b.id ? (
          <input
            className="board-rename-input"
            autoFocus
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={() => commitRename(b)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename(b);
              if (e.key === "Escape") setEditingId(null);
            }}
          />
        ) : (
          <button className="board-list-btn" onClick={() => onSelectBoard(b.id)} onDoubleClick={() => startRename(b)}>
            <span className="board-swatch" />
            <span className="board-list-title">{b.title}</span>
            {b.visibility === "private" && <LockIcon />}
          </button>
        )}
        {canDelete && (
          <button className="board-list-delete" title="Excluir quadro" onClick={() => deleteBoard(b)}>
            &times;
          </button>
        )}
      </div>
    );
  }

  return (
    <aside className={"sidebar" + (collapsed ? " collapsed" : "")}>
      <button className={"sidebar-minutes-nav" + (screen === "minutes" ? " active" : "")} onClick={onOpenMinutes}>
        <span className="sidebar-minutes-nav-icon"><NotesIcon /></span>
        Atas de Reunião
      </button>
      <div className="sidebar-divider" />

      <div className="sidebar-header">Quadros compartilhados</div>
      <div className="board-list">{sharedBoards.map(renderBoardItem)}</div>

      {privateBoards.length > 0 && (
        <>
          <div className="sidebar-header sidebar-header-secondary">
            <LockIcon /> Meus quadros privados
          </div>
          <div className="board-list">{privateBoards.map(renderBoardItem)}</div>
        </>
      )}

      {adding ? (
        <div className="board-add-form">
          <input
            autoFocus
            placeholder="Nome do quadro"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addBoard();
              if (e.key === "Escape") {
                setAdding(false);
                setNewTitle("");
              }
            }}
          />
          <label className="board-add-private-toggle">
            <input type="checkbox" checked={newPrivate} onChange={(e) => setNewPrivate(e.target.checked)} />
            <LockIcon />
            <span>Privado (só você vê)</span>
          </label>
          <div className="composer-actions">
            <button className="btn-primary btn-small" onClick={addBoard}>
              Criar
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setAdding(false);
                setNewTitle("");
                setNewPrivate(false);
              }}
            >
              &times;
            </button>
          </div>
        </div>
      ) : (
        <button className="sidebar-add-board" onClick={() => setAdding(true)}>
          + Novo quadro
        </button>
      )}

      <div className="sidebar-divider" />
      <div className="sidebar-section-label">Dados</div>
      <button className="sidebar-action" onClick={handleExportCurrent}>
        Exportar quadro atual
      </button>
      <button className="sidebar-action" onClick={handleExportAll}>
        Exportar tudo (backup)
      </button>
      <button className="sidebar-action" onClick={handleImportClick} disabled={importing}>
        {importing ? "Importando..." : "Importar JSON"}
      </button>
      <input type="file" accept="application/json" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
    </aside>
  );
}
