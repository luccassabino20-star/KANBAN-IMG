import { Router } from "express";
import { requireAuth } from "../middleware.js";
import * as repo from "../repo.js";

const router = Router();
router.use(requireAuth);

function canEdit(req, minuteId) {
  if (req.user.role === "master") return true;
  return repo.getMinuteAuthorId(minuteId) === req.user.id;
}

router.get("/", (req, res) => {
  res.json(repo.listMinutes());
});

router.post("/", (req, res) => {
  const { title, date, attendeeIds, agenda, decisions, actionItems } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: "Título obrigatório" });
  const id = repo.createMinute({
    title: title.trim(),
    date: date || new Date().toISOString().slice(0, 10),
    authorId: req.user.id,
    attendeeIds,
    agenda,
    decisions,
    actionItems,
  });
  res.status(201).json(repo.getMinuteById(id));
});

router.patch("/:id", (req, res) => {
  if (!repo.getMinuteById(req.params.id)) return res.status(404).json({ error: "Ata não encontrada" });
  if (!canEdit(req, req.params.id)) return res.status(403).json({ error: "Apenas o autor ou o usuário master pode editar esta ata" });
  const { title, date, attendeeIds, agenda, decisions, actionItems } = req.body || {};
  repo.updateMinute(req.params.id, {
    title: title !== undefined ? title.trim() || "Sem título" : undefined,
    date,
    attendeeIds,
    agenda,
    decisions,
    actionItems,
  });
  res.json({ ok: true });
});

router.delete("/:id", (req, res) => {
  if (!repo.getMinuteById(req.params.id)) return res.status(404).json({ error: "Ata não encontrada" });
  if (!canEdit(req, req.params.id)) return res.status(403).json({ error: "Apenas o autor ou o usuário master pode excluir esta ata" });
  repo.deleteMinute(req.params.id);
  res.json({ ok: true });
});

export default router;
