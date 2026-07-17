import { Router } from "express";
import { requireAuth, requireMaster } from "../middleware.js";
import { hashPassword } from "../auth.js";
import {
  listUsers,
  publicUser,
  getUserByEmail,
  getUserById,
  insertUser,
  updateUser,
  deleteUser,
  setPassword,
  scrubUserFromCards,
  deletePrivateBoardsByOwner,
} from "../repo.js";

const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(listUsers().map(publicUser));
});

router.post("/", requireMaster, (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return res.status(400).json({ error: "Preencha nome, e-mail e uma senha com pelo menos 6 caracteres" });
  }
  if (getUserByEmail(email)) return res.status(409).json({ error: "E-mail já cadastrado" });
  const user = insertUser({ name: name.trim(), email: email.trim(), passwordHash: hashPassword(password), role: "member" });
  res.status(201).json(publicUser(user));
});

router.patch("/:id", requireMaster, (req, res) => {
  const target = getUserById(req.params.id);
  if (!target) return res.status(404).json({ error: "Usuário não encontrado" });
  const { name, email } = req.body || {};
  if (email) {
    const existing = getUserByEmail(email);
    if (existing && existing.id !== target.id) return res.status(409).json({ error: "E-mail já em uso" });
  }
  const updated = updateUser(target.id, { name, email });
  res.json(publicUser(updated));
});

router.post("/:id/reset-password", requireMaster, (req, res) => {
  const target = getUserById(req.params.id);
  if (!target) return res.status(404).json({ error: "Usuário não encontrado" });
  const { newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "A nova senha deve ter ao menos 6 caracteres" });
  }
  setPassword(target.id, hashPassword(newPassword));
  res.json({ ok: true });
});

router.delete("/:id", requireMaster, (req, res) => {
  const target = getUserById(req.params.id);
  if (!target) return res.status(404).json({ error: "Usuário não encontrado" });
  if (target.role === "master") return res.status(400).json({ error: "Não é possível excluir o usuário master" });
  deletePrivateBoardsByOwner(target.id);
  deleteUser(target.id);
  scrubUserFromCards(target.id);
  res.json({ ok: true });
});

export default router;
