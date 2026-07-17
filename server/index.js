import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import boardsRouter from "./routes/boards.js";
import listsRouter from "./routes/lists.js";
import cardsRouter from "./routes/cards.js";
import geocodeRouter from "./routes/geocode.js";
import minutesRouter from "./routes/minutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl) {
  app.use(cors({ origin: frontendUrl, credentials: true }));
}

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/boards", boardsRouter);
app.use("/api/lists", listsRouter);
app.use("/api/cards", cardsRouter);
app.use("/api/geocode", geocodeRouter);
app.use("/api/minutes", minutesRouter);

const distPath = path.join(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Kanban API rodando em http://localhost:${PORT}`);
});
