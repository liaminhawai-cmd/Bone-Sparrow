/* ---------------- how Fraillon does it ----------------
   The prompt is one purpose. Each bubble is a way she achieves it, and each
   paragraph links its way back to that purpose. by: the way, as a clause for
   the topic sentence. e: two pieces of evidence, each with what it shows and
   what it does to the reader. A bubble with no e is one to argue about. */
const PURPOSE="makes the reader see the people behind the numbers";
const POOL={purpose:[
 {t:"she gives Subhi a child's imagination",name:"a child's imagination",by:"giving Subhi a child's imagination",e:[
   {lead:"When the novel opens",q:"Sometimes, at night, the dirt outside turns into a beautiful ocean.",shows:"Subhi's first words are a child's imagining, not a case file",eff:"makes the reader meet the boy before the camp"},
   {lead:"When Jimmie brings her mother's book",q:"…knowing that Jimmie has a whole real book in her hands gives me a sort of brave that I haven't felt since Eli got taken.",shows:"a story does for Subhi what a story does for any kid",eff:"makes the reader recognise something of themselves in him"}]},
 {t:"she has Harvey learn their names",name:"learning their names",by:"having one adult learn their names",e:[
   {lead:"When Subhi describes Harvey",q:"…learn their names so that he can talk with us for real, instead of talking to us by our numbers.",shows:"using a name is a choice the camp never requires",eff:"shows the reader exactly what a number takes away"},
   {lead:"After Nasir dies",q:"…I whisper the few words of Rohingya that I know, just so my brain doesn't turn to thinking that they are right and that I am only Aussie Boy.",shows:"Subhi holds on to his language to hold on to himself",eff:"makes the reader feel the effort of staying a person"}]},
 {t:"she counts things instead of people",name:"counting things, not people",by:"letting the camp count things instead of people",e:[
   {lead:"When Subhi counts the camp's shoes",q:"There are only fourteen pairs of real shoes in this whole entire camp.",shows:"the camp is measured by what is missing",eff:"makes the reader feel the shortage without being told to"},
   {lead:"When Subhi thinks about Outside",q:"None of us knows what it is like just on the other side of the fences.",shows:"the fence is the edge of everything Subhi knows",eff:"makes the reader feel how close and how final it is"}]},
 {t:"she takes Subhi's voice away",name:"taking his voice",by:"taking Subhi's voice away when he is afraid",e:[
   {lead:"When Beaver catches Subhi at the fence",q:"I can't talk. I can't say a single thing.",shows:"fear takes Subhi's voice before Beaver has touched him",eff:"makes the reader feel that silence from the inside"},
   {lead:"When the protest grows",q:"There are twenty-four people with their lips sewn shut now, and eighty-seven on hunger strike.",shows:"people use their bodies when their words are not heard",eff:"makes the reader see what being ignored costs"}]},
 {t:"she puts a free girl on the other side of the fence",name:"a free girl too",by:"putting a free girl on the other side of the fence",e:[
   {lead:"At home in her own kitchen",q:"Jimmie wonders if her dad even remembers that she can't read.",shows:"Jimmie is unseen inside her own family",eff:"makes the reader feel that being shut out happens on both sides"},
   {lead:"By the end of the chapter",q:"Jimmie has never felt so alone.",shows:"the plainest sentence in the book is given to the free girl",eff:"makes the reader put the two children side by side"}]},
 {t:"she lets a piece of paper beat a person",name:"paper beats a person",by:"letting a piece of paper beat a person",e:[
   {lead:"When Eli is moved",q:"That's not what his paper says. He was meant to move last week. And writing doesn't lie.",shows:"a form outranks what everyone in the room can see",eff:"makes the reader feel how helpless a person is against a rule"},
   {lead:"When Eli reads the wrappers",q:"I guess they don't want us getting any ideas, hey?",shows:"even the word freedom is rationed",eff:"lets the reader see the camp's control through a joke"}]},
 {t:"she has people hand each other hope",name:"hope handed on",by:"having people hand each other hope",e:[
   {lead:"After Nasir dies",q:"Tonight, you look up at that sky, and there will be a new star there.",shows:"Harvey gives Subhi somewhere to put his grief",eff:"shows the reader that hope arrives from a person, not from luck"},
   {lead:"When Queeny and Eli get the photos out",q:"…about Queeny and Eli sneaking in the camera to get their pictures out into the world.",shows:"being seen is the one thing they can still arrange",eff:"makes the reader feel why being seen matters"}]},
 {t:"she never lets someday arrive",name:"someday",by:"never letting someday arrive",e:[
   {lead:"When Maá talks about the future",q:"Someday, Subhi, someday they see we belong.",shows:"belonging is always being put off until later",eff:"makes the reader notice how long someday has already lasted"},
   {lead:"When Jimmie comes back",q:"Like maybe it really will be okay. Someday.",shows:"Subhi borrows his mother's word for his own hope",eff:"leaves the reader hopeful and uneasy at the same time"}]},
 {t:"she explains how detention centres are run"},
 {t:"she makes the reader laugh at Subhi"},
 {t:"she wants the reader to feel sorry for the Jackets"},
 {t:"she teaches the reader about ducks"},
 {t:"she keeps the ending a secret"}
]};
const FALLBACK={purpose:[POOL.purpose[0],POOL.purpose[1]]};
const A_=t=>`<em class="hl-idea" data-sub="A">${t}</em>`, B_=t=>`<em class="hl-idea" data-sub="B">${t}</em>`;
const NM=o=>esc(o.name||o.t);
const BY=o=>esc(o.by||o.t);
const ev=(o,i)=>o.e?o.e[i]:null;
/* the purpose leads the topic sentence and the link; the way is the idea
   inside it, and each piece of evidence proves the way */
const SENT={
  T:(o)=>`One way Fraillon <em class="hl-eff">${PURPOSE}</em> is by <em class="hl-idea">${BY(o)}</em>.`,
  E:(o,i)=>{const x=ev(o,i), tag=i?B_:A_; return x
    ? `${esc(x.lead)}, <em class="hl-ev">“${esc(x.q)}”</em> This <em class="hl-verb">shows</em> that ${tag(esc(x.shows))}, which <em class="hl-eff">${esc(x.eff)}</em>.`
    : `When …, <em class="hl-ev">“…”</em> This <em class="hl-verb">shows</em> that ${tag("…")}, which …`;},
  L:(o)=>{const a=ev(o,0),b=ev(o,1);
    return `So ${A_(a?esc(a.shows):"…")} and ${B_(b?esc(b.shows):"…")}, which is how <em class="hl-idea">${BY(o)}</em> <em class="hl-eff">${PURPOSE}</em>.`;},
  Lseed:(o)=>`So … and … , which is how <em class="hl-idea">${BY(o)}</em> <em class="hl-eff">${PURPOSE}</em>.`
};
function seed(which,o){
  S.seeded=S.seeded||{};
  const B=S.boxes[which], sd=S.seeded[which]||{};
  const T=SENT.T(o), L=SENT.Lseed(o);
  if(!B[0].trim()||B[0]===sd.T) B[0]=T;
  if(!B[3].trim()||B[3]===sd.L) B[3]=L;
  S.seeded[which]={T,L}; save();
}
const STEMS={
  im:["One way Fraillon … is by …","When …, “…” This shows that …, which …","When …, “…” This shows that …, which …","So … and …, which is how … …"],
  fr:["One way Fraillon … is by …","When …, “…” This shows that …, which …","When …, “…” This shows that …, which …","So … and …, which is how … …"]
};
/* the bars: the purpose in green, the way in blue, evidence proving the way */
function drawAnchor(id,o){
  const a=ev(o,0),b=ev(o,1), sa=a?esc(a.shows):"what it shows", sb=b?esc(b.shows):"what it shows";
  const seg=(k,f,txt)=>`<i class="${k}" style="flex:${f}">${txt||""}</i>`;
  $(id).innerHTML=`<h3>${NM(o)}</h3>
    <div class="row"><b>T</b><div class="bar">${seg("eff",4,"the purpose")}${seg("idea",3,BY(o))}</div></div>
    <div class="row"><b>E</b><div class="bar">${seg("ev",3,"quote")}${seg("verb",1,"shows")}${seg("idea",3,sa)}${seg("eff",3,"why")}</div></div>
    <div class="row"><b>E</b><div class="bar">${seg("ev",3,"quote")}${seg("verb",1,"shows")}${seg("idea",3,sb)}${seg("eff",3,"why")}</div></div>
    <div class="row"><b>L</b><div class="bar">${seg("idea",2,sa)}${seg("idea",2,sb)}${seg("eff",3,"the purpose")}</div></div>`;
}
