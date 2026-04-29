#!/usr/bin/env node
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "apps/console/public");
const port = Number(process.env.PORT ?? 4310);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"]
]);

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^([.][.][\\/])+/, "");
  const candidate = path.join(publicDir, normalized === "/" ? "index.html" : normalized);
  if (!candidate.startsWith(publicDir)) return null;
  return candidate;
}

const server = createServer(async (req, res) => {
  const candidate = safePath(req.url ?? "/");
  if (!candidate) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  let filePath = candidate;
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = path.join(filePath, "index.html");
  } catch {
    filePath = path.join(publicDir, "index.html");
  }

  const ext = path.extname(filePath);
  res.setHeader("Content-Type", contentTypes.get(ext) ?? "application/octet-stream");
  createReadStream(filePath).on("error", () => {
    res.writeHead(404);
    res.end("Not found");
  }).pipe(res);
});

server.listen(port, () => {
  console.log(`Foundation console: http://localhost:${port}`);
});
