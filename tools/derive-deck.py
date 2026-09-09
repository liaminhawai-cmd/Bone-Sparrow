"""Build a TEEL deck from teacher/teel-essay.html plus a kit.

  python3 tools/derive-deck.py tools/kits/power.json

A kit is a JSON config (wording, state key, slide names) and a pool file
(the bubbles, the four sentences, the bars). The base deck stays the one
source of the machinery; run this again after changing it.
"""
import re,sys,json

cfg=json.load(open(sys.argv[1]))
pool=open(cfg["pool"]).read()
s=open('teacher/teel-essay.html').read()

def rep(a,b,n=1):
    global s
    assert s.count(a)==n, ("not found once: "+a[:70], s.count(a))
    s=s.replace(a,b)

rep('<title>TEEL — The Bone Sparrow</title>','<title>%s</title>'%cfg["title"])
rep('''    <p><span class="w"><i>The Bone Sparrow</i> shows us that</span> <span class="key im">imagination</span> <span class="w">and</span>
    <span class="key fr">friendship</span> <span class="w">are essential for survival.</span></p>''',
    '    <p>%s</p>'%cfg["thesis"])
rep('''<div class="card"><div class="ct"><h3>Intro</h3><div class="what">Names both ideas.</div></div>''',
    '<div class="card"><div class="ct"><h3>Intro</h3><div class="what land" id="introWhat">%s</div></div>'%cfg["introWhat"])
rep('''<div class="card p1"><div class="ct"><h3>P1</h3><div class="what land">imagination</div></div>''',
    '<div class="card p1"><div class="ct"><h3>P1</h3><div class="what land" id="p1What">?</div></div>')
rep('''<div class="card p2"><div class="ct"><h3>P2</h3><div class="what land">friendship</div></div>''',
    '<div class="card p2"><div class="ct"><h3>P2</h3><div class="what land" id="p2What">?</div></div>')
rep('''<div class="card"><div class="ct"><h3>C</h3><div class="what">What both ideas together suggest.</div></div>''',
    '<div class="card"><div class="ct"><h3>C</h3><div class="what">%s</div></div>'%cfg["concWhat"])

KEYROW=('<span class="k idea" data-c="idea">idea</span><span class="k verb" data-c="verb">verb</span>\n'
 '    <span class="k ev" data-c="ev">evidence</span><span class="k eff" data-c="eff">purpose</span>'
 '<span class="k plain" data-c="none">unhighlight</span><span class="k plain" data-c="plain">plain</span>'
 '<span class="k plain" data-c="full">full</span>')
start=s.index('<section class="slide" id="s2">'); end=s.index('</main>')
s=s[:start]+'''<section class="slide" id="s2">
  <h2>%(brainH2)s</h2>
  <div class="cloudwrap" data-cloud="%(cloud)s">
    <div class="centre"><b>%(centreWord)s</b><span>%(centreSub)s</span></div>
  </div>
  <div class="cloudfoot"><span>%(footHint)s</span><span class="sp"></span><button class="reset">Start again</button></div>
</section>

<section class="slide" id="s3">
  <h2 id="h3">TEEL · P1</h2>
  <div class="keyrow">
    %(keyrow)s
    <span class="sp"></span><div class="ideas" id="ideasIm"></div>
  </div>
  <div class="build" id="buildIm">
    <div class="anchor" id="anchorIm"></div>
    <div class="frame" id="frameIm"></div>
  </div>
</section>

<section class="slide" id="s5">
  <h2 id="h5">Your turn · P2</h2>
  <div class="keyrow">
    %(keyrow)s
    <span class="sp"></span><div class="ideas" id="ideasFr"></div>
  </div>
  <div class="two">
    <div><h3 id="wh">P1</h3><div class="worked" id="worked"></div></div>
    <div><h3 id="th">P2</h3><div class="frame" id="frameFr"></div></div>
  </div>
</section>

'''%dict(cfg,keyrow=KEYROW)+s[end:]

# the kit's bubbles, sentences, stems and bars replace the base ones
start=s.index('/* ---------------- what the class can pull into the cloud'); end=s.index('/* ---------------- state ---------------- */')
s=s[:start]+pool+"\n"+s[end:]
s=re.sub(r'\nconst STEMS=\{\n  im:\["Imagination is essential[^\n]*\n  fr:\[[^\n]*\n\};','',s,count=1)
s=re.sub(r'\nfunction drawAnchor\(id,name,word\)\{.*?\n\}','',s,count=1,flags=re.S)
s=re.sub(r'/\* the T and the first half of the L come from the brainstorm; a box that\n   still holds what was seeded follows the picks when they change \*/\nfunction seed\(which,name,word\)\{.*?\n\}\n','',s,flags=re.S)
for one in ('const STEMS=','function drawAnchor','function seed('):
    assert s.count(one)==1, one+' must appear once, found %d'%s.count(one)

rep('const KEY="bonesparrow.teelDeck.v1";','const KEY="%s";'%cfg["key"])
rep('const AB=name=>{const p=picks(name),f=FALLBACK[name];return [p[0]||f[0],p[1]||f[1]];};',
    'const AB=name=>{const p=picks(name),f=FALLBACK[name];const a=p[0]||f[0];return [a,p[1]||(a===f[1]?f[0]:f[1])];};\n'
    'const P12=()=>AB("%s");'%cfg["cloud"])
rep('''    sl.classList.add("show"); v.classList.add("landing");
    [["im",".card.p1 .what"],["fr",".card.p2 .what"]].forEach(([k,sel])=>{''',
'''    sl.classList.add("show"); v.classList.add("landing"); labelCards();
    t.querySelector(".key.fr").style.opacity=0;
    [["im","#introWhat"]].forEach(([k,sel])=>{''')
rep('''  } else if(!fly){ sl.classList.remove("show"); t.classList.remove("split","landed"); v.classList.remove("landing"); }
  else { sl.classList.add("show"); t.classList.add("split","landed"); }''',
'''  } else if(!fly){ sl.classList.remove("show"); t.classList.remove("split","landed"); v.classList.remove("landing"); t.querySelector(".key.fr").style.opacity=""; }
  else { sl.classList.add("show"); t.classList.add("split","landed"); labelCards(); }''')
rep('.essayv.landing .what.land{opacity:0}','.essayv.landing #introWhat{opacity:0}')
rep('function next(){ if(cur===0&&S.stage<3){ S.stage++; save(); stage(); return; } go(cur+1); }',
    'function next(){ if(cur===0&&S.stage<2){ S.stage++; save(); stage(); return; } go(cur+1); }')
rep('''$("thesis").addEventListener("click",()=>{ S.stage=(S.stage+1)%4; save(); stage(); });
$("essayv").addEventListener("click",()=>{ S.stage=S.stage>=3?2:3; save(); stage(); });''',
'''$("thesis").addEventListener("click",()=>{ S.stage=(S.stage+1)%3; save(); stage(); });
function labelCards(){ const p=picks("''' + cfg["cloud"] + '''"); $("p1What").textContent=p[0]?p[0].name||p[0].t:"?"; $("p2What").textContent=p[1]?p[1].name||p[1].t:"?"; }''')
rep('''  $(id).innerHTML=p.length?p.map((o,i)=>`<span data-sub="${"AB"[i]}"><b>${"AB"[i]}</b>${esc(o.t)}<u class="unpick" data-name="${name}" data-i="${i}" title="take this idea out">×</u></span>`).join(""):"";''',
    '''  $(id).innerHTML=p.length?p.map((o,i)=>`<span><b>P${i+1}</b>${esc(o.name||o.t)}<u class="unpick" data-name="${name}" data-i="${i}" title="take this out">×</u></span>`).join(""):"";''')
rep('''  const [a,c]=AB("imagination"), i=+b.dataset.i;
  const h=[SENT.T("Imagination",a,c),SENT.E(a,A_,"imagination"),SENT.E(c,B_,"imagination"),SENT.L("imagination",a,c)][i];''',
'''  const o=P12()[0], i=+b.dataset.i;
  const h=[SENT.T(o),SENT.E(o,0),SENT.E(o,1),SENT.L(o)][i];''')
rep('const NAMES=["The big idea","Imagination · brainstorm","Imagination · TEEL","Friendship · brainstorm","Friendship · your turn"];',
    'const NAMES=%s;'%json.dumps(cfg["names"],ensure_ascii=False,separators=(',',':')))
rep('''  if(i===2){ seed("im","imagination","Imagination"); drawIdeas("ideasIm","imagination"); drawAnchor("anchorIm","imagination","Imagination"); drawFrame("frameIm","im",true); typingIm(); }
  if(i===4){ seed("fr","friendship","Friendship"); drawIdeas("ideasFr","friendship"); drawWorked(); drawFrame("frameFr","fr",false); }''',
'''  const [p1,p2]=P12();
  if(i===2){ $("h3").textContent="TEEL · "+(p1.name||p1.t); seed("im",p1); drawIdeas("ideasIm","%(c)s"); drawAnchor("anchorIm",p1); drawFrame("frameIm","im",true); typingIm(); }
  if(i===3){ $("h5").textContent="Your turn · "+(p2.name||p2.t); $("wh").textContent=p1.name||p1.t; $("th").textContent=p2.name||p2.t;
    seed("fr",p2); drawIdeas("ideasFr","%(c)s"); drawWorked(); drawFrame("frameFr","fr",false); }'''%{"c":cfg["cloud"]})
rep('  if(i===0) stage();','  if(i===0){ stage(); labelCards(); }')
rep('<p class="sub"><a href="./">Teacher</a> · The Bone Sparrow — <a href="../BoneSparrowTeel.html">the letters and the ladder</a></p>',
    '<p class="sub"><a href="./">Teacher</a> · The Bone Sparrow — <a href="teel-essay.html">the first session</a></p>')
rep('''  el.innerHTML=`<span class="tag" ${o.pick?"":"hidden"}>${o.pick?"AB"[o.pick-1]:""}</span>${esc(o.t)}<span class="x">×</span>`;''',
    '''  el.innerHTML=`<span class="tag" ${o.pick?"":"hidden"}>${o.pick?"P"+o.pick:""}</span>${esc(o.t)}<span class="x">×</span>`;''')
rep('''    const tag=m.el.querySelector(".tag"); tag.hidden=!m.o.pick; tag.textContent=m.o.pick?"AB"[m.o.pick-1]:""; });''',
    '''    const tag=m.el.querySelector(".tag"); tag.hidden=!m.o.pick; tag.textContent=m.o.pick?"P"+m.o.pick:""; });''')

if cfg.get("stance"):
    rep('/* nav */','''/* agree or disagree */
.node.agree{border-color:var(--eff-tx);background:var(--eff-bg);color:var(--eff-tx)}
.node.disagree{opacity:.55;border-style:dashed;text-decoration:line-through}
.node.agree.pick{border-color:var(--idea-tx);background:var(--idea-bg);color:var(--idea-tx)}
.node .stance{font-weight:800;margin-right:7px}

/* nav */''')
    rep('\ngo(cur);\n</script>','''\n/* Tap a bubble to agree, again to disagree, again to clear. The first two
   the class agrees with are the two paragraphs. */
const kindOf=o=>(o&&o.i>=0&&POOL[live.name]&&POOL[live.name][o.i])?POOL[live.name][o.i].kind:null;
function nodeEl(o){
  const el=document.createElement("div");
  el.className="node"+(o.pick?" pick":"")+(o.st===1?" agree":o.st===-1?" disagree":"")+(kindOf(o)==="ev"?" ev":"");
  el.innerHTML=`<span class="tag" ${o.pick?"":"hidden"}>${o.pick?"P"+o.pick:""}</span>`+
    `<span class="stance">${o.st===1?"\\u2713":o.st===-1?"\\u2717":""}</span>${esc(o.t)}<span class="x">\\u00d7</span>`;
  return el;
}
function togglePick(n){
  const st=cloudState(live.name), o=n.o;
  o.st = o.st===1 ? -1 : o.st===-1 ? 0 : 1;
  /* a quote is evidence, never a paragraph of its own */
  if(o.st!==1 || kindOf(o)==="ev") o.pick=0;
  else { const cur=st.nodes.filter(x=>x.pick).sort((a,b)=>a.pick-b.pick);
    if(cur.length>=2) cur[0].pick=0;
    o.pick=Math.max(0,...st.nodes.map(x=>x.pick))+1; }
  st.nodes.filter(x=>x.pick).sort((a,b)=>a.pick-b.pick).forEach((x,i)=>x.pick=i+1);
  save();
  live.nodes.forEach(m=>{ if(m.empty) return;
    m.el.classList.toggle("pick",!!m.o.pick);
    m.el.classList.toggle("agree",m.o.st===1);
    m.el.classList.toggle("disagree",m.o.st===-1);
    const tag=m.el.querySelector(".tag"); tag.hidden=!m.o.pick; tag.textContent=m.o.pick?"P"+m.o.pick:"";
    const sp=m.el.querySelector(".stance"); if(sp) sp.textContent=m.o.st===1?"\\u2713":m.o.st===-1?"\\u2717":"";
  });
}
go(cur);
</script>''')

if cfg.get("css"):
    rep('/* nav */', cfg["css"]+"\n/* nav */")

open(cfg["out"],'w').write(s)
print("written "+cfg["out"])
