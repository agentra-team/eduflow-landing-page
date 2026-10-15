#!/usr/bin/env node
// Chép nguyên văn từ skill seo-master (scripts/seo-audit.mjs) ngày 2026-10-15, để CI không phụ thuộc thư mục home của máy dev.
// Sửa ở nguồn rồi chép lại; không sửa tại đây.
/**
 * seo-audit.mjs: crawl a running site and check the SEO invariants of the
 * seo-master skill. No dependencies (Node 18+).
 *
 *   node seo-audit.mjs --base http://localhost:3000 --canonical https://www.example.com
 *   node seo-audit.mjs --base https://www.example.com            (live: also checks host redirects)
 *
 * Options
 *   --base URL          where to fetch from (a production build: `next build && next start`)
 *   --canonical URL     the production origin canonicals must use (default: read from the home page)
 *   --max N             most URLs to fetch (default 2000)
 *   --concurrency N     parallel requests (default 8)
 *   --title-max N       longest <title> (default 60)
 *   --desc-min N        shortest meta description (default 110)
 *   --desc-max N        longest meta description (default 160)
 *   --drafts a,b        paths that must stay out of the index (drafts, scheduled posts)
 *   --urls a,b|@file    extra paths to fetch (pages nothing links to still get checked)
 *   --next-manifest F   Next.js: seed every prerendered route from .next/prerender-manifest.json
 *   --json FILE         also write the full report as JSON
 *   --verbose           list every URL per issue (default: first 5)
 *
 * Exit code 1 when any error is found, so it can gate CI.
 */
import { readFile, writeFile } from "node:fs/promises";

const opts = parseArgs(process.argv.slice(2));
if (!opts.base || opts.help) {
  console.error(`usage: node seo-audit.mjs --base URL [options]

  --base URL          where to fetch from (a production build, or the live canonical origin)
  --canonical URL     production origin canonicals must use (default: read from the home page)
  --drafts a,b        paths that must stay out of the index (drafts, scheduled posts)
  --urls a,b|@file    extra paths to fetch (pages nothing links to still get checked)
  --next-manifest F   Next.js: seed every prerendered route from .next/prerender-manifest.json
  --max N             most URLs to fetch (default 2000)
  --concurrency N     parallel requests (default 8)
  --title-max N       longest <title> (default 60)
  --desc-min N        shortest meta description (default 110)
  --desc-max N        longest meta description (default 160)
  --json FILE         also write the full report as JSON
  --verbose           list every URL per issue

Exit code 1 when any error is found.`);
  process.exit(opts.help ? 0 : 2);
}

const BASE = new URL(opts.base).origin;
const MAX = Number(opts.max ?? 2000);
const CONCURRENCY = Number(opts.concurrency ?? 8);
const TITLE_MAX = Number(opts["title-max"] ?? 60);
const DESC_MIN = Number(opts["desc-min"] ?? 110);
const DESC_MAX = Number(opts["desc-max"] ?? 160);
const VERBOSE = Boolean(opts.verbose);
// Fetch as Googlebot (servers and WAFs may treat bots differently). Metadata is read from the whole
// document, because Next.js 15.2+ may stream it into <body> on dynamic pages.
const UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) seo-audit";
const SKIP_EXT = /\.(png|jpe?g|gif|webp|avif|svg|ico|pdf|zip|gz|mp4|webm|mp3|woff2?|ttf|otf|css|js|mjs|map|json|xml|txt|webmanifest|glb|gltf)$/i;
/** Hosts that must never appear in production HTML, JSON-LD or feeds. */
const NON_PROD = /https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|[a-z0-9-]+\.(vercel\.app|netlify\.app|pages\.dev|herokuapp\.com|onrender\.com))\b/i;
const DRAFTS = typeof opts.drafts === "string" ? opts.drafts.split(",").map((s) => s.trim()).filter(Boolean) : [];
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "CCBot",
];

let CANONICAL; // production origin, resolved in main()
let ALT_HOST; // the www / apex twin of the canonical host

/* ------------------------------------------------------------------ */
/* issues                                                              */
/* ------------------------------------------------------------------ */

const issues = [];
/** severity: "error" fails the audit, "warn" needs a look, "info" is context. */
function add(severity, code, url, detail = "") {
  issues.push({ severity, code, url, detail });
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, "");
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else out[key] = argv[++i];
  }
  return out;
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };
function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z#0-9]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

/** Lowercase, straight quotes, single spaces: for "is this text on the page" checks. */
const squash = (s) => decode(s).replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim().toLowerCase();

function attrs(source) {
  const out = {};
  for (const m of source.matchAll(/([^\s=/"'>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return out;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))].map((m) => attrs(m[1]));
}

const relHas = (rel, value) => (rel ?? "").toLowerCase().split(/\s+/).includes(value);

/** Whether `text` mentions the path as a whole segment (/blog/a, not /blog/ab). */
const mentions = (text, path) => new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`).test(text);

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const HIDDEN_STYLE = /(?:^|;)\s*(?:opacity\s*:\s*0(?![.\d])|visibility\s*:\s*hidden)/i;

/** The inline style that hides the first <h1> (on it or an ancestor) until JS runs, if any. */
function hiddenH1(html) {
  const stack = [];
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/g)) {
    const [, closing, raw, rest, selfClosing] = m;
    const name = raw.toLowerCase();
    if (closing) {
      const i = stack.findLastIndex((t) => t.name === name);
      if (i >= 0) stack.length = i;
      continue;
    }
    const style = attrs(rest).style ?? "";
    const entry = { name, hidden: HIDDEN_STYLE.test(style) ? style : undefined };
    if (name === "h1") return entry.hidden ?? stack.find((t) => t.hidden)?.hidden;
    if (!VOID.has(name) && !selfClosing) stack.push(entry);
  }
  return undefined;
}

/** Pixel size of a PNG, JPEG, WebP or GIF. */
function imageSize(b) {
  if (b.length > 24 && b.toString("ascii", 1, 4) === "PNG") return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = b[i + 1];
      if ((marker >= 0xd0 && marker <= 0xd9) || marker === 0x01) {
        i += 2;
        continue;
      }
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  if (b.length > 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (chunk === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") {
      const bits = b.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  if (b.length > 10 && b.toString("ascii", 0, 3) === "GIF") return { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
  return undefined;
}

async function getBytes(url) {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA } });
    return { status: res.status, type: res.headers.get("content-type") ?? "", bytes: Buffer.from(await res.arrayBuffer()) };
  } catch (error) {
    return { status: 0, type: "", bytes: Buffer.alloc(0), error: String(error?.message ?? error) };
  }
}

/** A local, preview or staging URL leaking into production output, if any. */
function leak(text) {
  if (BASE !== CANONICAL && text.includes(BASE)) return BASE;
  return text.match(NON_PROD)?.[0];
}

/** "/a/" and "/a" compare equal; the root stays "/". */
const normPath = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

/** Path + query of a URL on this site (base, canonical or its www/apex twin); undefined for external links. */
function sitePath(href, from = BASE) {
  let u;
  try {
    u = new URL(href, from);
  } catch {
    return undefined;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
  if (u.origin !== BASE && u.origin !== CANONICAL && u.host !== ALT_HOST) return undefined;
  return u.pathname + u.search;
}

async function get(url, { follow = false } = {}) {
  try {
    const res = await fetch(url, {
      redirect: follow ? "follow" : "manual",
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
    });
    const type = res.headers.get("content-type") ?? "";
    let body = "";
    if (/text|xml|json/.test(type)) body = await res.text();
    else await res.arrayBuffer().catch(() => undefined);
    return { status: res.status, type, body, location: res.headers.get("location"), xRobots: res.headers.get("x-robots-tag") ?? "" };
  } catch (error) {
    return { status: 0, type: "", body: "", location: null, xRobots: "", error: String(error?.cause?.code ?? error?.message ?? error) };
  }
}

/* ------------------------------------------------------------------ */
/* robots.txt                                                          */
/* ------------------------------------------------------------------ */

async function auditRobots() {
  const res = await get(`${BASE}/robots.txt`, { follow: true });
  if (res.status !== 200) {
    add("error", "robots-missing", "/robots.txt", `HTTP ${res.status}`);
    return { sitemaps: [], starDisallow: [] };
  }
  const groups = []; // { agents: [], allow: [], disallow: [] }
  const sitemaps = [];
  let current;
  let lastWasAgent = false;
  for (const raw of res.body.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const [, field, value] = m;
    const key = field.toLowerCase();
    if (key === "user-agent") {
      if (!lastWasAgent) groups.push((current = { agents: [], allow: [], disallow: [] }));
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (key === "sitemap") sitemaps.push(value);
    else if (current && key === "allow") current.allow.push(value);
    else if (current && key === "disallow" && value) current.disallow.push(value);
  }

  const star = groups.find((g) => g.agents.includes("*"));
  if (star?.disallow.includes("/")) add("error", "robots-blocks-site", "/robots.txt", "User-agent: * has Disallow: /");
  if (sitemaps.length === 0) add("warn", "robots-no-sitemap", "/robots.txt", "no Sitemap: line");
  for (const s of sitemaps) {
    if (new URL(s).origin !== CANONICAL) add("error", "robots-sitemap-origin", "/robots.txt", `Sitemap ${s} is not on ${CANONICAL}`);
  }

  // A crawler obeys only the most specific group naming it, so a named group silently drops the * rules.
  for (const g of groups) {
    if (g === star || !star) continue;
    const missing = star.disallow.filter((d) => !g.disallow.includes(d));
    if (missing.length) add("warn", "robots-group-drops-star-rules", "/robots.txt", `${g.agents.join(", ")} ignores * Disallow: ${missing.join(" ")}`);
  }

  const named = (bot) => groups.find((g) => g.agents.includes(bot.toLowerCase()));
  const blocked = AI_BOTS.filter((b) => named(b)?.disallow.includes("/"));
  const explicit = AI_BOTS.filter((b) => named(b) && !named(b).disallow.includes("/"));
  add("info", "robots-ai-bots", "/robots.txt", `explicitly allowed: ${explicit.join(", ") || "none (inherit *)"}; blocked: ${blocked.join(", ") || "none"}`);
  return { sitemaps, starDisallow: star?.disallow ?? [] };
}

/* ------------------------------------------------------------------ */
/* sitemap.xml                                                         */
/* ------------------------------------------------------------------ */

async function readSitemap(url, depth = 0, out = []) {
  const path = sitePath(url) ?? "/sitemap.xml";
  const res = await get(BASE + path, { follow: true });
  if (res.status !== 200) {
    add("error", "sitemap-missing", path, `HTTP ${res.status}`);
    return out;
  }
  if (/<sitemapindex/i.test(res.body) && depth < 3) {
    for (const m of res.body.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)) await readSitemap(decode(m[1]), depth + 1, out);
    return out;
  }
  for (const m of res.body.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const loc = decode(m[1].match(/<loc>\s*([\s\S]*?)\s*<\/loc>/i)?.[1] ?? "");
    const lastmod = m[1].match(/<lastmod>\s*([\s\S]*?)\s*<\/lastmod>/i)?.[1];
    if (loc) out.push({ loc, lastmod });
  }
  return out;
}

function auditSitemapEntries(entries) {
  const seen = new Set();
  for (const { loc, lastmod } of entries) {
    if (seen.has(loc)) add("warn", "sitemap-duplicate", loc);
    seen.add(loc);
    let origin;
    try {
      origin = new URL(loc).origin;
    } catch {
      add("error", "sitemap-bad-url", loc);
      continue;
    }
    if (origin !== CANONICAL) add("error", "sitemap-origin", loc, `not on ${CANONICAL}`);
    if (lastmod && new Date(lastmod) > new Date(Date.now() + 864e5)) add("warn", "sitemap-lastmod-future", loc, lastmod);
  }
  // A build timestamp stamped on every URL is not a change date; search engines learn to ignore such lastmods.
  // Smell: every URL carries the same lastmod, or 5+ share one value down to the second.
  const mods = entries.map((e) => e.lastmod).filter(Boolean);
  const top = [...mods.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1])[0];
  if (top && ((mods.length === entries.length && entries.length >= 5 && top[1] === mods.length) || (top[1] >= 5 && /T\d\d:\d\d:\d\d/.test(top[0])))) {
    add("warn", "sitemap-lastmod-build-time", "/sitemap.xml", `${top[1]} URLs share lastmod ${top[0]}: looks like a build timestamp, not a change date`);
  }
}

/** Disallow rules (plain prefixes; * and $ patterns are skipped) that cover a sitemap URL. */
function auditRobotsVsSitemap(starDisallow, sitemapPaths) {
  const plain = starDisallow.filter((d) => !/[*$]/.test(d));
  for (const path of sitemapPaths) {
    const rule = plain.find((d) => path.startsWith(d));
    if (rule) add("error", "sitemap-url-disallowed", path, `robots.txt Disallow: ${rule}`);
  }
}

/* ------------------------------------------------------------------ */
/* pages                                                               */
/* ------------------------------------------------------------------ */

function analyze(html, xRobots) {
  const jsonLd = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  // Drop scripts, styles and inline SVG (its <title> is not the page title).
  const clean = html.replace(/<(script|style|svg|template)\b[\s\S]*?<\/\1>/gi, " ");
  const metas = tags(clean, "meta");
  const links = tags(clean, "link");
  const meta = (key) => metas.find((m) => [m.name, m.property].some((v) => v?.toLowerCase() === key))?.content;
  const titles = [...clean.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1]).trim());
  const bodyHtml = clean.replace(/<head\b[\s\S]*?<\/head>/i, " ");
  const text = squash(bodyHtml.replace(/<[^>]+>/g, " "));
  const robots = [meta("robots"), meta("googlebot"), xRobots].filter(Boolean).join(", ");
  return {
    lang: html.match(/<html\b[^>]*\blang\s*=\s*["']?([^"'\s>]+)/i)?.[1],
    titles,
    title: titles[0],
    description: meta("description"),
    robots,
    noindex: /noindex|\bnone\b/i.test(robots),
    canonicals: links.filter((l) => relHas(l.rel, "canonical")).map((l) => l.href),
    feeds: links.filter((l) => relHas(l.rel, "alternate") && /rss|atom/.test(l.type ?? "")).map((l) => l.href),
    h1: (bodyHtml.match(/<h1\b/gi) ?? []).length,
    h1Hidden: hiddenH1(bodyHtml),
    ogTitle: meta("og:title"),
    ogUrl: meta("og:url"),
    ogImage: meta("og:image"),
    twitterCard: meta("twitter:card"),
    imagesNoAlt: tags(bodyHtml, "img").filter((img) => !("alt" in img)).length,
    anchors: tags(bodyHtml, "a").map((a) => a.href).filter(Boolean),
    jsonLd,
    text,
    headHtml: clean.slice(0, clean.search(/<\/head>/i) + 1 || 0),
  };
}

/** Every node of a JSON-LD payload: arrays and @graph flattened. */
function nodesOf(data) {
  if (Array.isArray(data)) return data.flatMap(nodesOf);
  if (data && typeof data === "object") return [data, ...(Array.isArray(data["@graph"]) ? data["@graph"].flatMap(nodesOf) : [])];
  return [];
}

const typesOf = (node) => [node["@type"]].flat().filter(Boolean);

function auditJsonLd(path, page) {
  const types = [];
  for (const raw of page.jsonLd) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      add("error", "jsonld-invalid", path, String(error.message).slice(0, 120));
      continue;
    }
    if (leak(raw)) add("error", "jsonld-non-production-url", path, `JSON-LD contains ${leak(raw)}`);
    for (const node of nodesOf(data)) {
      types.push(...typesOf(node));
      if (typesOf(node).includes("FAQPage")) {
        for (const q of node.mainEntity ?? []) {
          const question = squash(String(q.name ?? ""));
          const answer = squash(String(q.acceptedAnswer?.text ?? "").replace(/<[^>]+>/g, " ")).slice(0, 80);
          if (question && !page.text.includes(question)) add("error", "faq-question-not-visible", path, q.name);
          else if (answer && !page.text.includes(answer)) add("error", "faq-answer-not-in-dom", path, q.name);
        }
      }
      if (typesOf(node).includes("BreadcrumbList")) {
        for (const item of node.itemListElement ?? []) {
          const url = typeof item.item === "string" ? item.item : item.item?.["@id"];
          if (url && new URL(url, CANONICAL).origin !== CANONICAL) add("error", "breadcrumb-origin", path, url);
        }
      }
      for (const key of ["aggregateRating", "review"]) {
        if (node[key]) add("warn", "jsonld-rating-check", path, `${typesOf(node).join("/")} has ${key}: it must come from real, visible reviews`);
      }
    }
  }
  return types;
}

/* ------------------------------------------------------------------ */
/* crawl                                                               */
/* ------------------------------------------------------------------ */

const pages = new Map(); // path -> record
const inbound = new Map(); // path -> Set(source paths)
const queued = new Set();
const queue = [];

function enqueue(path, source) {
  const clean = path.split("#")[0];
  if (source) {
    if (!inbound.has(clean)) inbound.set(clean, new Set());
    inbound.get(clean).add(source);
  }
  if (queued.has(clean) || SKIP_EXT.test(clean.split("?")[0])) return;
  if (queued.size >= MAX) return;
  queued.add(clean);
  queue.push(clean);
}

async function visit(path) {
  const res = await get(BASE + path);
  const rec = { path, status: res.status, error: res.error };
  pages.set(path, rec);
  if (res.status >= 300 && res.status < 400) {
    rec.location = res.location;
    const target = res.location ? sitePath(res.location, BASE + path) : undefined;
    if (target) enqueue(target);
    return;
  }
  if (res.status !== 200 || !res.type.includes("html")) return;
  const page = analyze(res.body, res.xRobots);
  Object.assign(rec, page, { types: auditJsonLd(path, page) });
  for (const href of page.anchors) {
    let u;
    try {
      u = new URL(href, BASE + path);
    } catch {
      continue;
    }
    if (u.host === ALT_HOST) add("warn", "link-to-non-canonical-host", path, href);
    const target = sitePath(href, BASE + path);
    if (target) enqueue(target, path);
  }
}

async function crawl() {
  let active = 0;
  await new Promise((resolve) => {
    const pump = () => {
      while (active < CONCURRENCY && queue.length) {
        const path = queue.shift();
        active++;
        visit(path)
          .catch((error) => add("error", "crawl-crash", path, String(error)))
          .finally(() => {
            active--;
            pump();
          });
      }
      if (active === 0 && queue.length === 0) resolve();
    };
    pump();
  });
}

/* ------------------------------------------------------------------ */
/* per-page and cross-page checks                                      */
/* ------------------------------------------------------------------ */

function auditPages(sitemapPaths) {
  const titles = new Map();
  const descriptions = new Map();
  const indexable = [];

  for (const rec of pages.values()) {
    if (rec.status !== 200 || rec.titles === undefined) continue;
    const { path } = rec;
    const pathname = path.split("?")[0];
    const hasQuery = path.includes("?");

    if (!rec.lang) add("warn", "html-lang-missing", path);
    if (rec.titles.length > 1) add("warn", "title-multiple", path, `${rec.titles.length} <title> elements`);
    if (leak(rec.headHtml)) add("error", "head-non-production-url", path, `<head> references ${leak(rec.headHtml)}`);

    if (rec.noindex) continue; // the rest only matters for pages meant to rank

    // canonical
    let canonicalPath;
    if (rec.canonicals.length === 0) add("error", "canonical-missing", path);
    else if (rec.canonicals.length > 1) add("error", "canonical-multiple", path, rec.canonicals.join(" "));
    if (rec.canonicals.length >= 1) {
      const c = rec.canonicals[0];
      if (!/^https?:\/\//.test(c)) add("warn", "canonical-relative", path, c);
      const u = new URL(c, CANONICAL);
      if (u.origin !== CANONICAL) add("error", "canonical-origin", path, `${c} is not on ${CANONICAL}`);
      canonicalPath = u.pathname + u.search;
      const self = normPath(canonicalPath) === normPath(path) || (hasQuery && normPath(canonicalPath) === normPath(pathname));
      if (!self) add("warn", "canonical-not-self", path, `points to ${c}`);
      if (rec.ogUrl && normPath(new URL(rec.ogUrl, CANONICAL).pathname) !== normPath(u.pathname)) {
        add("warn", "og-url-mismatch", path, `og:url ${rec.ogUrl} ≠ canonical ${c}`);
      }
      if (normPath(canonicalPath) === normPath(path)) indexable.push(path);
    }

    // title, description, headings
    if (!rec.title) add("error", "title-missing", path);
    else {
      if (rec.title.length > TITLE_MAX) add("warn", "title-too-long", path, `${rec.title.length} chars: ${rec.title}`);
      if (!hasQuery) titles.set(rec.title, [...(titles.get(rec.title) ?? []), path]);
    }
    if (!rec.description) add("error", "description-missing", path);
    else {
      const n = rec.description.length;
      if (n < DESC_MIN || n > DESC_MAX) add("warn", "description-length", path, `${n} chars (want ${DESC_MIN}-${DESC_MAX})`);
      if (!hasQuery) descriptions.set(rec.description, [...(descriptions.get(rec.description) ?? []), path]);
    }
    if (rec.h1 === 0) add("error", "h1-missing", path);
    if (rec.h1 > 1) add("warn", "h1-multiple", path, `${rec.h1} h1 elements`);
    if (rec.h1Hidden) add("error", "h1-hidden-until-js", path, `the h1 starts hidden (style="${rec.h1Hidden.slice(0, 60)}"): render it visible in the server HTML`);

    // social
    if (!rec.ogImage) add("warn", "og-image-missing", path);
    else if (!/^https?:\/\//.test(rec.ogImage)) add("error", "og-image-relative", path, rec.ogImage);
    if (!rec.ogTitle) add("warn", "og-title-missing", path);
    if (!rec.twitterCard) add("info", "twitter-card-missing", path);
    if (rec.imagesNoAlt) add("warn", "img-alt-missing", path, `${rec.imagesNoAlt} <img> without alt`);
    if (rec.types.length === 0) add("info", "jsonld-none", path);
  }

  for (const [title, paths] of titles) if (paths.length > 1) add("warn", "title-duplicate", paths.join(" "), title);
  for (const [desc, paths] of descriptions) if (paths.length > 1) add("warn", "description-duplicate", paths.join(" "), desc.slice(0, 80));

  // sitemap ⇄ crawl
  const inSitemap = new Set(sitemapPaths.map(normPath));
  for (const path of sitemapPaths) {
    const rec = pages.get(path);
    if (!rec) continue;
    if (rec.status >= 300 && rec.status < 400) add("error", "sitemap-lists-redirect", path, `→ ${rec.location}`);
    else if (rec.status !== 200) add("error", "sitemap-lists-error", path, `HTTP ${rec.status || rec.error}`);
    else if (rec.noindex) add("error", "sitemap-lists-noindex", path);
    else if (!indexable.includes(path)) add("error", "sitemap-lists-non-canonical", path, `canonical ${rec.canonicals?.[0]}`);
  }
  for (const path of new Set([...indexable, ...sitemapPaths])) {
    if (pages.get(path)?.status === 200 && !inbound.get(path)?.size && normPath(path) !== "/") add("warn", "orphan-page", path, "linked from no crawled page");
  }
  for (const path of indexable) {
    if (!inSitemap.has(normPath(path))) add("error", "missing-from-sitemap", path, "indexable and self-canonical, but not in the sitemap");
  }

  // links
  for (const [path, sources] of inbound) {
    const rec = pages.get(path);
    if (!rec) continue;
    const from = [...sources].slice(0, 3).join(", ");
    if (rec.status === 0 || rec.status >= 400) add("error", "broken-internal-link", path, `HTTP ${rec.status || rec.error}, linked from ${from}`);
    else if (rec.status >= 300) add("warn", "link-to-redirect", path, `→ ${rec.location}, linked from ${from}`);
  }
  return indexable;
}

async function auditOgImages() {
  const images = new Map();
  for (const rec of pages.values()) if (rec.ogImage && !rec.noindex) images.set(rec.ogImage, rec.path);
  for (const [image, page] of images) {
    const path = sitePath(image);
    const res = await getBytes(path ? BASE + path : image);
    if (res.status !== 200 || !/^image\//.test(res.type)) {
      add("error", "og-image-broken", page, `${image}: HTTP ${res.status} ${res.type}`);
      continue;
    }
    const size = imageSize(res.bytes);
    if (!size) add("warn", "og-image-format", page, `${image}: ${res.type} (use PNG or JPEG; SVG is not shown by social platforms)`);
    else if (size.w < 1200 || size.h < 600 || Math.abs(size.w / size.h - 1.905) > 0.06) {
      add("warn", "og-image-size", page, `${image}: ${size.w}×${size.h} (want 1200×630)`);
    }
  }
}

/** Unknown URLs at the root and inside every section with nested pages (/docs/x, /blog/x) must answer 404. */
async function auditNotFound(sitemapPaths) {
  const sections = new Set(["/"]);
  for (const p of sitemapPaths) {
    const segments = p.split("?")[0].split("/").filter(Boolean);
    if (segments.length >= 2) sections.add(`/${segments[0]}/`);
  }
  const id = Date.now().toString(36);
  for (const section of sections) {
    const path = `${section}seo-audit-missing-${id}`;
    const res = await get(BASE + path);
    if (res.status === 200) add("error", "soft-404", path, "an unknown URL answers 200");
    else if (res.status !== 404 && res.status !== 410) add("warn", "unknown-url-status", path, `HTTP ${res.status}`);
  }
}

async function auditHosts() {
  // Live only: http → https and the www/apex twin must redirect permanently to the canonical origin.
  const canonical = new URL(CANONICAL);
  const variants = [`http://${canonical.host}/`, ALT_HOST ? `${canonical.protocol}//${ALT_HOST}/` : undefined].filter(Boolean);
  for (const start of variants) {
    const hops = [];
    let url = start;
    for (let i = 0; i < 5; i++) {
      const res = await get(url);
      if (res.status < 300 || res.status >= 400 || !res.location) {
        if (res.status === 0) hops.push(`error ${res.error}`);
        break;
      }
      hops.push(`${res.status} → ${res.location}`);
      if (![301, 308].includes(res.status)) hops.push("(temporary redirect)");
      url = new URL(res.location, url).toString();
    }
    const chain = `${start} ${hops.join(", ") || "no redirect"}`;
    const permanent = hops.length > 0 && !hops.some((h) => h.startsWith("error") || h.includes("temporary"));
    if (!permanent || new URL(url).origin !== CANONICAL) add("error", "host-redirect", start, `${chain} (want 301/308 to ${CANONICAL})`);
    else if (hops.length > 2) add("warn", "host-redirect-chain", start, chain);
  }
}

/** One URL per page: the other trailing-slash form must redirect (or 404), not serve a duplicate. */
async function auditTrailingSlash(sitemapPaths) {
  for (const path of sitemapPaths.filter((p) => p !== "/" && !p.includes("?")).slice(0, 200)) {
    const alt = path.endsWith("/") ? path.replace(/\/+$/, "") : `${path}/`;
    const res = await get(BASE + alt);
    if (res.status === 200) {
      const canonical = analyze(res.body, res.xRobots).canonicals[0];
      const ok = canonical && new URL(canonical, CANONICAL).pathname === path;
      if (!ok) add("error", "trailing-slash-duplicate", alt, `answers 200 as well as ${path}; redirect it (308) to one form`);
    } else if (res.status >= 300 && res.status < 400 && res.location && normPath(new URL(res.location, BASE + alt).pathname) !== normPath(path)) {
      add("warn", "trailing-slash-redirect", alt, `redirects to ${res.location}, not ${path}`);
    }
  }
}

/** File-name twins of each sitemap URL: /index.html, /dir/index.html, /about.html (or /privacy for /privacy.html). */
function fileVariants(path) {
  if (path.endsWith("/")) return [`${path}index.html`];
  if (path.endsWith("/index.html")) return [path.slice(0, -"index.html".length)];
  if (path.endsWith(".html")) return [path.slice(0, -".html".length)];
  return [`${path}.html`, `${path}/index.html`];
}

/**
 * Static hosts serve the same page under its file name. A variant must redirect (301/308) to the sitemap URL
 * or 404. Serving 200 with a canonical back is tolerated by Google (it shows up as "Alternate page with
 * proper canonical tag" in Search Console) but a redirect is cleaner, so that is a warning.
 */
async function auditFileVariants(sitemapPaths) {
  // Sitemap URLs that do not answer 200 are reported elsewhere; their twins would get backwards advice.
  for (const path of sitemapPaths.filter((p) => !p.includes("?") && pages.get(p)?.status === 200).slice(0, 100)) {
    for (const alt of fileVariants(path)) {
      if (sitemapPaths.includes(alt)) continue;
      const res = await get(BASE + alt);
      if (res.status === 200 && res.type.includes("html")) {
        const canonical = analyze(res.body, res.xRobots).canonicals[0];
        if (canonical && new URL(canonical, CANONICAL).pathname === path) {
          add("warn", "url-variant-canonical-only", alt, `answers 200 with a canonical to ${path}; 301/308 it to ${path}`);
        } else add("error", "url-variant-duplicate", alt, `answers 200 as well as ${path}; 301/308 it to ${path}`);
      } else if (res.status >= 300 && res.status < 400 && res.location) {
        const target = new URL(res.location, BASE + alt);
        if (normPath(target.pathname) !== normPath(path)) add("warn", "url-variant-redirect", alt, `redirects to ${res.location}, not ${path}`);
        else if (![301, 308].includes(res.status)) add("warn", "url-variant-redirect", alt, `HTTP ${res.status} (temporary); use 301/308`);
      }
    }
  }
}

/** Drafts and scheduled posts: not indexable, not in the sitemap, not linked from live pages. */
async function auditDrafts(sitemapPaths) {
  for (const draft of DRAFTS) {
    if (sitemapPaths.includes(draft)) add("error", "draft-in-sitemap", draft);
    if (inbound.get(draft)?.size) add("error", "draft-linked", draft, `linked from ${[...inbound.get(draft)].slice(0, 3).join(", ")}`);
    const res = await get(BASE + draft);
    if (res.status === 200) {
      const noindex = res.type.includes("html") && analyze(res.body, res.xRobots).noindex;
      add(
        "error",
        "draft-served",
        draft,
        `answers 200${noindex ? " with noindex" : ", indexable"}; production must 404 drafts (noindex is the preview behaviour: build with the production env, e.g. VERCEL_ENV=production)`,
      );
    }
  }
}

const COMMON_FEEDS = ["/rss.xml", "/feed.xml", "/atom.xml", "/feed", "/index.xml", "/blog/rss.xml", "/blog/feed.xml", "/blog/atom.xml"];

/** RSS/Atom feeds, announced by the pages or at the usual paths: reachable, production URLs only, no drafts. */
async function auditFeeds() {
  const announced = new Set();
  for (const rec of pages.values()) for (const f of rec.feeds ?? []) announced.add(sitePath(f) ?? f);
  const found = [];
  for (const feed of new Set([...announced, ...COMMON_FEEDS])) {
    const res = await get(feed.startsWith("/") ? BASE + feed : feed, { follow: true });
    const isFeed = res.status === 200 && /xml|rss|atom/.test(res.type) && /<(rss|feed)\b/i.test(res.body);
    if (!isFeed) {
      if (announced.has(feed)) add("error", "feed-broken", feed, `HTTP ${res.status} ${res.type}`);
      continue;
    }
    found.push(feed);
    if (leak(res.body)) add("error", "feed-non-production-url", feed, leak(res.body));
    for (const draft of DRAFTS) if (mentions(res.body, draft)) add("error", "draft-in-feed", feed, draft);
    if (!announced.has(feed)) add("info", "feed-not-announced", feed, 'no page links it with <link rel="alternate">');
  }
  return found.length;
}

/** /llms.txt: plain text, production URLs that answer 200, no drafts. */
async function auditLlms() {
  const res = await get(`${BASE}/llms.txt`, { follow: true });
  if (res.status !== 200 || res.type.includes("html")) {
    add("info", "llms-txt", "/llms.txt", `absent (HTTP ${res.status}${res.status === 200 ? `, ${res.type}` : ""})`);
    return;
  }
  if (!/text\/(plain|markdown)/.test(res.type)) add("warn", "llms-txt-type", "/llms.txt", `${res.type} (want text/plain)`);
  if (leak(res.body)) add("error", "llms-txt-non-production-url", "/llms.txt", leak(res.body));
  for (const draft of DRAFTS) if (mentions(res.body, draft)) add("error", "draft-in-llms-txt", "/llms.txt", draft);
  const urls = [...res.body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
  for (const url of urls) {
    const path = sitePath(url);
    if (!path) continue;
    if (new URL(url).origin !== CANONICAL) add("error", "llms-txt-origin", "/llms.txt", `${url} is not on ${CANONICAL}`);
    const status = pages.get(path)?.status ?? (await get(BASE + path)).status;
    if (status !== 200) add("error", "llms-txt-broken-link", "/llms.txt", `${url}: HTTP ${status}`);
  }
  add("info", "llms-txt", "/llms.txt", `present, ${urls.length} links`);
}

/** Extra paths to fetch: --urls a,b or @file, and every prerendered route of a Next.js build. */
async function extraPaths() {
  const out = [];
  if (typeof opts.urls === "string") {
    const list = opts.urls.startsWith("@") ? await readFile(opts.urls.slice(1), "utf8") : opts.urls;
    out.push(...list.split(/[\s,]+/).filter(Boolean).map((u) => sitePath(u) ?? u));
  }
  if (typeof opts["next-manifest"] === "string") {
    const routes = Object.keys(JSON.parse(await readFile(opts["next-manifest"], "utf8")).routes ?? {});
    const skip = /^\/_|(^|\/)(og|opengraph-image|twitter-image|icon|apple-icon)(\/|$)/;
    out.push(...routes.filter((r) => !SKIP_EXT.test(r) && !skip.test(r)));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* report                                                              */
/* ------------------------------------------------------------------ */

function report(sitemapPaths, indexable) {
  const html = [...pages.values()].filter((p) => p.status === 200 && p.titles !== undefined);
  const count = (s) => issues.filter((i) => i.severity === s).length;
  console.log(`\nSEO audit  base=${BASE}  canonical=${CANONICAL}`);
  console.log(
    `Fetched ${pages.size} URLs: ${html.length} HTML pages, ` +
      `${[...pages.values()].filter((p) => p.status >= 300 && p.status < 400).length} redirects, ` +
      `${[...pages.values()].filter((p) => p.status >= 400 || p.status === 0).length} errors · ` +
      `sitemap ${sitemapPaths.length} URLs · indexable self-canonical ${indexable.length}`,
  );
  if (queued.size >= MAX) console.log(`(stopped at --max ${MAX})`);

  for (const severity of ["error", "warn", "info"]) {
    const list = issues.filter((i) => i.severity === severity);
    if (!list.length) continue;
    console.log(`\n${severity.toUpperCase()} (${list.length})`);
    const byCode = Map.groupBy ? Map.groupBy(list, (i) => i.code) : list.reduce((m, i) => m.set(i.code, [...(m.get(i.code) ?? []), i]), new Map());
    for (const [code, items] of byCode) {
      console.log(`  ${code} ×${items.length}`);
      for (const i of VERBOSE ? items : items.slice(0, 5)) console.log(`    ${i.url}${i.detail ? `  ${i.detail}` : ""}`);
      if (!VERBOSE && items.length > 5) console.log(`    … ${items.length - 5} more (--verbose)`);
    }
  }
  console.log(`\n${count("error")} errors, ${count("warn")} warnings`);
}

/* ------------------------------------------------------------------ */

async function main() {
  // Resolve the canonical origin first: everything is compared against it.
  if (opts.canonical) CANONICAL = new URL(opts.canonical).origin;
  else {
    const home = await get(`${BASE}/`, { follow: true });
    const c = home.status === 200 ? analyze(home.body, home.xRobots).canonicals[0] : undefined;
    CANONICAL = c ? new URL(c, BASE).origin : BASE;
  }
  const host = new URL(CANONICAL).host;
  ALT_HOST = host.startsWith("www.") ? host.slice(4) : host.split(".").length === 2 ? `www.${host}` : undefined;

  const { sitemaps: robotSitemaps, starDisallow } = await auditRobots();
  const entries = [];
  for (const s of robotSitemaps.length ? robotSitemaps : [`${CANONICAL}/sitemap.xml`]) await readSitemap(s, 0, entries);
  auditSitemapEntries(entries);
  const sitemapPaths = [...new Set(entries.map((e) => sitePath(e.loc)).filter(Boolean))];
  auditRobotsVsSitemap(starDisallow, sitemapPaths);

  enqueue("/");
  for (const p of sitemapPaths) enqueue(p);
  for (const p of await extraPaths()) enqueue(p);
  await crawl();

  const indexable = auditPages(sitemapPaths);
  await auditDrafts(sitemapPaths);
  await auditOgImages();
  await auditTrailingSlash(sitemapPaths);
  await auditFileVariants(sitemapPaths);
  const feeds = await auditFeeds();
  await auditNotFound(sitemapPaths);
  await auditLlms();
  add("info", "feeds", "/", `${feeds} RSS/Atom feed(s) found`);
  if (BASE === CANONICAL && new URL(CANONICAL).protocol === "https:") await auditHosts();

  report(sitemapPaths, indexable);
  if (opts.json) {
    await writeFile(
      opts.json,
      JSON.stringify({ base: BASE, canonical: CANONICAL, issues, pages: [...pages.values()].map(({ text, headHtml, anchors, ...p }) => p) }, null, 2),
    );
    console.log(`report written to ${opts.json}`);
  }
  process.exit(issues.some((i) => i.severity === "error") ? 1 : 0);
}

main();
