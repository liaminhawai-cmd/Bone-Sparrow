from pathlib import Path

path = Path("teacher/teel-purpose.html")
s = path.read_text(encoding="utf-8")


def replace_once(old: str, new: str, label: str) -> None:
    global s
    if old not in s:
        raise SystemExit(f"Could not find patch target: {label}")
    s = s.replace(old, new, 1)


replace_once(
    '<div class="cloudfoot"><span>Tap to agree, again to disagree, again to clear. The first two ideas you agree with become the paragraphs; the yellow ones are evidence.</span><span class="sp"></span><button class="reset">Start again</button></div>',
    '<div class="cloudfoot"><span>Tap to test an idea: ✓ agree, ✗ disagree. The first two paragraph-ready ideas you agree with become P1 and P2; yellow bubbles are evidence.</span><span class="sp"></span><button class="reset">Start again</button></div>',
    "cloud instructions",
)

replace_once(
    ''' {t:"she explains how detention centres are run"},
 {t:"she makes the reader laugh at Subhi"},
 {t:"she wants the reader to feel sorry for the Jackets"},
 {t:"she teaches the reader about ducks"},
 {t:"she keeps the ending a secret"}''',
    ''' {kind:"test",t:"she explains what happens in detention"},
 {kind:"test",t:"she makes the reader feel sorry for Subhi"},
 {kind:"test",t:"she tells the reader the camp is unfair"}''',
    "weak distractors",
)

replace_once(
    'const KEY="bonesparrow.teelPurpose.v1";',
    'const KEY="bonesparrow.teelPurpose.v2";',
    "state version",
)

replace_once(
    '''function seed(which,o){
  S.seeded=S.seeded||{};
  const B=S.boxes[which], sd=S.seeded[which]||{};
  const T=SENT.T(o), L=SENT.Lseed(o);
  if(!B[0].trim()||B[0]===sd.T) B[0]=T;
  if(!B[3].trim()||B[3]===sd.L) B[3]=L;
  S.seeded[which]={T,L}; save();
}''',
    '''function seed(which,o){
  S.seeded=S.seeded||{};
  const B=S.boxes[which], sd=S.seeded[which]||{}, key=o.t;
  /* A paragraph belongs to one idea. If P1/P2 changes, stale evidence from
     the old idea is worse than an empty scaffold, so clear the paragraph. */
  if(sd.key && sd.key!==key){
    B.splice(0,4,"","","","");
    if(which==="im") S.typedIm=false;
  }
  const T=SENT.T(o), L=SENT.Lseed(o);
  if(!B[0].trim()||B[0]===sd.T) B[0]=T;
  if(!B[3].trim()||B[3]===sd.L) B[3]=L;
  S.seeded[which]={T,L,key}; save();
}''',
    "paragraph reseed",
)

replace_once(
    '''const kindOf=o=>(o&&o.i>=0&&POOL[live.name]&&POOL[live.name][o.i])?POOL[live.name][o.i].kind:null;
function nodeEl(o){''',
    '''const kindOf=o=>(o&&o.i>=0&&POOL[live.name]&&POOL[live.name][o.i])?POOL[live.name][o.i].kind:null;
const paragraphReady=o=>kindOf(o)!=="ev"&&kindOf(o)!=="test";
function nodeEl(o){''',
    "paragraph-ready helper",
)

replace_once(
    '''  /* a quote is evidence, never a paragraph of its own */
  if(o.st!==1 || kindOf(o)==="ev") o.pick=0;
  else { const cur=st.nodes.filter(x=>x.pick).sort((a,b)=>a.pick-b.pick);''',
    '''  /* Evidence and deliberately weak test bubbles can be discussed, but
     they never become the paragraph heading. Student/teacher-added ideas can. */
  if(o.st!==1 || !paragraphReady(o)) o.pick=0;
  else { const cur=st.nodes.filter(x=>x.pick).sort((a,b)=>a.pick-b.pick);''',
    "selection guard",
)

path.write_text(s, encoding="utf-8")
print("Patched", path)
