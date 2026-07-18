import { Router } from "express";
import { requireAuth, requireMaster } from "../middleware.js";
import { hashPassword } from "../auth.js";
import { ah } from "../asyncHandler.js";
import {
  listUsers,
  publicUser,
  getUserByEmail,
  getUserById,
  insertUser,
  updateUser,
  deleteUser,
  setPassword,
  setUserRole,
  scrubUserFromCards,
  deletePrivateBoardsByOwner,
} from "../repo.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  ah(async (req, res) => {
    res.json((await listUsers()).map(publicUser));
  })
);

router.post(
  "/",
  requireMaster,
  ah(async (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return res.status(400).json({ error: "Preencha nome, e-mail e uma senha com pelo menos 6 caracteres" });
    }
    if (await getUserByEmail(email)) return res.status(409).json({ error: "E-mail já cadastrado" });
    const user = await insertUser({
      name: name.trim(),
      email: email.trim(),
      passwordHash: hashPassword(password),
      role: "member",
    });
    res.status(201).json(publicUser(user));
  })
);

router.patch(
  "/:id",
  requireMaster,
  ah(async (req, res) => {
    const target = await getUserById(req.params.id);
    if (!target) return res.status(404).json({ error: "Usuário não encontrado" });
    const { name, email } = req.body || {};
    if (email) {
      const existing = await getUserByEmail(email);
      if (existing && existing.id !== target.id) return res.status(409).json({ error: "E-mail já em uso" });
    }
    const updated = await updateUser(target.id, { name, email });
    res.json(publicUser(updated));
  })
);

router.post(
  "/:id/role",
  requireMaster,
  ah(async (req, res) => {
    const target = await getUserById(req.params.id);
    if (!target) return res.status(404).json({ error: "Usuário não encontrado" });
    const { role } = req.body || {};
    if (role !== "master" && role !== "member") {
      return res.status(400).json({ error: "Papel inválido" });
    }
    const updated = await setUserRole(target.id, role);
    res.json(publicUser(updated));
  })
);

router.post(
  "/:id/reset-password",
  requireMaster,
  ah(async (req, res) => {
    const target = await getUserById(req.params.id);
    if (!target) return res.status(404).json({ error: "Usuário não encontrado" });
    const { newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "A nova senha deve ter ao menos 6 caracteres" });
    }
    await setPassword(target.id, hashPassword(newPassword));
    res.json({ ok: true });
  })
);

router.delete(
  "/:id",
  requireMaster,
  ah(async (req, res) => {
    const target = await getUserById(req.params.id);
    if (!target) return res.status(404).json({ error: "Usuário não encontrado" });
    if (target.role === "master") return res.status(400).json({ error: "Não é possível excluir o usuário master" });
    await deletePrivateBoardsByOwner(target.id);
    await deleteUser(target.id);
    await scrubUserFromCards(target.id);
    res.json({ ok: true });
  })
);

export { router };
