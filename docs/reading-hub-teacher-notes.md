# The Bone Sparrow — Reading & Evidence Hub: teacher notes

Companion interactive to the **Pre-reading Trainer** (`bonesparrowtrainer (4) (3).html`, vocab + sentence types) and the **Grammar Hub** (`GrammarHuboffline.html`). Same visual suite, same rules: mastery loop, **first-attempt-only scoring**, printable report with verification code, everything offline in one file.

File: `BoneSparrowReadingHub.html`

## How the modules map to the proposed formative tasks

| Hub module | Team proposal (22 July) | Skill ladder used |
|---|---|---|
| 1. Quickreads — cold-excerpt inference checks | Reading FT 1: weekly/fortnightly 10-minute constrained-choice quiz on an unseen passage; self-marking, misread items retaught immediately | Comprehension of texts |
| 2. Figurative → literal | Reading FT 2 (Lesson 09): match figurative lines to paraphrases plus one justification; answer-key feedback, EAL-friendly | "I can describe the meaning of different similes and metaphors" → "I can explain the effect of … figurative language" |
| 3. Voice fingerprint | Reading FT 4 (Lesson 11, before the voice memo): sort unattributed lines to the correct character, naming one language feature as evidence; self-checking | "I can explain how language can be used to create 'voice'…" — feeds directly into the oral (character voice) |
| 4. Evidence Builder | FT1 (Using evidence) retooled so it *serves the reading*, not just Unit 6 writing | Learning-continuum *Use of evidence* ladder: include quotes with guidance → explain relevance → embed into sentences → correctly embed within an explanation → embed multiple quotes |
| 5. Sentence Upgrader (WAGOLL ladder) | Bridges into Unit 6 analytic writing as skill-based tasks (per last year's reflection: shorter, skill-based, not a whole essay straight away) | EAL analytical writing WAGOLL: C2 Describe → C3 Explain → C4 Analyse |

The two modules the hub can't do — the **recorded 45-second voice memo** and the **60-second micro-presentation** — are deliberately left to the classroom; module 3 is sequenced as the lesson *before* the voice memo, exactly as proposed.

## Rubric gating ("WAGOLL wall" behaviour)

Modules 4 and 5 show the skill ladder on screen as clickable level cards:

- Each card is a verbatim "I can…" descriptor (from the Learning Continuum / lesson 08 self-assessment ladder / the EAL WAGOLL levels).
- A level unlocks when the previous one is passed; clicking an unlocked level reveals its sentence stems and scaffolds.
- When a student completes a level, the hub tells them which descriptor they have just demonstrated — the same language that appears on their report, so self-assessment against the rubric is built into the task rather than bolted on after.

## Coded feedback

Wrong answers return the *coded next step*, not a bespoke comment (per the 25 July discussion), e.g. in the Evidence Builder:

- Selected a plot-retelling line → "That line retells what happens. Look for words that *show* the idea…"
- Selected strong evidence for a different idea → "Strong line — but it proves [other idea]. For [this idea], look at…"
- Embedded the whole sentence → "You've quoted the whole sentence. Embed just the key words…"

## Copyright note

Passages are short extracts (under a page each, page-referenced), the same extracts already used in `Lesson Resources/Bone Sparrow extracts for grammar.docx` and `06e - Chapter 5 silent starter.docx`, reproduced for enrolled students under the school's Statutory Text and Artistic Works Licence (Copyright Agency). Do **not** add whole chapters, and keep the repo private. There is no legitimate way to obtain a DRM-free full ebook for redistribution — see the licence note in the main README/thread.

## Adding your own passages

All content sits in clearly-bannered `const` blocks at the top of the file's script (the engine knows nothing about the novel). To add a quickread: copy an entry in `QUICKREADS`, paste your passage (typed from your copy, with page ref), and write the constrained-choice items — each item needs `id`, `q`, `opts`/`a`, and an `explain` that names the trap and points back to the line. To add an Evidence Builder round, follow the segment-tagging comment above `EVIDENCE_ROUNDS`.
