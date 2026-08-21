# Read this first

Rules for anyone building teaching resources in this repository, human or model.

## The core rule

### 0. The resource is a tool a teacher uses. It is not the teacher.

Everything a page could say about itself, the teacher says better, in the room,
to that class. So a page never explains what it is for, never justifies its own
existence, never describes its own design, and never narrates what the user is
about to do. It presents the work and gets out of the way.

The failure is easy to miss because each instance reads like helpfulness. The
builder's empty Level 7 cell said "this is what we are building, watch the banks
below". A print pack said "The colours mark the parts doing analytical work. Read
what each coloured phrase does, not how many there are." A deck slide was headed
"One sentence, four colours". Every one of those is the resource doing the
teacher's job, badly, in writing, to a student who has a teacher standing in
front of them. All were cut and nothing was lost.

What stays is the work itself and the instruction needed to act on it. "Cut along
the dashes" stays: a student cannot do the task without it. "Drag a tile into the
sentence" stays. "Read what each coloured phrase does, not how many there are"
goes: that is a teaching point, and it belongs to a person.

The same discipline governs the shape of a page. No punchy subheadings. No
slogans, no three-part rhythms, no flourishes. A micro-heading over a
one-sentence block is clutter twice over, once for the heading and once for the
white space around it. Minimalism here is not a taste, it is the rule: if a line,
a heading, a legend or a note is not carrying work, cut it.

Two tests before shipping any surface. Read each line and ask what a student
cannot do without it; if the answer is nothing, cut it. Then ask whether the
teacher would say this line out loud anyway; if they would, it is theirs, not the
page's.

This applies to every student-facing and teacher-facing surface: page text,
headings, button labels, empty states, feedback strings, printed sheets. It does
not apply to code comments, which exist precisely to explain, or to this file.

## What this repository is

Single-file offline HTML activities for a Year 7 English unit on *The Bone
Sparrow* (Zana Fraillon). Each file opens on its own, with no build step and no
dependencies, and holds its own data, styles and behaviour.

### 1. The deploy branch is `claude/bone-sparrow-units-planning-l9ptqq`.

Not `main`. `main` has never deployed the site. The workflow is
`.github/workflows/pages.yml` and the live site is
https://liaminhawai-cmd.github.io/Bone-Sparrow/. A new page is not live until it
is added to that workflow in both places: the `paths` trigger list and the `cp`
lines that assemble `dist`.

Verify the deploy went green rather than assuming it. A push is not a
publication.

### 2. Every front-door link must have a file and a workflow line.

`index.html` lists the activities. Deleting or renaming a page without fixing
that list leaves a dead link on the live site, which is exactly how a page
disappears quietly. Check both after any rename or removal.

### 3. A page that reads from the hub must fail loudly.

`BoneSparrowWagollWall.html` and `BoneSparrowClimbCards.html` pull their content
out of `BoneSparrowReadingHub.html` at load time by bounded slice, so they cannot
drift from what students see on screen. When a slice or a named tile no longer
resolves, the page says so and refuses to render rather than printing something
stale. Keep that behaviour: a silently wrong worksheet is worse than a page that
admits it is broken.

These pages need http to fetch the hub. Opened as a bare `file://` they say so.

## Verification

### 4. Measure rather than assert.

Claims about a resource are checkable, so check them before making them.

- **Print fit is a page count.** Render the page to PDF and count pages. Eight
  sheets in must be eight pages out. A sheet that spills is invisible on screen
  and obvious on paper.
- **Interaction is a browser test.** Chromium is at
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`; drive it with Playwright
  against a local `python3 -m http.server`. Drag, drop, check, and the demo's fit
  on a projector are all measurable.
- **Answer quality is countable.** The multiple-choice items once had the correct
  answer as the single longest option in 88% of 117 questions. That was found by
  counting, not by reading. Distractor quality, option length and whether a
  prompt leaks its own answer are all countable properties.

A claim measured and reported honestly is worth more than a confident one. If a
check fails, say so with the output.

### 5. Print layout has its own trap.

`@media (max-width:860px)` catches A4 portrait, which is 794px. Write
`@media screen and (max-width:860px)` so the phone layout never reaches paper.

## Writing

### 6. Australian spelling.

organised, behaviour, prioritise, centre, modelled, colour, analyse.

### 7. No model identifiers in anything pushed.

Not in commit messages, PR titles or bodies, code comments, or page text.
