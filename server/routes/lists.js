import { Router } from "express";
import { requireAuth, requireBoardAccessParam } from "../middleware.js";
import * as repo from "../repo.js";

const router = Router();
router.use(requireAuth);
router.param("id", requireBoardAccessParam(repo.getBoardIdForList));

router.patch("/:id", (req, res) => {
  const { title, color } = req.body || {};
  if (title !== undefined) repo.renameList(req.params.id, title.trim() || "Lista");
  if (color !== undefined) repo.setListColor(req.params.id, color);
  res.json({ ok: true });
});

router.delete("/:id", (req, res) => {
  repo.deleteList(req.params.id);
  res.json({ ok: true });
});

router.post("/:id/clear", (req, res) => {
  repo.clearListCards(req.params.id);
  res.json({ ok: true });
});

router.put("/:id/card-order", (req, res) => {
  const { cardIds } = req.body || {};
  if (!Array.isArray(cardIds)) return res.status(400).json({ error: "cardIds obrigatório" });
  repo.setCardOrder(req.params.id, cardIds);
  res.json({ ok: true });
});

router.post("/:id/cards", (req, res) => {
  const { id, title } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: "Título obrigatório" });
  const cardId = repo.createCard(req.params.id, { id, title: title.trim() });
  res.status(201).json({ id: cardId });
});

export default router;
