#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const SRC = path.join(__dirname, "../src");

const EXPORT_PATHS = {
  AppButton: "@/components/atoms/AppButton",
  AppInput: "@/components/atoms/AppInput",
  AppChip: "@/components/atoms/AppChip",
  AvatarBadge: "@/components/atoms/AvatarBadge",
  IconButton: "@/components/atoms/IconButton",
  ShadowCard: "@/components/atoms/ShadowCard",
  NumpadGrid: "@/components/atoms/NumpadGrid",
  NumpadButton: "@/components/atoms/NumpadButton",
  TextBody: "@/components/atoms/Typography",
  TextBodyLg: "@/components/atoms/Typography",
  TextBodySm: "@/components/atoms/Typography",
  TextCaption: "@/components/atoms/Typography",
  TextDisplay: "@/components/atoms/Typography",
  TextDisplayLg: "@/components/atoms/Typography",
  TextDisplayXl: "@/components/atoms/Typography",
  TextH1: "@/components/atoms/Typography",
  TextH2: "@/components/atoms/Typography",
  TextH3: "@/components/atoms/Typography",
  TextMicro: "@/components/atoms/Typography",
  FilterChip: "@/components/molecules/FilterChip",
  SearchBar: "@/components/molecules/SearchBar",
  SectionCard: "@/components/molecules/SectionCard",
  PageHeader: "@/components/molecules/PageHeader",
  DottedSeparator: "@/components/molecules/DottedSeparator/index",
  SuggestionChip: "@/components/molecules/SuggestionChip",
  BottomBar: "@/components/layout/BottomBar",
  SplitLayout: "@/components/layout/SplitLayout",
};

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function transform(content) {
  const importRegex =
    /import\s+\{([^}]+)\}\s+from\s+["']@\/components["'];?/g;

  let changed = false;
  const next = content.replace(importRegex, (full, specifiersBlock) => {
    changed = true;
    const specifiers = specifiersBlock
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const grouped = new Map();
    for (const spec of specifiers) {
      const name = spec.split(/\s+as\s+/)[0].trim();
      const target = EXPORT_PATHS[name];
      if (!target) {
        console.warn(`Unknown export: ${name}`);
        continue;
      }
      if (!grouped.has(target)) grouped.set(target, []);
      grouped.get(target).push(spec);
    }

    return [...grouped.entries()]
      .map(([from, specs]) => `import { ${specs.join(", ")} } from "${from}";`)
      .join("\n");
  });

  return changed ? next : content;
}

const files = walk(SRC);
let updated = 0;
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  if (!content.includes('from "@/components"')) continue;
  const next = transform(content);
  if (next !== content) {
    fs.writeFileSync(file, next);
    updated += 1;
    console.log("updated", path.relative(SRC, file));
  }
}

console.log(`Done. Updated ${updated} files.`);
