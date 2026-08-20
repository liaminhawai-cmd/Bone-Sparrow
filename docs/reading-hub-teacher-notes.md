# The Bone Sparrow — interactive hubs: teacher notes

Two companion interactives, same suite as the **Pre-reading Trainer** and **Grammar Hub**: mastery loop, **first-attempt-only scoring**, printable reports with verification codes, single offline files. The whole suite is hosted on **GitHub Pages** (deployed by `.github/workflows/pages.yml`, which publishes only the hub HTML files plus the landing page `index.html` — never the lesson resources or PDFs. In repo Settings → Pages, set Source to **GitHub Actions** so this curated deploy is the only publisher):

**Send students to one address only: https://liaminhawai-cmd.github.io/Bone-Sparrow/**

That front door is a three-step gateway — (1) first name, last name, student code; (2) EAL yes/no plus language, and the chapter they've read to; (3) the two tasks that matter today. It writes a **shared profile** (`bonesparrow.profile.v1`), so students sign in **once for the whole suite** — both hubs adopt it silently, and if a student changes their chapter inside a hub it flows back to the front door. Nothing else is linked from it: the Grammar Hub appears only when a hub sends a student there with a specific job, and the pre-reading vocabulary is now the first set *inside* the Vocab Hub rather than a separate app.

Every hub screen carries a **⌂ Main menu** link, so nothing traps a student mid-activity.

| File | Live page | What it is |
|---|---|---|
| `index.html` | (the address above) | Sign-in, settings, and today's tasks |
| `BoneSparrowReadingHub.html` | …/BoneSparrowReadingHub.html | Reading, inference, voice & evidence skills |
| `BoneSparrowVocabHub.html` | …/BoneSparrowVocabHub.html | Vocabulary: "before you read" set + chapter by chapter |
| `GrammarHuboffline.html` | …/GrammarHuboffline.html | Grammar Hub — reached only from a hub's coded feedback |
| `bonesparrowtrainer.html` | …/bonesparrowtrainer.html | The old Pre-reading Trainer, kept so existing links still work; its vocabulary now lives in the Vocab Hub and its sentence work in the Grammar Hub |
| `BoneSparrowWagollSheets.html` | …/BoneSparrowWagollSheets.html | Print masters: the analytical writing WAGOLL as one A3 sheet per level, Foundation to Level 10 |
| `BoneSparrowWagollWall.html` | …/BoneSparrowWagollWall.html | The full WAGOLL wall on screen, Levels 5 to 9, opening once a student has finished the workshop |

Pages redeploys automatically on push when any hub file changes. Note the trade-off: the Pages site is public, so it holds only short page-referenced extracts (see the copyright note below).

Both gates: **first name + last name + student ID (4–8 chars) before anything starts**; details print on the report with a verification code.

**Reports are never gated.** The front door has a persistent **My reports** link (from sign-in onward, on every step) showing a snapshot of both hubs — reading first-attempt score, words mastered — with deep links straight into each hub's full printable report (`…ReadingHub.html#report`). Inside the hubs, "My report" sits in the top bar on every screen, and the old "finish 3 activities first" lock is gone.

Both carry a **"Where are you up to?" chapter selector** — content past the student's reading position stays hidden (no spoilers). The vocab hub unlocks each chapter set one chapter early so words can be pre-taught.

## Reading & Evidence Hub — modules vs the proposed FTs

| Module | Team proposal (22 July) |
|---|---|
| Quickreads ×2 (ch 1, ch 5) — passage hides, questions run cold, misses retaught with the exact line re-quoted | Reading FT 1: cold-excerpt inference check |
| Figurative → literal (plain-English paraphrase, then name the technique) | Reading FT 2 (Lesson 09) |
| Voice fingerprint (line → speaker → the giveaway feature) | Reading FT 4, the lesson before the voice memo |
| Evidence builder (click evidence in the passage → explain relevance → embed a trimmed quote; the *Use of evidence* continuum ladder unlocks stems as they climb) | FT1 retooled to serve reading |
| **Analysis workshop** — Part A: students **build the WAGOLL wall** by placing five authored responses against the CAT rubric's level 5–9 descriptors, laid out **horizontally like the EAL WAGOLL table** and **colour-coded on your convention** (blue = language feature, orange = analytical verb, yellow = embedded evidence, green = effect on the reader). The weakest response is almost bare of colour and the strongest is full — that density *is* the argument. Part B: **the climb** — students write one simple Level 5 sentence, then rejig that same sentence up the rubric. Each level changes the bank underneath it: new tiles unlock and outgrown ones retire (at Level 7 "shows" is literally removed and flagged in your sentence), and each level's wording is snapshotted so the versions stack under the rubric, EAL-WAGOLL style. Tiles **drag to reorder**, and the checker reads word order, not just presence | Bridges to Unit 6 as skill-based tasks |

## Quickreads 3-8, and the gate in front of them

Six more quickreads sit after the Analysis workshop: chapters 6, 8, 10, 14, 17
and 20, so there is one for roughly every second or third chapter across the
taught range. Same mechanic as the first two, with a second phase on the end.

**Reading position is the only lock on them.** They sit after the workshop in
the list, because the workshop is where the evidence-to-idea move is taught, but
nothing holds them shut: you decide the order, and a class that has not reached
the workshop can still read. A student who has read to chapter 10 sees three of
the six, and the rest stay hidden so nothing spoils the novel.

The machinery for a lock is still there. Any module can declare `needs:"<id>"`
and the home screen holds it shut with the reason on the button, naming the
module it is waiting on. The Analysis workshop still uses it, on the evidence
builder.

**The second phase: connect evidence to ideas.** Each of the six ends with two
`links` items. Step one gives an idea about the novel and four real lines, one
of which proves it. Step two asks what makes that line the proof, and the
distractors there are the answers students actually give: "it is shocking", "it
shows she is angry", "it uses 'like', so it is a simile". Both steps are scored
as first attempts, and both draw parallel items from the redundancy bank on a
miss, so a wrong answer hands back a different idea to prove rather than the
same one with the options shuffled.

**The passages are shorter than the first two on purpose.** Chapters 1 and 5 are
reproduced at length in `Lesson Resources/Bone Sparrow extracts for grammar.docx`;
the later chapters are not, so these six quote the short page-referenced
extracts that appear in the unit's own resources and in the publisher packs
(chapter 6 at p 43, chapter 14 at p 96, chapter 17 at p 113, and so on). A
three-sentence passage still hides when the questions start, and short extracts
are what the statutory licence covers. Two things follow. **Page numbers differ
between editions**: the lesson documents put chapter 6 at p 43 and the Question
Booklet puts it at pp 51-57, so the quickreads cite the CHAPTER on screen and
keep the page in a comment beside the extract. And **the extracts are worth a
skim against your own copy** as you teach each band, the same caveat the vocab
hub carries.

**A miss costs you a new question, not the same one.** Both hubs now run a redundancy bank. In the reading hub, missing a question requeues a *parallel* item — same skill, same passage where possible, different material — and a fresh one again each time it's missed, so the only way out of the loop is to do the skill rather than remember which option was highlighted. In the vocab hub, a missed word comes back from a different angle (another authored task, or a generated word-sum / morpheme-meaning / meaning-match on the same word). Parallel items are never scored: the report still shows first attempts on the real set, so the loop is a consequence, not a punishment on paper.

**Word order is checked, not just ingredients.** The builder's grammar pass is order-aware: verb before subject, effect clause landing before the verb, two verbs side by side, sentences that start on a joiner or end on a verb, and quotations dropped in without a lead-in all get named specifically ("Your verb comes before your subject. Drag the subject in front of it — read it aloud and you'll hear it"). Because tiles drag, the fix is a rearrangement rather than a restart.

**Grammar can't be gamed.** The evidence-builder quote banks now include options that read perfectly smoothly but misreport the text (Subhi's counter-view quoted under an "Eli believes…" stem; a Maá line attributed to Queeny; cruelty evidence answering a different question). The discriminator is meaning, and every trap has coded feedback. The workshop's Part B validates what a sentence is *made of* (specific subject, analytic verb, harvested quote matching the chosen focus, idea clause) — many genuinely different strong sentences pass; students read their own sentence back for flow.

**EAL toggle** — adds C-band equivalents (C2 Describe / C3 Explain / C4 Analyse, from the EAL WAGOLL) under the Vic-curriculum wall descriptors, plus a pattern hint in the builder. Off by default; the mainstream labels are the CAT rubric's own.

**Strategic hub links** — no generic link wall. Pointers appear only where a specific failure calls for them, with exact instructions: two grammar-flow failures in the embed step → "open Grammar Hub → Sentence Structure, run one round at your level, then rebuild this sentence"; a sub-60% quickread → "open Vocab Hub → CH 1-2, run 'Meet the words' and 'Build the words', then retry." Links resolve to files when the hub is opened from the class folder, to the live pages on the web.

**Workshop kept sentences** print on the student's report.

## Vocab Hub

The Water-in-the-World engine, re-keyed. First set is **"Before you read · the words of the unit"** — the old pre-reading vocabulary (refugee, asylum seeker, persecution, incarceration, bureaucracy, trauma, dispossessed, immigration), always open, built on the look-alike discrimination that trainer was good at (persecution/prosecution, incarceration/incineration/incarnation, immigration/emigration). Then 9 chapter sets (1–2, 3–4, 5, 6–7, 8–10, 11–14, 15–17, 18–20, 21–end), 6 words each — meaning, morpheme tiles or word-origin question, etymology note, 2 story-anchored apply tasks per word. Domains: **the camp / story & memory / feelings & the body / the outside world**. Base-camp and stretch tiers are authored for the first three sets (same morphemes in smaller/bigger words); later sets can have tiers added in the data spine any time. Key-word translations in the five languages of our EAL cohort (Mandarin, Cantonese, Vietnamese, Arabic, Farsi) appear on study cards and build reveals only — practice stays in English. Spaced review warms up each new set with previously **met** words, weighted toward past misses.

**No etymology gates.** Words that can't be cut into morphemes (asylum seeker, trauma, compound, doona, Rohingya…) are checked with a **plain meaning-match** — "What does *trauma* mean?" — not a recall question about Greek or Old English. The etymology is still there, but as the *explanation after the answer*, where it's a reward rather than a barrier. Base-camp and stretch build tasks now also show the target word's meaning as the clue before you build (previously it showed only "?", so students tapped tiles blind).

**The word list.** Every encounter with a word — building it from morphemes, using it in an apply task, meeting it again in a review — updates one running record that outlives the lesson (`wstat`). Two correct encounters in a row marks a word **mastered**; a single miss breaks the streak and un-masters it. Unmastered words are then weighted heavily back into every later review, so nothing quietly drops out of circulation. Students see the list three ways: a summary on the hub home ("28 words · 19 mastered · 6 to fix · 3 not drilled yet"), a per-word chip on the Word list screen (mastered / needs work (missed ×2) / not met yet) with a per-set tally in each heading, and a **Drill my unmastered words** button that goes straight at the outstanding ones. The report prints the same summary and names the words still in circulation.

**Verification note:** chapter placements and story anchors were built from the unit's own chapter summaries and the Question Booklet; the words themselves are unit/theme vocabulary rather than page-referenced quotations, so nothing depends on a specific edition. Worth a skim against your copy as you teach each band.

## Copyright note

Passages are short page-referenced extracts already used in the unit's printed resources (`Bone Sparrow extracts for grammar.docx`, `06e - Chapter 5 silent starter.docx`), reproduced for enrolled students under the school's Statutory Text and Artistic Works Licence (Copyright Agency). Do **not** add whole chapters; keep the repo private. There is no legitimate route to a DRM-free full ebook for redistribution — type the short passages you need from your own copy.

## Adding content

All content sits in bannered `const` blocks at the top of each file — the engines know nothing about the novel. Reading hub: add a quickread by copying an entry in `QUICKREADS` (each item needs `id`, `q`, `opts`, `a`, `explain`, and the `line` to re-quote on a miss, plus a `ch` tag for spoiler-gating). Vocab hub: copy a lesson object in `LESSONS` (six words minimum per set — the generated distractors need them; hyphens type the tiles: `de-` prefix, `-tion` suffix, bare = root; every item `id` globally unique).

## The analytical writing WAGOLL, on paper

`BoneSparrowWagollSheets.html` prints the same ladder the Analysis workshop
climbs, one **A3 portrait** sheet per rung, **Foundation to Level 10**. Open it
and print from the browser; the page carries its own `@page` size, so the only
thing to check in the print dialogue is that scaling is at 100% and background
graphics are on.

It is built the way the History family's Batman level sheets are built, and for
the same reason: a student who is not yet at the expected level needs to see
what the rung below them looks like, written out, rather than a rubric line
telling them they are not there yet.

Each sheet carries the question, the passage, what a student at that rung
already knows, the worked example with every phrase marked, what each marked
phrase does, and the continuum wording for that level.

- **Eight rungs.** Foundation to Level 2 and Levels 3 and 4 are the Victorian
  Curriculum's own two-year bands, then Levels 5 to 10 one at a time. Level 7
  carries the "expected at Year 7" badge.
- **Five criteria, and they arrive one at a time.** The idea, the language
  feature, the analytical verb, the embedded evidence, the effect on the reader,
  in the workshop's colours exactly: blue, purple, orange, yellow, green. The
  Foundation sheet names two of the five and says so in the key. That is the
  ladder working, not a sheet with holes in it, and the lower sheets print what
  the next rung adds rather than padding the space.
- **A different passage from the workshop's.** The workshop models chapter 5,
  Beaver; the sheets model chapter 1, the Night Sea. A student who has done both
  has climbed the ladder twice on two pieces of writing.
- **The continuum is quoted, not paraphrased.** Wording comes from the school's
  Learning Continuum master sheet, English tab, and each row names the strand it
  came from. `Use of evidence` is blank at Level 5 on that sheet, so the Level 5
  card says "Not on the school's continuum until Level 6" rather than inventing a
  descriptor. The CAT rubric band underneath runs Levels 5 to 9 only, and the
  rungs outside that range say so.
- **EAL bands** (C2, C3, C4, VCE 1) come from the EAL analytical writing WAGOLL
  and sit in the header. The rungs below Level 5 carry no band, because that
  sheet does not describe one.
- **Two channels for every signal**: each criterion has a colour and an underline
  pattern, so the sheets survive a greyscale photocopy.

**If you edit it**, everything printable is in the DATA block at the top of the
script; the renderer under it holds no wall text. After any edit, print to PDF
and **count the pages: eight in, eight out**. A sheet that grows by two lines
silently becomes two pages, and the page count is the only test that catches it.
The type scale is a formula with a floor and a ceiling, tuned so the longest
sheet (Level 10) fits and the shortest (Foundation) is not swimming in white
space; a measured autofit was tried and removed, because type size changes where
lines wrap and the loop overshot by a whole line each pass.

## Teacher mode: the slides

The reading hub home screen and Part A of the Analysis workshop both carry a
**Teacher mode · slides** link. It opens a projector deck for the front of the
room, driven by one key: **→** for next, **←** for back, **Esc** to leave.

Nine slides. The three parts of an analytical sentence (idea, evidence,
effect), one slide each on what separates a weak version from a strong one,
the same three parts shown at two rubric levels, the ladder, and then a
**live demonstration of the builder**: ten steps that put a sentence together
one tile at a time, embed the quotation with a joiner, and then drag a tile to
a different position and back, so the class sees the move before anyone tries
it.

Two things about it are deliberate. Nothing in the deck is scored or saved, so
you can drive it on a student's device without touching their work. And the
wall text, the rubric wording and the demo's tiles all come from the same data
the workshop uses, so the deck cannot drift away from the lesson it is
introducing.

## Dragging a tile into place

The builder used to make you tap a tile (which put it on the end of the
sentence) and then drag it back to where you wanted it. Now a tile drags
**straight from the bank into the spot you want**, in one motion: pick it up,
the sentence opens a gap where the pointer is, let go and it lands there.

The mechanics, in case they ever need changing: a bank tile and a canvas tile
run the same gesture, and the only difference is that a bank tile has no tile
on the canvas yet, so the first movement past the threshold materialises one
and everything after that is the identical code path. Under 8 pixels it is a
tap, and a tap still means what it always did — on a bank tile it adds to the
end, on a tile in the sentence it takes it out. Dragging a tile out of the
canvas and dropping it well away cancels the add. It works with a mouse, a
trackpad and a finger; the tiles set `touch-action:none` so a drag on a tablet
does not scroll the page instead.

## The full WAGOLL wall, on its own address

`BoneSparrowWagollWall.html` puts all five levels of the wall on one page: the
model response at each level with its colours, what makes it that level, the
rubric line it is marked against, and what unlocks and retires on the way up.
It is a reference to write against, and it has its own address so it can be
handed out as a link or left open on a second screen.

**It is gated, twice.** The card in the reading hub stays shut until the
Analysis workshop is finished, and the page checks the same flag when it is
opened directly, because reading the answers before building the wall is a much
weaker lesson than building it. Both checks read the hub's own progress record
on that device, so a student who has done the workshop on the class computer
will find it locked at home. That is a classroom lock, not a security one.

**Teachers open it with `?teacher=1` on the end of the address**, which skips
the gate. The printable A3 sheets are not gated at all.

The page holds no wall text of its own: it reads `WK_WALL` and `WK_LEVELS` out
of the reading hub when it loads, so it always shows what the workshop is
currently teaching. That read needs the files served over http, which the Pages
site does. Opened straight off a USB stick as a `file://` address the browser
blocks it, and the page says so and points at the printable sheets instead.
