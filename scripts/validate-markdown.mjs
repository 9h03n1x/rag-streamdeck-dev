import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const includeRoots = ["README.md", "CONTRIBUTING.md", "knowledge-base"];
const errors = [];

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function walk(entry) {
  const absolute = path.join(root, entry);
  if (!fs.existsSync(absolute)) return [];

  const stat = fs.statSync(absolute);
  if (stat.isFile()) return entry.endsWith(".md") ? [absolute] : [];

  const results = [];
  for (const child of fs.readdirSync(absolute)) {
    results.push(...walk(path.join(entry, child)));
  }
  return results;
}

function stripAnchor(target) {
  const hashIndex = target.indexOf("#");
  return hashIndex >= 0 ? target.slice(0, hashIndex) : target;
}

function isExternalLink(target) {
  return /^(https?:|mailto:|tel:|streamdeck:)/i.test(target);
}

function validateFile(filePath) {
  const relative = toPosix(path.relative(root, filePath));
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/);
  const headingLines = lines.filter((line) => line.startsWith("# "));
  const contentLines = [...lines];

  if (contentLines[0]?.trim() === "---") {
    const endIndex = contentLines.slice(1).findIndex((line) => line.trim() === "---");
    if (endIndex >= 0) {
      contentLines.splice(0, endIndex + 2);
    }
  }

  const firstContentLine = contentLines.find((line) => line.trim().length > 0) ?? "";

  if (!firstContentLine.startsWith("# ")) {
    errors.push(`${relative}: document must start with a single H1 heading`);
  }

  if (headingLines.length === 0) {
    errors.push(`${relative}: expected at least one H1 heading`);
  }

  if (/<<<<<<<|=======|>>>>>>>/.test(text)) {
    errors.push(`${relative}: contains merge conflict markers`);
  }

  const baseName = path.basename(filePath);
  if (relative.startsWith("knowledge-base/") && !/^[a-z0-9][a-z0-9-]*\.md$/.test(baseName)) {
    const allowed = new Set(["README.md", "INDEX.md", "CHANGELOG.md", "GETTING_STARTED.md", "QUICK_REFERENCE.md", "DEPLOYMENT.md"]);
    if (!allowed.has(baseName)) {
      errors.push(`${relative}: markdown file names should use lowercase kebab-case`);
    }
  }

  const linkPattern = /(?<!!)\[[^\]\n]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of text.matchAll(linkPattern)) {
    const rawTarget = match[1];
    if (!rawTarget || rawTarget.startsWith("#") || isExternalLink(rawTarget)) continue;

    const targetWithoutAnchor = stripAnchor(decodeURIComponent(rawTarget));
    if (!targetWithoutAnchor || !targetWithoutAnchor.endsWith(".md")) continue;

    const resolved = path.resolve(path.dirname(filePath), targetWithoutAnchor);
    if (!resolved.startsWith(root) || !fs.existsSync(resolved)) {
      errors.push(`${relative}: broken markdown link '${rawTarget}'`);
    }
  }
}

const files = includeRoots.flatMap(walk).sort();
for (const file of files) validateFile(file);

if (errors.length > 0) {
  console.error(`Markdown validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Markdown validation passed for ${files.length} file(s).`);
