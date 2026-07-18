import { Router } from "express";
import { hashPassword, verifyPassword, signToken, verifyToken, COOKIE_NAME } from "../auth.js";
import { requireAuth } from "../middleware.js";
import { ah } from "../asyncHandler.js";
import {
  countUsers,
  getUserByEmail,
  getUserById,
  insertUser,
  publicUser,
  setPassword,
  createBoard,
  createList,
  createCard,
  updateCard,
} from "../repo.js";

const router = Router();

const CROSS_SITE = Boolean(process.env.FRONTEND_URL);
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: CROSS_SITE ? "none" : "lax",
  secure: CROSS_SITE,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function setAuthCookie(res, user) {
  res.cookie(COOKIE_NAME, signToken(user), COOKIE_OPTS);
}

function validateCredentials(name, email, password) {
  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return "Preencha nome, e-mail e uma senha com pelo menos 6 caracteres";
  }
  return null;
}

router.get(
  "/status",
  ah(async (req, res) => {
    res.json({ needsSetup: (await countUsers()) === 0 });
  })
);

router.get(
  "/me",
  ah(async (req, res) => {
    const token = req.cookies?.[COOKIE_NAME];
    const payload = token && verifyToken(token);
    const user = payload && (await getUserById(payload.sub));
    if (!user) return res.status(401).json({ error: "Não autenticado" });
    res.json(publicUser(user));
  })
);

router.post(
  "/setup",
  ah(async (req, res) => {
    if ((await countUsers()) > 0) return res.status(400).json({ error: "Configuração já concluída" });
    const { name, email, password } = req.body || {};
    const validationError = validateCredentials(name, email, password);
    if (validationError) return res.status(400).json({ error: validationError });
    if (await getUserByEmail(email)) return res.status(409).json({ error: "E-mail já cadastrado" });

    const user = await insertUser({
      name: name.trim(),
      email: email.trim(),
      passwordHash: hashPassword(password),
      role: "master",
    });

    const boardId = await createBoard({ title: "Meu Quadro" });
    const listTodo = await createList(boardId, { title: "A Fazer" });
    const listDoing = await createList(boardId, { title: "Em Andamento" });
    await createList(boardId, { title: "Concluído" });
    const c1 = await createCard(listTodo, { title: "Bem-vindo ao seu quadro Kanban 👋" });
    await updateCard(c1, {
      description: "Clique em um cartão para editar detalhes, etiquetas, membros, datas e checklists.",
      labels: ["blue"],
    });
    await createCard(listTodo, { title: "Arraste os cartões entre as listas" });
    await createCard(listDoing, { title: "Convide sua equipe no painel de Usuários" });

    setAuthCookie(res, user);
    res.status(201).json(publicUser(user));
  })
);

router.post(
  "/register",
  ah(async (req, res) => {
    if ((await countUsers()) === 0) return res.status(400).json({ error: "Conclua a configuração inicial primeiro" });
    const { name, email, password } = req.body || {};
    const validationError = validateCredentials(name, email, password);
    if (validationError) return res.status(400).json({ error: validationError });
    if (await getUserByEmail(email)) return res.status(409).json({ error: "E-mail já cadastrado" });

    const user = await insertUser({
      name: name.trim(),
      email: email.trim(),
      passwordHash: hashPassword(password),
      role: "member",
    });
    setAuthCookie(res, user);
    res.status(201).json(publicUser(user));
  })
);

router.post(
  "/login",
  ah(async (req, res) => {
    const { email, password } = req.body || {};
    const user = email && (await getUserByEmail(email));
    if (!user || !verifyPassword(password || "", user.password_hash)) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }
    setAuthCookie(res, user);
    res.json(publicUser(user));
  })
);

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

router.post(
  "/change-password",
  requireAuth,
  ah(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "A nova senha deve ter ao menos 6 caracteres" });
    }
    if (!verifyPassword(currentPassword || "", req.user.password_hash)) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }
    await setPassword(req.user.id, hashPassword(newPassword));
    res.json({ ok: true });
  })
);

export { router };
