#!/usr/bin/env node
/*
 * Writes data/questions.csv from data/questions.json, so the bank can be read as a table
 * (GitHub shows CSV files as a searchable table; Excel and Google Sheets open it directly).
 * The JSON file is the source of truth: never edit the CSV by hand, run this script instead.
 *   node scripts/export-csv.js
 * scripts/validate.js fails if the CSV is out of date.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const JSON_FILE = path.join(ROOT, "data", "questions.json");
const CSV_FILE = path.join(ROOT, "data", "questions.csv");
const LETTERS = "ABCDE";
const LEVELS = { 1: "Basic", 2: "Intermediate", 3: "Advanced" };

const HEADER = [
  "id", "mode", "style", "domain", "task", "difficulty", "context", "question",
  ...[...LETTERS].map((l) => `option_${l}`),
  "answer", "explanation_en", "explanation_vi", "in_short_en", "in_short_vi",
  "source_type", "source", "source_license",
];

function cell(v) {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCsv(bank) {
  const rows = bank.map((q) => {
    const ex = q.explanation || {};
    const ans = (Array.isArray(q.answer) ? q.answer : [q.answer]).map((i) => LETTERS[i]).join(" ");
    return [
      q.id, q.mode, q.style, q.domain, q.task, LEVELS[q.difficulty] || q.difficulty, q.context, q.question,
      ...[...LETTERS].map((_, i) => q.options[i]),
      ans,
      ex.short && ex.short.en, ex.short && ex.short.vi,
      ex.inShort && ex.inShort.en, ex.inShort && ex.inShort.vi,
      q.source && q.source.type, q.source && q.source.text,
      q.source && q.source.license,
    ];
  });
  return [HEADER, ...rows].map((r) => r.map(cell).join(",")).join("\n") + "\n";
}

module.exports = { buildCsv, CSV_FILE, JSON_FILE };

if (require.main === module) {
  const bank = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));
  fs.writeFileSync(CSV_FILE, buildCsv(bank));
  console.log(`Wrote ${path.relative(ROOT, CSV_FILE)}: ${bank.length} questions`);
}
