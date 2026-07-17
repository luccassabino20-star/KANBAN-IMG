import { Router } from "express";
import { requireAuth, requireBoardAccess } from "../middleware.js";
import * as repo from "../repo.js";

const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  res.json({ boards: repo.getWorkspace(req.user.id) });
});

router.post("/", (req, res) => {
  const { id, title, visibility } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: "Título obrigatório" });
  const boardId = repo.createBoard({ id, title: title.trim(), ownerId: req.user.id, visibility });
  res.status(201).json({ id: boardId });
});

router.patch("/:id", requireBoardAccess((req) => req.params.id), (req, res) => {
  const { title, background } = req.body || {};
  if (title !== undefined) repo.renameBoard(req.params.id, title.trim() || "Quadro");
  if (background !== undefined) repo.setBoardBackground(req.params.id, background);
  res.json({ ok: true });
});

router.delete("/:id", requireBoardAccess((req) => req.params.id), (req, res) => {
  const access = repo.getBoardAccessInfo(req.params.id);
  if (access.visibility !== "private" && req.user.role !== "master") {
    return res.status(403).json({ error: "Apenas o usuário master pode excluir quadros compartilhados" });
  }
  repo.deleteBoard(req.params.id);
  res.json({ ok: true });
});

router.post("/:id/clear", requireBoardAccess((req) => req.params.id), (req, res) => {
  repo.clearBoard(req.params.id);
  res.json({ ok: true });
});

router.post("/:boardId/lists", requireBoardAccess((req) => req.params.boardId), (req, res) => {
  const { id, title } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: "Título obrigatório" });
  const listId = repo.createList(req.params.boardId, { id, title: title.trim() });
  res.status(201).json({ id: listId });
});

router.put("/:boardId/list-order", requireBoardAccess((req) => req.params.boardId), (req, res) => {
  const { orderedListIds } = req.body || {};
  if (!Array.isArray(orderedListIds)) return res.status(400).json({ error: "orderedListIds obrigatório" });
  repo.setListOrder(orderedListIds);
  res.json({ ok: true });
});

export default router;
