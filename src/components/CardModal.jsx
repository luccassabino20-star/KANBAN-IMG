import { useEffect, useRef, useState } from "react";
import { useBoardDispatch, useBoardState } from "../state/BoardContext.jsx";
import { useUsers } from "../state/UsersContext.jsx";
import { useToast } from "../state/ToastContext.jsx";
import { LABEL_COLORS } from "../utils/labels.js";
import { initials, colorForUser } from "../utils/members.js";
import { geocodeAddress } from "../state/api.js";

function UrgentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14">
      <path fill="currentColor" d="M5 3v18h2v-7h10.5l-2.5-4 2.5-4H7V3z" />
    </svg>
  );
}
function ImportantIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14">
      <path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13">
      <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

export default function CardModal({ boardId, cardId, onClose }) {
  const state = useBoardState();
  const dispatch = useBoardDispatch();
  const { users } = useUsers();
  const showToast = useToast();
  const board = state.boards.find((b) => b.id === boardId);
  const card = board?.cards[cardId];

  const [title, setTitle] = useState(card?.title || "");
  const [description, setDescription] = useState(card?.description || "");
  const [checklistText, setChecklistText] = useState("");
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [addressInput, setAddressInput] = useState(card?.location?.address || "");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const titleRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  if (!card) return null;

  function commitTitle() {
    const val = title.trim() || "Sem título";
    dispatch({ type: "UPDATE_CARD", boardId, cardId, patch: { title: val } });
    setTitle(val);
  }
  function commitDescription() {
    dispatch({ type: "UPDATE_CARD", boardId, cardId, patch: { description } });
  }
  function handleDueChange(e) {
    dispatch({ type: "UPDATE_CARD", boardId, cardId, patch: { due: e.target.value || null } });
  }
  function handleStartDateChange(e) {
    dispatch({ type: "UPDATE_CARD", boardId, cardId, patch: { startDate: e.target.value || null } });
  }
  async function handleLocateAddress(e) {
    e.preventDefault();
    const q = addressInput.trim();
    if (!q) {
      dispatch({ type: "UPDATE_CARD", boardId, cardId, patch: { location: null } });
      return;
    }
    setGeocoding(true);
    setGeocodeError("");
    try {
      const result = await geocodeAddress(q);
      dispatch({
        type: "UPDATE_CARD",
        boardId,
        cardId,
        patch: { location: { address: q, lat: result.lat, lng: result.lng } },
      });
    } catch (err) {
      setGeocodeError(err.message);
      dispatch({ type: "UPDATE_CARD", boardId, cardId, patch: { location: { address: q, lat: null, lng: null } } });
    } finally {
      setGeocoding(false);
    }
  }
  function toggleCompleted() {
    dispatch({ type: "TOGGLE_CARD_COMPLETED", boardId, cardId });
  }
  function toggleUrgent() {
    dispatch({ type: "UPDATE_CARD", boardId, cardId, patch: { urgent: !card.urgent } });
  }
  function toggleImportant() {
    dispatch({ type: "UPDATE_CARD", boardId, cardId, patch: { important: !card.important } });
  }
  function toggleLabel(labelId) {
    dispatch({ type: "TOGGLE_CARD_LABEL", boardId, cardId, labelId });
  }
  function toggleMember(memberId) {
    dispatch({ type: "TOGGLE_CARD_MEMBER", boardId, cardId, memberId });
  }
  function addChecklistItem(e) {
    e.preventDefault();
    const val = checklistText.trim();
    if (!val) return;
    dispatch({ type: "ADD_CHECKLIST_ITEM", boardId, cardId, text: val });
    setChecklistText("");
  }
  function toggleChecklistItem(index) {
    dispatch({ type: "TOGGLE_CHECKLIST_ITEM", boardId, cardId, index });
  }
  function removeChecklistItem(index) {
    dispatch({ type: "REMOVE_CHECKLIST_ITEM", boardId, cardId, index });
  }
  function deleteCard() {
    if (!confirm("Excluir este cartão permanentemente?")) return;
    dispatch({ type: "DELETE_CARD", boardId, cardId });
    showToast("Cartão excluído");
    onClose();
  }

  const done = card.checklist.filter((i) => i.done).length;
  const pct = card.checklist.length ? Math.round((done / card.checklist.length) * 100) : 0;
  const cardMembers = (card.memberIds || []).map((id) => users.find((m) => m.id === id)).filter(Boolean);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          &times;
        </button>
        <div className="modal-header">
          <svg viewBox="0 0 24 24" width="20" height="20" className="modal-icon">
            <path fill="currentColor" d="M3 5h18v2H3zm0 6h18v2H3zm0 6h12v2H3z" />
          </svg>
          <input
            ref={titleRef}
            className="modal-title-input"
            value={title}
            spellCheck={false}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <button type="button" className={"card-complete-toggle-row" + (card.completed ? " checked" : "")} onClick={toggleCompleted}>
              <span className={"card-complete-check" + (card.completed ? " checked" : "")}>
                {card.completed && (
                  <svg viewBox="0 0 24 24" width="12" height="12">
                    <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                  </svg>
                )}
              </span>
              <span>{card.completed ? "Concluído" : "Marcar como concluído"}</span>
            </button>
          </div>

          <div className="modal-section">
            <label className="modal-label">Membros</label>
            <div className="member-avatars-row">
              {cardMembers.map((m) => (
                <span key={m.id} className="avatar" style={{ background: colorForUser(m.id) }} title={m.name}>
                  {initials(m.name)}
                </span>
              ))}
              <button type="button" className="avatar avatar-add" onClick={() => setMemberPickerOpen((o) => !o)}>
                +
              </button>
            </div>
            {memberPickerOpen && (
              <div className="member-picker">
                {users.length === 0 && <div className="member-picker-empty">Nenhum usuário cadastrado ainda.</div>}
                {users.map((m) => (
                  <label key={m.id} className="member-picker-row">
                    <input type="checkbox" checked={(card.memberIds || []).includes(m.id)} onChange={() => toggleMember(m.id)} />
                    <span className="avatar avatar-small" style={{ background: colorForUser(m.id) }}>
                      {initials(m.name)}
                    </span>
                    <span>{m.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="modal-section">
            <label className="modal-label">Etiquetas</label>
            <div className="label-picker">
              {LABEL_COLORS.map((meta) => (
                <button
                  key={meta.id}
                  type="button"
                  className={"label-chip" + (card.labels.includes(meta.id) ? " active" : "")}
                  style={{ background: meta.color }}
                  onClick={() => toggleLabel(meta.id)}
                >
                  {card.labels.includes(meta.id) ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <label className="modal-label">Prioridade (Matriz de Eisenhower)</label>
            <div className="priority-toggle-row">
              <button
                type="button"
                className={"priority-chip priority-chip-urgent" + (card.urgent ? " active" : "")}
                onClick={toggleUrgent}
              >
                <UrgentIcon /> Urgente
              </button>
              <button
                type="button"
                className={"priority-chip priority-chip-important" + (card.important ? " active" : "")}
                onClick={toggleImportant}
              >
                <ImportantIcon /> Importante
              </button>
            </div>
          </div>

          <div className="modal-section modal-section-row">
            <div>
              <label className="modal-label">Data de início</label>
              <input type="date" className="modal-date" value={card.startDate || ""} onChange={handleStartDateChange} />
            </div>
            <div>
              <label className="modal-label">Data de entrega</label>
              <input type="date" className="modal-date" value={card.due || ""} onChange={handleDueChange} />
            </div>
          </div>

          <div className="modal-section">
            <label className="modal-label">Local</label>
            <form className="location-form" onSubmit={handleLocateAddress}>
              <input
                type="text"
                className="modal-date location-input"
                placeholder="Endereço, cidade..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
              <button type="submit" className="btn-primary btn-small" disabled={geocoding}>
                {geocoding ? "Buscando..." : "Localizar"}
              </button>
            </form>
            {geocodeError && <div className="auth-error" style={{ marginTop: 8 }}>{geocodeError}</div>}
            {card.location?.lat != null && (
              <div className="location-confirmed">
                <PinIcon /> Localização encontrada — visível no Mapa
              </div>
            )}
            {card.location?.address && card.location?.lat == null && !geocoding && (
              <div className="location-pending">Endereço salvo, mas não localizado no mapa</div>
            )}
          </div>

          <div className="modal-section">
            <label className="modal-label">Descrição</label>
            <textarea
              className="modal-textarea"
              placeholder="Adicione uma descrição mais detalhada..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={commitDescription}
            />
          </div>

          <div className="modal-section">
            <label className="modal-label">Checklist</label>
            {card.checklist.length > 0 && (
              <div className="checklist-progress">
                <div className="checklist-progress-bar">
                  <div className="checklist-progress-fill" style={{ width: pct + "%" }} />
                </div>
                <span>{pct}%</span>
              </div>
            )}
            <ul className="checklist">
              {card.checklist.map((item, idx) => (
                <li key={idx} className={"checklist-item" + (item.done ? " done" : "")}>
                  <input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(idx)} />
                  <span>{item.text}</span>
                  <button type="button" className="checklist-item-remove" onClick={() => removeChecklistItem(idx)}>
                    &times;
                  </button>
                </li>
              ))}
            </ul>
            <form className="checklist-add" onSubmit={addChecklistItem}>
              <input
                type="text"
                placeholder="Adicionar um item"
                value={checklistText}
                onChange={(e) => setChecklistText(e.target.value)}
              />
              <button type="submit" className="btn-primary btn-small">
                Adicionar
              </button>
            </form>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-danger" onClick={deleteCard}>
            Excluir cartão
          </button>
        </div>
      </div>
    </div>
  );
}
