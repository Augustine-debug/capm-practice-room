#!/usr/bin/env node
/*
 * Checks data/questions.json before a release.
 * Run from the project folder:  node scripts/validate.js  (or: node scripts/validate.js path/to/file.json)
 * Exit code 0 = no errors, 1 = errors found (warnings never fail the check).
 * The rules follow docs/question-schema.md.
 */
const fs = require("fs");
const path = require("path");

const FILE = process.argv[2] || path.join(__dirname, "..", "data", "questions.json"); // optional: path to another file
const LETTERS = "ABCDE";
const TASKS = {
  1: ["1.1", "1.2", "1.3", "1.4", "1.5"],
  2: ["2.1", "2.2", "2.3"],
  3: ["3.1", "3.2", "3.3", "3.4", "3.5"],
  4: ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"],
};
const MODES = ["exam", "definition"];
const STYLES = ["scenario", "knowledge", "definition", "calc"];
const MOCK_PER_DOMAIN = { 1: 54, 2: 26, 3: 30, 4: 40 }; // a 150-question mock draws this many exam questions per domain

const errors = [];
const warnings = [];
const err = (id, msg) => errors.push(`#${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`#${id}: ${msg}`);
const text = (v) => typeof v === "string" && v.trim().length > 0;

let bank;
try {
  bank = JSON.parse(fs.readFileSync(FILE, "utf8"));
} catch (e) {
  console.error(`Cannot read ${FILE}: ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(bank)) {
  console.error("questions.json must be an array of questions.");
  process.exit(1);
}

const ids = new Set();
bank.forEach((q, i) => {
  const id = q && q.id !== undefined ? q.id : `index ${i}`;

  // ids: unique and equal to position + 1 (the app looks questions up by position)
  if (!Number.isInteger(q.id)) err(id, "id must be a whole number");
  else {
    if (ids.has(q.id)) err(id, "duplicate id");
    ids.add(q.id);
    if (q.id !== i + 1) err(id, `id should be ${i + 1} (ids run 1, 2, 3… with no gaps)`);
  }

  // classification
  if (!MODES.includes(q.mode)) err(id, `mode must be one of ${MODES.join(", ")}`);
  if (!STYLES.includes(q.style)) err(id, `style must be one of ${STYLES.join(", ")}`);
  if (!TASKS[q.domain]) err(id, "domain must be 1, 2, 3 or 4");
  else if (!TASKS[q.domain].includes(q.task)) err(id, `task "${q.task}" is not an ECO 2023 task of domain ${q.domain}`);
  if (![1, 2, 3].includes(q.difficulty)) err(id, "difficulty must be 1, 2 or 3");
  if (q.context !== undefined && !text(q.context)) err(id, "context, when present, must be text");

  // question and options
  if (!text(q.question)) err(id, "question text is missing");
  const opts = Array.isArray(q.options) ? q.options : [];
  if (opts.length < 4 || opts.length > 5) err(id, "needs 4 or 5 options");
  if (!opts.every(text)) err(id, "every option needs text");
  if (new Set(opts.map((o) => String(o).trim().toLowerCase())).size !== opts.length) err(id, "two options are identical");

  // answer: one index, or a sorted list of 2+ distinct indexes for "Select two/three"
  const valid = (n) => Number.isInteger(n) && n >= 0 && n < opts.length;
  let correct = [];
  if (Array.isArray(q.answer)) {
    correct = q.answer;
    if (correct.length < 2) err(id, "a multiple-response answer needs at least 2 options");
    if (!correct.every(valid)) err(id, "answer points to an option that does not exist");
    if (new Set(correct).size !== correct.length) err(id, "answer lists the same option twice");
    if (correct.some((n, k) => k > 0 && n < correct[k - 1])) err(id, "answer list must be sorted");
  } else if (valid(q.answer)) correct = [q.answer];
  else err(id, "answer must be an option index (0 = A) or a list of them");

  // explanations: four parts, each in English and Vietnamese
  const ex = q.explanation || {};
  for (const part of ["short", "whyCorrect", "inShort"]) {
    for (const lang of ["en", "vi"]) {
      if (!ex[part] || !text(ex[part][lang])) err(id, `explanation.${part}.${lang} is missing`);
    }
  }
  const wrongLetters = opts.map((_, k) => LETTERS[k]).filter((_, k) => !correct.includes(k));
  for (const lang of ["en", "vi"]) {
    const ww = (ex.whyWrong && ex.whyWrong[lang]) || null;
    if (!ww || typeof ww !== "object") { err(id, `explanation.whyWrong.${lang} is missing`); continue; }
    for (const L of wrongLetters) if (!text(ww[L])) err(id, `explanation.whyWrong.${lang} has no reason for wrong option ${L}`);
    for (const L of Object.keys(ww)) if (!wrongLetters.includes(L)) err(id, `explanation.whyWrong.${lang} explains ${L}, which is not a wrong option`);
  }

  // optional extras
  if (q.pmbok8Note !== undefined && !text(q.pmbok8Note)) err(id, "pmbok8Note, when present, must be text");

  // source and licence
  const s = q.source || {};
  if (!["own", "cc"].includes(s.type)) err(id, 'source.type must be "own" or "cc"');
  if (!text(s.text)) err(id, "source.text is missing");
  if (s.type === "cc") {
    if (!text(s.license) || !/^CC BY/.test(s.license)) err(id, "a CC question needs source.license (e.g. CC BY-NC 4.0)");
    if (!text(s.url) || !/^https?:\/\//.test(s.url)) err(id, "a CC question needs source.url");
  }

  // soft checks
  if (correct.length === 1 && opts.length) {
    const len = opts.map((o) => String(o).length);
    const longest = Math.max(...len);
    if (len[correct[0]] === longest && len.filter((l) => l === longest).length === 1 && longest > 1.5 * Math.min(...len))
      warn(id, "the correct option is much longer than the others, which can give the answer away");
  }
});

// cross-question checks
bank.forEach((q) => {
  if (q.related === undefined) return;
  if (!ids.has(q.related)) err(q.id, `related points to #${q.related}, which does not exist`);
  else if (q.related === q.id) err(q.id, "related points to itself");
});
for (const d of [1, 2, 3, 4]) {
  const n = bank.filter((q) => q.mode === "exam" && q.domain === d).length;
  if (n < MOCK_PER_DOMAIN[d]) errors.push(`domain ${d}: only ${n} exam questions, a full mock needs ${MOCK_PER_DOMAIN[d]}`);
}

// report
const count = (f) => bank.filter(f).length;
console.log(`Questions: ${bank.length} (${count((q) => q.mode === "exam")} exam, ${count((q) => q.mode === "definition")} definition)`);
console.log(
  "Exam questions by domain: " +
    [1, 2, 3, 4].map((d) => `D${d} ${count((q) => q.mode === "exam" && q.domain === d)}`).join(" · ")
);
console.log(`Sources: ${count((q) => q.source && q.source.type === "own")} original, ${count((q) => q.source && q.source.type === "cc")} CC-licensed`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log("  ! " + w));
}
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.log("  ✗ " + e));
  console.log("\nFAILED");
  process.exit(1);
}
console.log("\nOK: no errors");
