import { verifyToken, COOKIE_NAME } from "./auth.js";
import { getUserById, getBoardAccessInfo } from "./repo.js";

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  const payload = token && verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Não autenticado" });
  const user = getUserById(payload.sub);
  if (!user) return res.status(401).json({ error: "Não autenticado" });
  req.user = user;
  next();
}

export function requireMaster(req, res, next) {
  if (req.user?.role !== "master") return res.status(403).json({ error: "Acesso restrito ao usuário master" });
  next();
}

export function hasBoardAccess(user, access) {
  if (!access) return false;
  if (access.visibility !== "private") return true;
  return access.ownerId === user.id;
}

// getBoardId(req) resolves the board id to check from the request (directly or via a list/card lookup).
// Use as a route-specific middleware argument: router.patch("/:id", requireBoardAccess(req => req.params.id), handler)
export function requireBoardAccess(getBoardId) {
  return (req, res, next) => {
    const boardId = getBoardId(req);
    if (!boardId) return res.status(404).json({ error: "Quadro não encontrado" });
    const access = getBoardAccessInfo(boardId);
    if (!access) return res.status(404).json({ error: "Quadro não encontrado" });
    if (!hasBoardAccess(req.user, access)) return res.status(403).json({ error: "Você não tem acesso a este quadro" });
    next();
  };
}

// resolveBoardId(paramValue) resolves the board id from a route param (e.g. a list or card id).
// Use with router.param("id", requireBoardAccessParam(repo.getBoardIdForList)) so it applies to every route in the router.
export function requireBoardAccessParam(resolveBoardId) {
  return (req, res, next, value) => {
    const boardId = resolveBoardId(value);
    if (!boardId) return res.status(404).json({ error: "Não encontrado" });
    const access = getBoardAccessInfo(boardId);
    if (!access) return res.status(404).json({ error: "Quadro não encontrado" });
    if (!hasBoardAccess(req.user, access)) return res.status(403).json({ error: "Você não tem acesso a este quadro" });
    next();
  };
}
