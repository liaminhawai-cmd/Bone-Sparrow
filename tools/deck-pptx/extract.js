/* Reads the content block of a projector deck (SLIDES, FRAME and the line-art
   ICONS) straight out of its .html file and writes a slide-by-slide spec that
   build.ps1 turns into a .pptx. The HTML deck stays the one source: edit the
   deck, then rebuild the PowerPoint.

   Usage (from the repo root):
     node tools/deck-pptx/extract.js SentenceFluencyDeck.html
     powershell -ExecutionPolicy Bypass -File tools/deck-pptx/build.ps1 SentenceFluencyDeck

   Writes tools/deck-pptx/out/<name>.json and one .svg per icon used. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");

const src = process.argv[2];
if(!src){ console.error("Give the deck file, e.g. SentenceFluencyDeck.html"); process.exit(1); }
const html = fs.readFileSync(src, "utf8");
const name = path.basename(src, ".html");

/* Everything from the content block to the end of lengthAns() is plain data
   and pure functions, so it can run outside a browser. */
const from = html.indexOf("const SLIDES = [");
const to = html.indexOf("function problems(");
if(from < 0 || to < 0) throw new Error("Could not find the content block in " + src);
/* A deck without length slides has no words() or lengthAns(); a deck without
   poem slides has no rowsOf(). Each is optional. */
const opt = n => `typeof ${n} === "undefined" ? null : ${n}`;
const code = html.slice(from, to) + `\n;({SLIDES, FRAME, ICONS, TAGS, RUN, words: ${opt("words")}, lengthAns: ${opt("lengthAns")}, rowsOf: ${opt("rowsOf")}});`;
const D = vm.runInNewContext(code, {});

/* Markup into runs: [{t:"Your cuff", k:"s"}, {t:" brushed ", k:""}, ...] */
function runs(m){
  const out = []; let last = 0;
  m.replace(D.RUN, (x, k, t, at) => {
    if(at > last) out.push({t: m.slice(last, at), k: ""});
    out.push({t, k});
    last = at + x.length;
    return x;
  });
  if(last < m.length) out.push({t: m.slice(last), k: ""});
  return out;
}
const plainRuns = m => [{t: m.replace(D.RUN, (x, k, t) => t), k: ""}];
const notes = sl => (sl.notes || []).map(r => r[0] + ": " + r[1]).join("\r");

const states = [];
D.SLIDES.forEach((sl, i) => {
  const n = i + 1;
  if(sl.kind === "title"){
    states.push({ n, kind: "title", bg: "FFFFFF", h: D.FRAME.know, sub: sl.h, icons: ["book"],
      rule: runs(sl.rule), key: sl.key, foot: "", notes: notes(sl) });
    return;
  }
  if(sl.kind === "sentence"){
    states.push({ n, kind: "sentence", rev: false, bg: "F7F0F1", h: D.FRAME.count, sub: D.FRAME.countSub,
      icons: ["f1","f2"], sent: plainRuns(sl.m), src: sl.src, ans: [], foot: D.FRAME.vote, notes: notes(sl) });
    states.push({ n, kind: "sentence", rev: true, bg: "FFFFFF", h: D.FRAME.reveal, sub: "",
      icons: ["think"], sent: runs(sl.m), src: sl.src, ans: sl.ans.map(runs), foot: "legend", notes: notes(sl) });
    return;
  }
  if(sl.kind === "go"){
    states.push({ n, kind: "go", bg: "FFFFFF", h: sl.h, sub: sl.mod, icons: ["book"], line: sl.line,
      foot: "", notes: notes(sl) });
    return;
  }
  if(/^(poem|vote|move)$/.test(sl.kind)){
    /* Rows come from the deck's own rowsOf(), so the PowerPoint shows what the page shows. */
    const rowState = rev => D.rowsOf(sl, rev).map(r => r.type === "line"
      ? { type: "line", no: r.no, runs: r.runs, tag: r.tagOn ? r.tag : [], tagSpace: r.tag, hit: r.hit, hidden: r.hidden }
      : r);
    const base = { n, kind: "rows", src: sl.src, notes: notes(sl) };
    const isVote = sl.kind === "vote";
    states.push(Object.assign({}, base, { rev: false, bg: isVote ? "F7F0F1" : "FFFFFF",
      h: isVote ? sl.ask : sl.h, sub: isVote ? sl.key : (sl.sub || ""),
      icons: isVote ? [1, 2, 3, 4].slice(0, sl.fingers).map(j => "f" + j) : ["book"],
      rows: rowState(false), ans: [], foot: isVote ? D.FRAME.vote : "" }));
    const rv = Object.assign({}, base, { rev: true, bg: "FFFFFF", h: D.FRAME.reveal, sub: isVote ? sl.ask : sl.h,
      icons: ["think"], rows: rowState(true), ans: sl.ans.map(a => [{ t: a, k: "" }]), foot: "" });
    if(sl.kind === "move") rv.footRuns = D.FRAME.legend.map(l => ({ t: l[1], k: l[0] }));
    states.push(rv);
    return;
  }
  if(sl.kind === "length"){
    const counts = sl.sentences.map(D.words);
    const nums = sl.sentences.map((s, j) => "f" + (j + 1)).filter(k => D.ICONS[k]);
    const base = { n, kind: "length", sentences: sl.sentences, counts, lands: sl.lands, src: sl.src, notes: notes(sl) };
    states.push(Object.assign({}, base, { rev: false, bg: "F7F0F1", h: sl.ask, sub: sl.key, icons: nums,
      ans: [], foot: D.FRAME.vote }));
    states.push(Object.assign({}, base, { rev: true, bg: "FFFFFF", h: D.FRAME.reveal, sub: sl.ask, icons: ["think"],
      ans: D.lengthAns(sl).map(runs), foot: "" }));
  }
});

const outDir = path.join(__dirname, "out");
fs.mkdirSync(outDir, { recursive: true });
const used = new Set(states.flatMap(s => s.icons));
used.forEach(k => {
  if(!D.ICONS[k]) throw new Error("No icon called " + k);
  /* PowerPoint wants a standalone SVG with a size. */
  const svg = D.ICONS[k].replace("<svg ", '<svg width="256" height="256" ').replace(/ focusable="false"/, "");
  fs.writeFileSync(path.join(outDir, k + ".svg"), svg);
});
const spec = { name, code: D.FRAME.code, tags: D.TAGS, states };
fs.writeFileSync(path.join(outDir, name + ".json"), JSON.stringify(spec, null, 1));
console.log(`${name}: ${D.SLIDES.length} slides, ${states.length} PowerPoint slides, icons ${[...used].join(", ")}`);
