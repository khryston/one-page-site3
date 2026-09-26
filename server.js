"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

loadEnv(path.join(__dirname, "..", ".env"));
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const PORT = Number(process.env.PORT || 3000);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "";
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;
const requests = new Map();

const types = { ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".jfif": "image/jpeg", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8" };

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}
function headers(res) {
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net; style-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.googleadservices.com; connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net; frame-src https://www.openstreetmap.org; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("X-Frame-Options", "DENY");
}
function sendJson(res, status, payload) { headers(res); res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(payload)); }
function clientIp(req) { return (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").toString().split(",")[0].trim(); }
function limited(ip) { const now = Date.now(); const active = (requests.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS); active.push(now); requests.set(ip, active); return active.length > RATE_MAX; }
function safeText(value, max) { return String(value || "").replace(/[<>]/g, "").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
function normalizePhone(value) { const digits = String(value || "").replace(/\D/g, ""); return /^380\d{9}$/.test(digits) ? `+${digits}` : ""; }
function validName(name) { return /^[A-Za-zА-Яа-яІіЇїЄєҐґ’'\-\s]{2,80}$/.test(name); }
function looksAutomated(text) { return /https?:\/\/|www\.|(.)\1{5,}/i.test(text); }
function body(req) { return new Promise((resolve, reject) => { let raw = ""; req.on("data", (part) => { raw += part; if (raw.length > 10_000) { reject(new Error("too_large")); req.destroy(); } }); req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch { reject(new Error("bad_json")); } }); req.on("error", reject); }); }
async function telegramLead(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN, chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { configured: false };
  const text = `НОВИЙ ЛІД\n\nІм'я: ${lead.name}\nТелефон: ${lead.phone}\nКоментар: ${lead.comment || "—"}\nСторінка: ${lead.page}\nДата: ${lead.date}\nЧас: ${lead.time}`;
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text }) });
  if (!response.ok) throw new Error("telegram_failed");
  return { configured: true };
}
async function lead(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGIN && origin && origin !== ALLOWED_ORIGIN) return sendJson(res, 403, { error: "Запит відхилено." });
  if (limited(clientIp(req))) return sendJson(res, 429, { error: "Забагато запитів. Спробуйте трохи пізніше." });
  try {
    const input = await body(req);
    if (input.website) return sendJson(res, 200, { ok: true }); // honeypot: no disclosure
    if (!Number.isFinite(input.startedAt) || Date.now() - input.startedAt < 2500 || Date.now() - input.startedAt > 7_200_000) return sendJson(res, 400, { error: "Будь ласка, заповніть форму ще раз." });
    if (!input.consent) return sendJson(res, 400, { error: "Потрібна згода на обробку даних." });
    const name = safeText(input.name, 80), phone = normalizePhone(input.phone), comment = safeText(input.comment, 600);
    if (!validName(name)) return sendJson(res, 400, { error: "Вкажіть ім’я літерами." });
    if (!phone) return sendJson(res, 400, { error: "Вкажіть номер у форматі +380XXXXXXXXX." });
    if (looksAutomated(`${name} ${comment}`)) return sendJson(res, 400, { error: "Опишіть проблему звичайним текстом без посилань." });
    const now = new Date();
    const delivery = await telegramLead({ name, phone, comment, page: safeText(input.page, 200) || "/", date: now.toLocaleDateString("uk-UA"), time: now.toLocaleTimeString("uk-UA") });
    if (!delivery.configured) return sendJson(res, 503, { error: "Форма ще не налаштована. Будь ласка, зателефонуйте нам." });
    sendJson(res, 200, { ok: true });
  } catch (error) { sendJson(res, 500, { error: "Не вдалося надіслати заявку. Будь ласка, зателефонуйте нам." }); }
}
function staticFile(req, res, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const file = path.resolve(PUBLIC_DIR, `.${requested}`);
  if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return sendFile(res, path.join(PUBLIC_DIR, "404.html"), 404);
  if (["/index.html", "/robots.txt", "/sitemap.xml"].includes(requested)) return sendConfiguredFile(res, file, 200);
  sendFile(res, file, 200);
}
function siteUrl() {
  try {
    const config = fs.readFileSync(path.join(PUBLIC_DIR, "site-config.js"), "utf8");
    const match = config.match(/siteUrl\s*:\s*["'](https?:\/\/[^"']+)["']/i);
    return match ? match[1].replace(/\/+$/, "") : "https://example.com";
  } catch { return "https://example.com"; }
}
function sendConfiguredFile(res, file, status) {
  headers(res);
  const ext = path.extname(file).toLowerCase();
  const content = fs.readFileSync(file, "utf8").replaceAll("https://example.com", siteUrl());
  res.writeHead(status, { "Content-Type": types[ext] || "text/plain; charset=utf-8", "Cache-Control": "no-cache" });
  res.end(content);
}
function sendFile(res, file, status) { headers(res); const ext = path.extname(file).toLowerCase(); const cache = [".html", ".css", ".js"].includes(ext) ? "no-cache" : "public, max-age=604800, immutable"; res.writeHead(status, { "Content-Type": types[ext] || "application/octet-stream", "Cache-Control": cache }); fs.createReadStream(file).pipe(res); }
const server = http.createServer((req, res) => { const url = new URL(req.url, `http://${req.headers.host || "localhost"}`); if (req.method === "POST" && url.pathname === "/api/lead") return lead(req, res); if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 405, { error: "Method not allowed" }); return staticFile(req, res, url.pathname); });
server.listen(PORT, () => console.log(`Service landing: http://localhost:${PORT}`));
