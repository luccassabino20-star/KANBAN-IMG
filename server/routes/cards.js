import { Router } from "express";
import { requireAuth, requireBoardAccessParam } from "../middleware.js";
import * as repo from "../repo.js";

const router = Router();
router.use(requireAuth);
router.param("id", requireBoardAccessParam(repo.getBoardIdForCard));

router.patch("/:id", (req, res) => {
  repo.updateCard(req.params.id, req.body || {});
  res.json({ ok: true });
});

router.delete("/:id", (req, res) => {
  repo.deleteCard(req.params.id);
  res.json({ ok: true });
});

export default router;
