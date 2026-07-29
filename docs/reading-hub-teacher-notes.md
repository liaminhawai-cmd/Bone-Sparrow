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

Pages redeploys automatically on push when any hub file changes. Note the trade-off: the Pages site is public, so it holds only short page-referenced extracts (see the copyright note below).

Both gates: **first name + last name + student ID (4–8 chars) before anything starts**; details print on the report with a verification code.

Both carry a **"Where are you up to?" chapter selector** — content past the student's reading position stays hidden (no spoilers). The vocab hub unlocks each chapter set one chapter early so words can be pre-taught.

## Reading & Evidence Hub — modules vs the proposed FTs

| Module | Team proposal (22 July) |
|---|---|
| Quickreads ×2 (ch 1, ch 5) — passage hides, questions run cold, misses retaught with the exact line re-quoted | Reading FT 1: cold-excerpt inference check |
| Figurative → literal (plain-English paraphrase, then name the technique) | Reading FT 2 (Lesson 09) |
| Voice fingerprint (line → speaker → the giveaway feature) | Reading FT 4, the lesson before the voice memo |
| Evidence builder (click evidence in the passage → explain relevance → embed a trimmed quote; the *Use of evidence* continuum ladder unlocks stems as they climb) | FT1 retooled to serve reading |
| **Analysis workshop** — Part A: students **build the WAGOLL wall** by placing five authored responses against the CAT rubric's level 5–9 descriptors; Part B: Edward-Scissorhands-style tagged tile bank — students harvest their own quotes from the passage, then assemble sentences checked for *presence, quality and focus-match*, never syntax | Bridges to Unit 6 as skill-based tasks |

**A miss costs you a new question, not the same one.** Both hubs now run a redundancy bank. In the reading hub, missing a question requeues a *parallel* item — same skill, same passage where possible, different material — and a fresh one again each time it's missed, so the only way out of the loop is to do the skill rather than remember which option was highlighted. In the vocab hub, a missed word comes back from a different angle (another authored task, or a generated word-sum / morpheme-meaning / meaning-match on the same word). Parallel items are never scored: the report still shows first attempts on the real set, so the loop is a consequence, not a punishment on paper.

**Grammar can't be gamed.** The evidence-builder quote banks now include options that read perfectly smoothly but misreport the text (Subhi's counter-view quoted under an "Eli believes…" stem; a Maá line attributed to Queeny; cruelty evidence answering a different question). The discriminator is meaning, and every trap has coded feedback. The workshop's Part B validates what a sentence is *made of* (specific subject, analytic verb, harvested quote matching the chosen focus, idea clause) — many genuinely different strong sentences pass; students read their own sentence back for flow.

**EAL toggle** — adds C-band equivalents (C2 Describe / C3 Explain / C4 Analyse, from the EAL WAGOLL) under the Vic-curriculum wall descriptors, plus a pattern hint in the builder. Off by default; the mainstream labels are the CAT rubric's own.

**Strategic hub links** — no generic link wall. Pointers appear only where a specific failure calls for them, with exact instructions: two grammar-flow failures in the embed step → "open Grammar Hub → Sentence Structure, run one round at your level, then rebuild this sentence"; a sub-60% quickread → "open Vocab Hub → CH 1-2, run 'Meet the words' and 'Build the words', then retry." Links resolve to files when the hub is opened from the class folder, to the live pages on the web.

**Workshop kept sentences** print on the student's report.

## Vocab Hub

The Water-in-the-World engine, re-keyed. First set is **"Before you read · the words of the unit"** — the old pre-reading vocabulary (refugee, asylum seeker, persecution, incarceration, bureaucracy, trauma, dispossessed, immigration), always open, built on the look-alike discrimination that trainer was good at (persecution/prosecution, incarceration/incineration/incarnation, immigration/emigration). Then 9 chapter sets (1–2, 3–4, 5, 6–7, 8–10, 11–14, 15–17, 18–20, 21–end), 6 words each — meaning, morpheme tiles or word-origin question, etymology note, 2 story-anchored apply tasks per word. Domains: **the camp / story & memory / feelings & the body / the outside world**. Base-camp and stretch tiers are authored for the first three sets (same morphemes in smaller/bigger words); later sets can have tiers added in the data spine any time. Key-word translations in the five languages of our EAL cohort (Mandarin, Cantonese, Vietnamese, Arabic, Farsi) appear on study cards and build reveals only — practice stays in English. Spaced review warms up each new set with previously **met** words, weighted toward past misses.

**The word list.** Every encounter with a word — building it from morphemes, using it in an apply task, meeting it again in a review — updates one running record that outlives the lesson (`wstat`). Two correct encounters in a row marks a word **mastered**; a single miss breaks the streak and un-masters it. Unmastered words are then weighted heavily back into every later review, so nothing quietly drops out of circulation. Students see the list three ways: a summary on the hub home ("28 words · 19 mastered · 6 to fix · 3 not drilled yet"), a per-word chip on the Word list screen (mastered / needs work (missed ×2) / not met yet) with a per-set tally in each heading, and a **Drill my unmastered words** button that goes straight at the outstanding ones. The report prints the same summary and names the words still in circulation.

**Verification note:** chapter placements and story anchors were built from the unit's own chapter summaries and the Question Booklet; the words themselves are unit/theme vocabulary rather than page-referenced quotations, so nothing depends on a specific edition. Worth a skim against your copy as you teach each band.

## Copyright note

Passages are short page-referenced extracts already used in the unit's printed resources (`Bone Sparrow extracts for grammar.docx`, `06e - Chapter 5 silent starter.docx`), reproduced for enrolled students under the school's Statutory Text and Artistic Works Licence (Copyright Agency). Do **not** add whole chapters; keep the repo private. There is no legitimate route to a DRM-free full ebook for redistribution — type the short passages you need from your own copy.

## Adding content

All content sits in bannered `const` blocks at the top of each file — the engines know nothing about the novel. Reading hub: add a quickread by copying an entry in `QUICKREADS` (each item needs `id`, `q`, `opts`, `a`, `explain`, and the `line` to re-quote on a miss, plus a `ch` tag for spoiler-gating). Vocab hub: copy a lesson object in `LESSONS` (six words minimum per set — the generated distractors need them; hyphens type the tiles: `de-` prefix, `-tion` suffix, bare = root; every item `id` globally unique).
