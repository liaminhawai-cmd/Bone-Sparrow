"""teacher/teel-power.html is teacher/teel-essay.html with the power content
swapped in. Run after changing the first deck: python3 tools/derive-power-deck.py"""
import re,sys
s=open('teacher/teel-essay.html').read()
def rep(a,b,n=1):
    global s; assert s.count(a)==n, (a[:70],s.count(a)); s=s.replace(a,b)
rep('<title>TEEL — The Bone Sparrow</title>','<title>TEEL · power — The Bone Sparrow</title>')
rep('''    <p><span class="w"><i>The Bone Sparrow</i> shows us that</span> <span class="key im">imagination</span> <span class="w">and</span>
    <span class="key fr">friendship</span> <span class="w">are essential for survival.</span></p>''',
'''    <p><span class="w"><i>The Bone Sparrow</i> shows us that</span> <span class="key im">power</span> <span class="w">comes in</span>
    <span class="key fr">many forms</span><span class="w">.</span></p>''')
rep('''<div class="card"><div class="ct"><h3>Intro</h3><div class="what">Names both ideas.</div></div>''',
    '''<div class="card"><div class="ct"><h3>Intro</h3><div class="what land" id="introWhat">power</div></div>''')
rep('''<div class="card p1"><div class="ct"><h3>P1</h3><div class="what land">imagination</div></div>''',
    '''<div class="card p1"><div class="ct"><h3>P1</h3><div class="what land" id="p1What">?</div></div>''')
rep('''<div class="card p2"><div class="ct"><h3>P2</h3><div class="what land">friendship</div></div>''',
    '''<div class="card p2"><div class="ct"><h3>P2</h3><div class="what land" id="p2What">?</div></div>''')
rep('''<div class="card"><div class="ct"><h3>C</h3><div class="what">What both ideas together suggest.</div></div>''',
    '''<div class="card"><div class="ct"><h3>C</h3><div class="what">What the kinds of power together suggest.</div></div>''')
start=s.index('<section class="slide" id="s2">'); end=s.index('</main>')
s=s[:start]+'''<section class="slide" id="s2">
  <h2>What kinds of power are there in the novel?</h2>
  <div class="cloudwrap" data-cloud="power">
    <div class="centre"><b>power</b><span>many forms</span></div>
  </div>
  <div class="cloudfoot"><span>Tap a bubble to make it a paragraph. Tap the space for another. Double-tap a bubble to drop it.</span><span class="sp"></span><button class="reset">Start again</button></div>
</section>

<section class="slide" id="s3">
  <h2 id="h3">TEEL · P1</h2>
  <div class="keyrow">
    <span class="k idea" data-c="idea">idea</span><span class="k verb" data-c="verb">verb</span>
    <span class="k ev" data-c="ev">evidence</span><span class="k eff" data-c="eff">purpose</span><span class="k plain" data-c="none">unhighlight</span><span class="k plain" data-c="plain">plain</span><span class="k plain" data-c="full">full</span>
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
    <span class="k idea" data-c="idea">idea</span><span class="k verb" data-c="verb">verb</span>
    <span class="k ev" data-c="ev">evidence</span><span class="k eff" data-c="eff">purpose</span><span class="k plain" data-c="none">unhighlight</span><span class="k plain" data-c="plain">plain</span><span class="k plain" data-c="full">full</span>
    <span class="sp"></span><div class="ideas" id="ideasFr"></div>
  </div>
  <div class="two">
    <div><h3 id="wh">P1</h3><div class="worked" id="worked"></div></div>
    <div><h3 id="th">P2</h3><div class="frame" id="frameFr"></div></div>
  </div>
</section>

'''+s[end:]
start=s.index('/* ---------------- what the class can pull into the cloud'); end=s.index('/* ---------------- state ---------------- */')
s=s[:start]+open('tools/power-pool.js').read()+s[end:]
rep('''const KEY="bonesparrow.teelDeck.v1";''','''const KEY="bonesparrow.teelPower.v1";''')
rep('''const AB=name=>{const p=picks(name),f=FALLBACK[name];return [p[0]||f[0],p[1]||f[1]];};''',
    '''const AB=name=>{const p=picks(name),f=FALLBACK[name];const a=p[0]||f[0];return [a,p[1]||(a===f[1]?f[0]:f[1])];};
const P12=()=>AB("power");''')
s=re.sub(r'/\* the T and the first half of the L come from the brainstorm; a box that\n   still holds what was seeded follows the picks when they change \*/\nfunction seed\(which,name,word\)\{.*?\n\}\n','',s,flags=re.S)
rep('''    sl.classList.add("show"); v.classList.add("landing");
    [["im",".card.p1 .what"],["fr",".card.p2 .what"]].forEach(([k,sel])=>{''',
'''    sl.classList.add("show"); v.classList.add("landing"); labelCards();
    t.querySelector(".key.fr").style.opacity=0;
    [["im","#introWhat"]].forEach(([k,sel])=>{''')
rep('''  } else if(!fly){ sl.classList.remove("show"); t.classList.remove("split","landed"); v.classList.remove("landing"); }
  else { sl.classList.add("show"); t.classList.add("split","landed"); }''',
'''  } else if(!fly){ sl.classList.remove("show"); t.classList.remove("split","landed"); v.classList.remove("landing"); t.querySelector(".key.fr").style.opacity=""; }
  else { sl.classList.add("show"); t.classList.add("split","landed"); labelCards(); }''')
rep('''.essayv.landing .what.land{opacity:0}''','''.essayv.landing #introWhat{opacity:0}''')
rep('''function next(){ if(cur===0&&S.stage<3){ S.stage++; save(); stage(); return; } go(cur+1); }''',
    '''function next(){ if(cur===0&&S.stage<2){ S.stage++; save(); stage(); return; } go(cur+1); }''')
rep('''$("thesis").addEventListener("click",()=>{ S.stage=(S.stage+1)%4; save(); stage(); });
$("essayv").addEventListener("click",()=>{ S.stage=S.stage>=3?2:3; save(); stage(); });''',
'''$("thesis").addEventListener("click",()=>{ S.stage=(S.stage+1)%3; save(); stage(); });
function labelCards(){ const p=picks("power"); $("p1What").textContent=p[0]?p[0].name||p[0].t:"?"; $("p2What").textContent=p[1]?p[1].name||p[1].t:"?"; }''')
rep('''function drawAnchor(id,name,word){
  const [a,b]=AB(name), t=o=>esc(o.t);
  const seg=(k,f,txt)=>`<i class="${k}" style="flex:${f}">${txt||""}</i>`;
  $(id).innerHTML=`<h3>${word}</h3>
    <div class="row"><b>T</b><div class="bar">${seg("idea",2,word)}${seg("idea",3,t(a))}${seg("idea",3,t(b))}</div></div>
    <div class="row"><b>E</b><div class="bar">${seg("ev",3,"quote")}${seg("verb",1,"shows")}${seg("idea",3,t(a))}${seg("eff",3,"why")}</div></div>
    <div class="row"><b>E</b><div class="bar">${seg("ev",3,"quote")}${seg("verb",1,"shows")}${seg("idea",3,t(b))}${seg("eff",3,"why")}</div></div>
    <div class="row"><b>L</b><div class="bar">${seg("idea",2,t(a))}${seg("idea",2,t(b))}${seg("eff",3,"the main idea")}</div></div>`;
}''','''function drawAnchor(id,o){
  const a=ev(o,0),b=ev(o,1), sa=a?esc(a.shows):"what it shows", sb=b?esc(b.shows):"what it shows";
  const seg=(k,f,txt)=>`<i class="${k}" style="flex:${f}">${txt||""}</i>`;
  $(id).innerHTML=`<h3>${NM(o)}</h3>
    <div class="row"><b>T</b><div class="bar">${seg("idea",2,"power")}${seg("idea",5,KIND(o))}</div></div>
    <div class="row"><b>E</b><div class="bar">${seg("ev",3,"quote")}${seg("verb",1,"shows")}${seg("idea",3,sa)}${seg("eff",3,"why")}</div></div>
    <div class="row"><b>E</b><div class="bar">${seg("ev",3,"quote")}${seg("verb",1,"shows")}${seg("idea",3,sb)}${seg("eff",3,"why")}</div></div>
    <div class="row"><b>L</b><div class="bar">${seg("idea",2,NM(o))}${seg("idea",2,sa)}${seg("idea",2,sb)}</div></div>`;
}''')
rep('''  $(id).innerHTML=p.length?p.map((o,i)=>`<span data-sub="${"AB"[i]}"><b>${"AB"[i]}</b>${esc(o.t)}<u class="unpick" data-name="${name}" data-i="${i}" title="take this idea out">×</u></span>`).join(""):"";''',
    '''  $(id).innerHTML=p.length?p.map((o,i)=>`<span><b>P${i+1}</b>${esc(o.name||o.t)}<u class="unpick" data-name="${name}" data-i="${i}" title="take this out">×</u></span>`).join(""):"";''')
rep('''const STEMS={
  im:["Imagination is essential to Subhi's survival because … and …","When …, “…” This shows that …, which …","When …, “…” This shows that …, which …","So imagination gives Subhi … and …, and that is what …"],
  fr:["Friendship is essential to Subhi's survival because … and …","When …, “…” This shows that …, which …","When …, “…” This shows that …, which …","So friendship gives Subhi … and …, and that is what …"]
};''','''const STEMS={
  im:["One kind of power in The Bone Sparrow is …","When …, “…” This shows that …, which …","When …, “…” This shows that …, which …","So … is one kind of power in the camp: …, and …"],
  fr:["One kind of power in The Bone Sparrow is …","When …, “…” This shows that …, which …","When …, “…” This shows that …, which …","So … is one kind of power in the camp: …, and …"]
};''')
rep('''  const [a,c]=AB("imagination"), i=+b.dataset.i;
  const h=[SENT.T("Imagination",a,c),SENT.E(a,A_,"imagination"),SENT.E(c,B_,"imagination"),SENT.L("imagination",a,c)][i];''',
'''  const o=P12()[0], i=+b.dataset.i;
  const h=[SENT.T(o),SENT.E(o,0),SENT.E(o,1),SENT.L(o)][i];''')
rep('''const NAMES=["The big idea","Imagination · brainstorm","Imagination · TEEL","Friendship · brainstorm","Friendship · your turn"];''',
    '''const NAMES=["The big idea","Kinds of power","P1 · TEEL","P2 · your turn"];''')
rep('''  if(i===0) stage();''','''  if(i===0){ stage(); labelCards(); }''')
rep('''  if(i===2){ seed("im","imagination","Imagination"); drawIdeas("ideasIm","imagination"); drawAnchor("anchorIm","imagination","Imagination"); drawFrame("frameIm","im",true); typingIm(); }
  if(i===4){ seed("fr","friendship","Friendship"); drawIdeas("ideasFr","friendship"); drawWorked(); drawFrame("frameFr","fr",false); }''',
'''  const [p1,p2]=P12();
  if(i===2){ $("h3").textContent="TEEL · "+(p1.name||p1.t); seed("im",p1); drawIdeas("ideasIm","power"); drawAnchor("anchorIm",p1); drawFrame("frameIm","im",true); typingIm(); }
  if(i===3){ $("h5").textContent="Your turn · "+(p2.name||p2.t); $("wh").textContent=p1.name||p1.t; $("th").textContent=p2.name||p2.t;
    seed("fr",p2); drawIdeas("ideasFr","power"); drawWorked(); drawFrame("frameFr","fr",false); }''')
rep('''<p class="sub">The Bone Sparrow — <a href="../BoneSparrowTeel.html">the letters and the ladder</a></p>''',
    '''<p class="sub">The Bone Sparrow — <a href="teel-essay.html">the first session</a></p>''')
rep('''  el.innerHTML=`<span class="tag" ${o.pick?"":"hidden"}>${o.pick?"AB"[o.pick-1]:""}</span>${esc(o.t)}<span class="x">×</span>`;''',
    '''  el.innerHTML=`<span class="tag" ${o.pick?"":"hidden"}>${o.pick?"P"+o.pick:""}</span>${esc(o.t)}<span class="x">×</span>`;''')
rep('''    const tag=m.el.querySelector(".tag"); tag.hidden=!m.o.pick; tag.textContent=m.o.pick?"AB"[m.o.pick-1]:""; });''',
    '''    const tag=m.el.querySelector(".tag"); tag.hidden=!m.o.pick; tag.textContent=m.o.pick?"P"+m.o.pick:""; });''')
open('teacher/teel-power.html','w').write(s); print("written teacher/teel-power.html")
