#!/usr/bin/env node
/* Senior High Economics regression (no dependencies):
   node tests/economics.js
   Guards the Maths/Physics/Chemistry treatment of Economics: every unit
   carries word-problem and challenge banks on top of the calculations
   sheet, the enquiry project ships by default, worksheets are deterministic
   and the teacher key carries the new sections — and the study notes draw
   the same kind of hand-drawn figures that Physics and Chemistry carry:
   every {k:"fig"} reference must resolve to a registered generator whose
   output is a clean self-contained SVG. */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const app = read("app.js");
const html = read("index.html");
const context = {
  console,
  PACK_COVER: (opts, cover) => [
    { k: "p", t: cover.title }, { k: "p", t: cover.line }
  ]
};
context.window = context;
vm.createContext(context);
function load(file) {
  vm.runInContext(read(file), context, { filename: file });
}
function section(start, end) {
  const a = app.indexOf(start), b = app.indexOf(end, a);
  assert(a >= 0 && b > a, "app source section exists: " + start);
  vm.runInContext(app.slice(a, b), context);
}
load("data-ec.js");
load("gen-ss.js");
section("var SUBJECTS =", "/* ---------------- education bands");
section("/* ---------------- Study Notes & Explanations", "/* ---------------- session mode");

console.log("\n-- registry and wiring --");
const subject = context.SUBJECTS.ec;
assert(subject, "Economics is registered in the regular curriculum");
assert.equal(subject.label, "Economics");
assert(!subject.wa, "Economics must not be hidden behind the WASSCE track");
assert.equal(subject.curriculum(), context.EC_CURRICULUM);
assert.equal(subject.engine(), context.GEN_SS);
["word", "challenge", "project"].forEach(function (id) {
  assert(subject.defaults.includes(id),
    "Economics default worksheets include " + id + " (like Maths/Physics/Chemistry)");
});
assert(read("icons.svg.html").includes('id="i-' + subject.icon + '"'));
for (const file of ["data-ec.js", "gen-ss.js", "app.js", "figures.js"]) {
  assert(html.includes(read(file).trim()), file + " is included in the rebuilt offline deliverable");
}
assert(read("build.sh").includes("data-ec.js"), "future builds retain Economics");
["word", "challenge", "project"].forEach(function (id) {
  assert(app.includes("\n    " + id + ":") || app.includes(id + ":\""),
    "sheet picker has a help blurb for " + id);
});

console.log("\n-- curriculum shape: 18 units, full exercise banks --");
const units = subject.curriculum();
assert.equal(units.length, 18);
const periods = ["I", "II", "III", "IV", "V", "VI"];
units.forEach((unit, i) => {
  const label = "Grade " + unit.grade + " Period " + unit.period;
  assert.equal(unit.grade, 10 + Math.floor(i / 6), label);
  assert.equal(unit.period, periods[i % 6], label);
  assert(unit.study.length >= 8, label + " keeps its transcribed course text");
  assert(unit.terms.length >= 5 && unit.facts.length >= 5 && unit.tf.length >= 5,
    label + " keeps enough items for full period tests");
  assert(unit.worked.length >= 5, label + " calculations bank (the Physics/Chemistry sheet)");
  assert(unit.casestudy.questions.length >= 3 && unit.project.steps.length >= 3,
    label + " case study and enquiry project (Classify/Investigation equivalents)");
  assert.equal(unit.word.length, 8, label + " carries 8 word problems");
  assert.equal(unit.challenge.length, 4, label + " carries 4 challenge questions");
  for (const v of unit.word.concat(unit.challenge)) {
    assert(v.q.length >= 20, label + " full-sentence question: " + (v.q || "").slice(0, 40));
    assert(v.a.length >= 10, label + " explained answer for: " + v.q.slice(0, 40));
  }
});

console.log("\n-- study notes draw figures like the sciences do --");
load("figures.js");
const FIG = context.window.FIG;
assert(FIG && typeof FIG === "object", "the offline figure library loads");
const econKeys = Object.keys(FIG).filter(k => k.indexOf("econ-") === 0);
assert(econKeys.length >= 30, "the library carries a full set of economics graphs and diagrams");
let figCount = 0;
units.forEach(unit => {
  const label = "Grade " + unit.grade + " Period " + unit.period;
  const figs = unit.study.filter(b => b.k === "fig");
  assert(figs.length >= 1, label + " study notes carry at least one drawn figure");
  figCount += figs.length;
  for (const b of figs) {
    assert(/^[a-z0-9-]+$/.test(b.f || ""), label + " figure key well-formed: " + b.f);
    assert(b.f.indexOf("econ-") === 0, label + " figures are namespaced econ-*: " + b.f);
    assert.equal(typeof FIG[b.f], "function",
      label + " figure key resolves to a generator: " + b.f);
    assert(b.cap && b.cap.length >= 30,
      label + " figure keeps a real caption (printed in the Word export): " + b.f);
  }
});
assert.equal(figCount, 38, "all 38 anchored figures are in place across the 18 units");
for (const k of econKeys) {
  const s = FIG[k]();
  assert(/^<svg[\s\S]*<\/svg>$/.test(s), k + " returns a single self-contained SVG");
  assert(!/NaN|undefined/.test(s), k + " draws without arithmetic slip-ups");
  assert(s.indexOf('aria-label="') > 0, k + " stays accessible to screen readers");
}
assert(!econKeys.some(k => units.every(u => !u.study.some(b => b.f === k))),
  "every registered econ-* figure is actually used by the notes");

console.log("\n-- pack builds the Maths-style sheets, seeded and keyed --");
function build() {
  return subject.engine().buildPack({
    seed: 7, grade: 12, topics: ["IV"], sheets: subject.defaults.slice(),
    curriculum: subject.curriculum(), subjectName: "ECONOMICS",
    subjectLine: "Economics", bandName: "Senior High",
    perEx: 8, tests: true, exam: true, keys: true
  });
}
const pack = build();
const heads = pack.blocks.filter(b => b.k === "h3").map(b => b.t);
["A · Key Terms", "F · Multiple Choice",
  "L · Calculations and Data",            // show-your-working, as in the sciences
  "O · Word Problems — Economics in Daily Life",
  "P · Challenge — Think It Through",
  "G · Classification", "H · Map Work and Chart",
  "I · Case Study", "K · Enquiry Project",
  "J · Think and Apply"].forEach(function (h) {
  assert(heads.some(t => t.startsWith(h)), "pack includes sheet: " + h);
});
const wordSheet = pack.blocks.filter(b => b.k === "h3" && b.t.startsWith("O ·"));
assert.equal(wordSheet.length, 2, "word-problems sheet appears in the workbook and again in the key");

/* teacher key reproduces every new section; student pack omits keys entirely */
const keyStart = pack.blocks.findIndex(b => b.t === "ANSWER KEYS — TEACHER'S COPY");
assert(keyStart > 0, "teacher copy carries the answer-key section");
const keyHeads = pack.blocks.slice(keyStart).filter(b => b.k === "h3").map(b => b.t);
["O · Word Problems — Economics in Daily Life", "P · Challenge — Think It Through",
  "K · Enquiry Project"].forEach(function (h) {
  assert(keyHeads.some(t => t.startsWith(h)), "answer key carries " + h);
});
const student = subject.engine().buildPack({
  seed: 7, grade: 12, topics: ["IV"], sheets: subject.defaults.slice(),
  curriculum: subject.curriculum(), subjectName: "ECONOMICS",
  subjectLine: "Economics", bandName: "Senior High",
  perEx: 8, tests: true, exam: true, keys: false
});
assert(!student.blocks.some(b => String(b.t || "").includes("ANSWER KEYS")),
  "student pack never carries the answer key");

/* deterministic: the same seed reproduces the whole pack question for question */
assert.deepEqual(build(), pack, "same seed rebuilds the identical Economics pack");

/* the shared engine stays safe for subjects without the new banks */
load("data-ss.js");
load("data-ss79.js");
const ssPack = context.GEN_SS.buildPack({
  seed: 7, grade: 4, topics: ["I"], sheets: subject.defaults.slice(),
  subjectName: "SOCIAL STUDIES", subjectLine: "Social Studies",
  bandName: "Elementary", perEx: 8, tests: true, exam: false, keys: true
});
assert(!ssPack.blocks.some(b => b.k === "h3" && /Word Problems|Challenge — Think/.test(b.t)),
  "word/challenge sheets stay silent where a subject carries no such bank");

/* lesson-plan mining sees the new exercise names */
assert(read("lesson.js").includes('"word"') && read("lesson.js").includes("word problems"),
  "lesson plans can mine the word-problem bank");
console.log("\nEconomics: all checks passed — exercise sheets and drawn figures match Maths, Physics and Chemistry.");
