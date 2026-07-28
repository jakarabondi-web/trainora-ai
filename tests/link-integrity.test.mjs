import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = new URL("../", import.meta.url);
const appDir = path.join(process.cwd(), "app");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const allFiles = await walk(appDir);
const tsxFiles = allFiles.filter((file) => file.endsWith(".tsx"));
const routeFiles = allFiles.filter((file) => file.endsWith("route.ts"));

const sourceByFile = new Map();
for (const file of tsxFiles) sourceByFile.set(file, await readFile(file, "utf8"));

// --- Build the set of real page routes from the app/ directory tree ---

function segmentsOf(routePath) {
  return routePath.split("/").filter(Boolean);
}

async function pageDirectoryExists(segments) {
  let dir = appDir;
  for (const segment of segments) {
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
    const staticMatch = entries.find((entry) => entry.isDirectory() && entry.name === segment);
    const dynamicMatch = entries.find((entry) => entry.isDirectory() && /^\[.+\]$/.test(entry.name));
    const nextDir = staticMatch ? staticMatch.name : dynamicMatch?.name;
    if (!nextDir) return false;
    dir = path.join(dir, nextDir);
  }
  const hasPage = await stat(path.join(dir, "page.tsx")).then(() => true).catch(() => false);
  return hasPage ? dir : false;
}

// The generic /admin/[section] route 404s at runtime (notFound()) unless the
// slug is one of its known keys, so a plain directory match isn't enough —
// parse the keys it actually serves out of its own source.
const adminSectionSource = await readFile(path.join(appDir, "admin", "[section]", "page.tsx"), "utf8");
const adminSectionKeys = new Set(
  [...adminSectionSource.matchAll(/^\s*(?:"([a-z-]+)"|([a-z-]+)):\s*{\s*label:/gm)].map((m) => m[1] ?? m[2]),
);

async function routeExists(pathname) {
  if (pathname === "/") return Boolean(await stat(path.join(appDir, "page.tsx")).then(() => true).catch(() => false));
  const segments = segmentsOf(pathname);
  const dir = await pageDirectoryExists(segments);
  if (!dir) return false;
  if (segments[0] === "admin" && segments.length === 2 && path.basename(dir) === "[section]") {
    return adminSectionKeys.has(segments[1]);
  }
  return true;
}

// --- Extract every internal link from the source ---

const linkPattern = /"(\/[a-zA-Z0-9/_-]*(?:#[a-zA-Z0-9-]+)?)"/g;

function internalLinks(source) {
  return [...source.matchAll(linkPattern)].map((m) => m[1]);
}

test("every internal page link resolves to a real route", async () => {
  const broken = [];
  for (const [file, source] of sourceByFile) {
    for (const link of internalLinks(source)) {
      if (link.startsWith("/api/")) continue; // checked separately below
      const [pathname] = link.split("#");
      if (!(await routeExists(pathname || "/"))) broken.push(`${path.relative(root.pathname, file)} -> ${link}`);
    }
  }
  assert.deepEqual(broken, []);
});

test("every internal API link has a matching route handler", async () => {
  const apiRoutes = new Set();
  for (const file of routeFiles) {
    const relative = path.relative(appDir, path.dirname(file)).split(path.sep).join("/");
    apiRoutes.add(`/${relative}`);
  }

  function apiRouteExists(pathname) {
    const segments = segmentsOf(pathname);
    for (const candidate of apiRoutes) {
      const candidateSegments = segmentsOf(candidate);
      if (candidateSegments.length !== segments.length) continue;
      if (candidateSegments.every((part, index) => part === segments[index] || /^\[.+\]$/.test(part))) return true;
    }
    return false;
  }

  const broken = [];
  for (const [file, source] of sourceByFile) {
    for (const link of internalLinks(source)) {
      if (!link.startsWith("/api/")) continue;
      const [pathname] = link.split("#");
      if (!apiRouteExists(pathname)) broken.push(`${path.relative(root.pathname, file)} -> ${link}`);
    }
  }
  assert.deepEqual(broken, []);
});

test("every same-page hash link points to an id that actually exists", async () => {
  // A page and every local (./ or ../) component it renders — transitively —
  // share one pool of ids: an anchor in a child component can point at an id
  // that only exists in the parent page that renders it, and vice versa.
  function localImports(file, source) {
    const dir = path.dirname(file);
    return [...source.matchAll(/from\s+"(\.\.?\/[^"]+)"/g)]
      .map((m) => path.normalize(path.join(dir, `${m[1]}.tsx`)))
      .filter((resolved) => sourceByFile.has(resolved));
  }

  const idPattern = /\bid="([a-zA-Z0-9-]+)"/g;
  const hashOnlyPattern = /href="#([a-zA-Z0-9-]+)"/g;
  const crossPagePattern = /href="(\/[a-zA-Z0-9/_-]+)#([a-zA-Z0-9-]+)"/g;

  const routeToFile = new Map();
  for (const file of tsxFiles) {
    if (path.basename(file) !== "page.tsx") continue;
    const relative = path.relative(appDir, path.dirname(file)).split(path.sep).join("/");
    routeToFile.set(relative ? `/${relative}` : "/", file);
  }

  function closureOf(page) {
    const seen = new Set([page]);
    const stack = [page];
    while (stack.length) {
      const current = stack.pop();
      const source = sourceByFile.get(current);
      if (!source) continue;
      for (const imported of localImports(current, source)) {
        if (!seen.has(imported)) { seen.add(imported); stack.push(imported); }
      }
    }
    return seen;
  }

  // Reverse index: every file maps to the set of page bundles (closures) it
  // belongs to, so a shared component's ids are visible from its parent page
  // and a page's ids are visible from every component it renders.
  const memberOfPages = new Map();
  for (const page of routeToFile.values()) {
    for (const member of closureOf(page)) {
      if (!memberOfPages.has(member)) memberOfPages.set(member, new Set());
      memberOfPages.get(member).add(page);
    }
  }

  function idsVisibleFrom(file) {
    const pages = memberOfPages.get(file) ?? new Set([file]);
    const ids = new Set();
    for (const page of pages) {
      for (const member of closureOf(page)) {
        const source = sourceByFile.get(member);
        if (!source) continue;
        for (const match of source.matchAll(idPattern)) ids.add(match[1]);
      }
    }
    return ids;
  }

  const broken = [];
  for (const [file, source] of sourceByFile) {
    const ids = idsVisibleFrom(file);
    for (const match of source.matchAll(hashOnlyPattern)) {
      if (!ids.has(match[1])) broken.push(`${path.relative(root.pathname, file)} -> #${match[1]}`);
    }
    for (const match of source.matchAll(crossPagePattern)) {
      const target = routeToFile.get(match[1]);
      if (!target) continue; // covered by the route-existence test above
      if (!idsVisibleFrom(target).has(match[2])) {
        broken.push(`${path.relative(root.pathname, file)} -> ${match[1]}#${match[2]}`);
      }
    }
  }
  assert.deepEqual(broken, []);
});
