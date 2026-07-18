import serverless from "serverless-http";
import { app } from "../../server/app.js";
import { initDb } from "../../server/db.js";

let dbReady;
function ensureDb() {
  if (!dbReady) dbReady = initDb();
  return dbReady;
}

const serverlessHandler = serverless(app, { basePath: "/.netlify/functions" });

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await ensureDb();
  return serverlessHandler(event, context);
};
