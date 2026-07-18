import crypto from "node:crypto";
import { pool } from "./db.js";

export function uid() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

async function q(text, params) {
  return pool.query(text, params);
}

// ---------- Users ----------
export async function countUsers() {
  const { rows } = await q("SELECT COUNT(*) as c FROM users");
  return parseInt(rows[0].c, 10);
}
export async function getUserById(id) {
  const { rows } = await q("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] || null;
}
export async function getUserByEmail(email) {
  const { rows } = await q("SELECT * FROM users WHERE email = $1", [(email || "").toLowerCase()]);
  return rows[0] || null;
}
export async function listUsers() {
  const { rows } = await q("SELECT * FROM users ORDER BY created_at ASC");
  return rows;
}
export async function insertUser({ id, name, email, passwordHash, role }) {
  const userId = id || uid();
  await q(
    "INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
    [userId, name, email.toLowerCase(), passwordHash, role, nowIso()]
  );
  return getUserById(userId);
}
export async function updateUser(id, { name, email }) {
  const user = await getUserById(id);
  if (!user) return null;
  await q("UPDATE users SET name = $1, email = $2 WHERE id = $3", [
    name ?? user.name,
    (email ?? user.email).toLowerCase(),
    id,
  ]);
  return getUserById(id);
}
export async function setPassword(id, passwordHash) {
  await q("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, id]);
}
export async function deleteUser(id) {
  await q("DELETE FROM users WHERE id = $1", [id]);
}
export async function deletePrivateBoardsByOwner(userId) {
  await q("DELETE FROM boards WHERE owner_id = $1 AND visibility = 'private'", [userId]);
}
export function publicUser(u) {
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.created_at };
}
export async function scrubUserFromCards(userId) {
  const { rows } = await q("SELECT id, member_ids FROM cards");
  for (const row of rows) {
    let ids;
    try {
      ids = JSON.parse(row.member_ids);
    } catch {
      ids = [];
    }
    if (ids.includes(userId)) {
      await q("UPDATE cards SET member_ids = $1 WHERE id = $2", [
        JSON.stringify(ids.filter((x) => x !== userId)),
        row.id,
      ]);
    }
  }
}

// ---------- Boards / Lists / Cards ----------
async function nextPosition(table, whereCol, whereVal) {
  const { rows } =
    whereVal === undefined
      ? await q(`SELECT COALESCE(MAX(position), -1) as m FROM ${table}`)
      : await q(`SELECT COALESCE(MAX(position), -1) as m FROM ${table} WHERE ${whereCol} = $1`, [whereVal]);
  return rows[0].m + 1;
}

export async function createBoard({ id, title, ownerId, visibility }) {
  const boardId = id || uid();
  const pos = await nextPosition("boards");
  await q(
    "INSERT INTO boards (id, title, owner_id, visibility, position, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
    [boardId, title, ownerId || null, visibility === "private" ? "private" : "shared", pos, nowIso()]
  );
  return boardId;
}
export async function renameBoard(id, title) {
  await q("UPDATE boards SET title = $1 WHERE id = $2", [title, id]);
}
export async function setBoardBackground(id, background) {
  await q("UPDATE boards SET background = $1 WHERE id = $2", [background || null, id]);
}
export async function deleteBoard(id) {
  await q("DELETE FROM boards WHERE id = $1", [id]);
}
export async function clearBoard(id) {
  await q("DELETE FROM lists WHERE board_id = $1", [id]);
}
export async function getBoardAccessInfo(boardId) {
  const { rows } = await q("SELECT owner_id, visibility FROM boards WHERE id = $1", [boardId]);
  const row = rows[0];
  if (!row) return null;
  return { ownerId: row.owner_id, visibility: row.visibility };
}
export async function getBoardIdForList(listId) {
  const { rows } = await q("SELECT board_id FROM lists WHERE id = $1", [listId]);
  return rows[0] ? rows[0].board_id : null;
}
export async function getBoardIdForCard(cardId) {
  const { rows } = await q(
    "SELECT l.board_id as board_id FROM cards c JOIN lists l ON l.id = c.list_id WHERE c.id = $1",
    [cardId]
  );
  return rows[0] ? rows[0].board_id : null;
}
export async function boardExists(id) {
  const { rows } = await q("SELECT 1 FROM boards WHERE id = $1", [id]);
  return rows.length > 0;
}

export async function createList(boardId, { id, title }) {
  const listId = id || uid();
  const pos = await nextPosition("lists", "board_id", boardId);
  await q("INSERT INTO lists (id, board_id, title, position) VALUES ($1, $2, $3, $4)", [listId, boardId, title, pos]);
  return listId;
}
export async function renameList(id, title) {
  await q("UPDATE lists SET title = $1 WHERE id = $2", [title, id]);
}
export async function setListColor(id, color) {
  await q("UPDATE lists SET color = $1 WHERE id = $2", [color || null, id]);
}
export async function deleteList(id) {
  await q("DELETE FROM lists WHERE id = $1", [id]);
}
export async function setListOrder(orderedListIds) {
  for (let idx = 0; idx < orderedListIds.length; idx++) {
    await q("UPDATE lists SET position = $1 WHERE id = $2", [idx, orderedListIds[idx]]);
  }
}
export async function clearListCards(listId) {
  await q("DELETE FROM cards WHERE list_id = $1", [listId]);
}
export async function listExists(id) {
  const { rows } = await q("SELECT 1 FROM lists WHERE id = $1", [id]);
  return rows.length > 0;
}

export async function createCard(listId, { id, title }) {
  const cardId = id || uid();
  const pos = await nextPosition("cards", "list_id", listId);
  await q(
    "INSERT INTO cards (id, list_id, title, description, labels, due, checklist, member_ids, position) VALUES ($1, $2, $3, '', '[]', NULL, '[]', '[]', $4)",
    [cardId, listId, title, pos]
  );
  return cardId;
}
export async function deleteCard(id) {
  await q("DELETE FROM cards WHERE id = $1", [id]);
}
export async function updateCard(id, patch) {
  const { rows } = await q("SELECT * FROM cards WHERE id = $1", [id]);
  const row = rows[0];
  if (!row) return;
  const next = {
    title: patch.title ?? row.title,
    description: patch.description ?? row.description,
    labels: patch.labels ? JSON.stringify(patch.labels) : row.labels,
    due: patch.due !== undefined ? patch.due : row.due,
    start_date: patch.startDate !== undefined ? patch.startDate : row.start_date,
    location: patch.location !== undefined ? (patch.location ? JSON.stringify(patch.location) : null) : row.location,
    checklist: patch.checklist ? JSON.stringify(patch.checklist) : row.checklist,
    member_ids: patch.memberIds ? JSON.stringify(patch.memberIds) : row.member_ids,
    completed: patch.completed !== undefined ? (patch.completed ? 1 : 0) : row.completed,
    urgent: patch.urgent !== undefined ? (patch.urgent ? 1 : 0) : row.urgent,
    important: patch.important !== undefined ? (patch.important ? 1 : 0) : row.important,
  };
  await q(
    "UPDATE cards SET title=$1, description=$2, labels=$3, due=$4, start_date=$5, location=$6, checklist=$7, member_ids=$8, completed=$9, urgent=$10, important=$11 WHERE id=$12",
    [
      next.title,
      next.description,
      next.labels,
      next.due,
      next.start_date,
      next.location,
      next.checklist,
      next.member_ids,
      next.completed,
      next.urgent,
      next.important,
      id,
    ]
  );
}
export async function setCardOrder(listId, cardIds) {
  for (let idx = 0; idx < cardIds.length; idx++) {
    await q("UPDATE cards SET list_id = $1, position = $2 WHERE id = $3", [listId, idx, cardIds[idx]]);
  }
}

// ---------- Meeting Minutes (Atas) ----------
function publicMinute(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    authorId: row.author_id,
    attendeeIds: JSON.parse(row.attendee_ids || "[]"),
    agenda: row.agenda || "",
    decisions: row.decisions || "",
    actionItems: JSON.parse(row.action_items || "[]"),
    createdAt: row.created_at,
  };
}
export async function listMinutes() {
  const { rows } = await q("SELECT * FROM minutes ORDER BY date DESC, created_at DESC");
  return rows.map(publicMinute);
}
export async function getMinuteById(id) {
  const { rows } = await q("SELECT * FROM minutes WHERE id = $1", [id]);
  return rows[0] ? publicMinute(rows[0]) : null;
}
export async function getMinuteAuthorId(id) {
  const { rows } = await q("SELECT author_id FROM minutes WHERE id = $1", [id]);
  return rows[0] ? rows[0].author_id : null;
}
export async function createMinute({ id, title, date, authorId, attendeeIds, agenda, decisions, actionItems }) {
  const minuteId = id || uid();
  await q(
    "INSERT INTO minutes (id, title, date, author_id, attendee_ids, agenda, decisions, action_items, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
    [
      minuteId,
      title,
      date,
      authorId || null,
      JSON.stringify(attendeeIds || []),
      agenda || "",
      decisions || "",
      JSON.stringify(actionItems || []),
      nowIso(),
    ]
  );
  return minuteId;
}
export async function updateMinute(id, patch) {
  const { rows } = await q("SELECT * FROM minutes WHERE id = $1", [id]);
  const row = rows[0];
  if (!row) return;
  const next = {
    title: patch.title ?? row.title,
    date: patch.date ?? row.date,
    attendee_ids: patch.attendeeIds ? JSON.stringify(patch.attendeeIds) : row.attendee_ids,
    agenda: patch.agenda !== undefined ? patch.agenda : row.agenda,
    decisions: patch.decisions !== undefined ? patch.decisions : row.decisions,
    action_items: patch.actionItems ? JSON.stringify(patch.actionItems) : row.action_items,
  };
  await q("UPDATE minutes SET title=$1, date=$2, attendee_ids=$3, agenda=$4, decisions=$5, action_items=$6 WHERE id=$7", [
    next.title,
    next.date,
    next.attendee_ids,
    next.agenda,
    next.decisions,
    next.action_items,
    id,
  ]);
}
export async function deleteMinute(id) {
  await q("DELETE FROM minutes WHERE id = $1", [id]);
}

export async function getWorkspace(userId) {
  const { rows: boards } = await q(
    "SELECT * FROM boards WHERE visibility = 'shared' OR owner_id = $1 ORDER BY position ASC",
    [userId]
  );
  const { rows: lists } = await q("SELECT * FROM lists ORDER BY position ASC");
  const { rows: cards } = await q("SELECT * FROM cards ORDER BY position ASC");

  return boards.map((b) => {
    const boardLists = lists.filter((l) => l.board_id === b.id);
    const cardsObj = {};
    boardLists.forEach((l) => {
      cards
        .filter((c) => c.list_id === l.id)
        .forEach((c) => {
          cardsObj[c.id] = {
            id: c.id,
            title: c.title,
            description: c.description,
            labels: JSON.parse(c.labels || "[]"),
            due: c.due || null,
            startDate: c.start_date || null,
            location: c.location ? JSON.parse(c.location) : null,
            checklist: JSON.parse(c.checklist || "[]"),
            memberIds: JSON.parse(c.member_ids || "[]"),
            completed: !!c.completed,
            urgent: !!c.urgent,
            important: !!c.important,
          };
        });
    });
    return {
      id: b.id,
      title: b.title,
      background: b.background || null,
      ownerId: b.owner_id || null,
      visibility: b.visibility || "shared",
      lists: boardLists.map((l) => ({
        id: l.id,
        title: l.title,
        color: l.color || null,
        cardIds: cards.filter((c) => c.list_id === l.id).map((c) => c.id),
      })),
      cards: cardsObj,
    };
  });
}
