/* ---------------- kinds of power the class can pull into the cloud ----
   t: the bubble. name: the short name. c: the kind, as a topic-sentence clause.
   e: two pieces of evidence, each with what it shows and what it does to the
   reader. A bubble with no e does not belong. */
const POOL={power:[
 {t:"the Jackets have physical power",name:"physical power",c:"the physical power the Jackets hold over everyone in the camp",e:[
   {lead:"When Beaver catches Subhi at the fence",q:"He shoves me backward so hard that my feet leave the ground.",shows:"the Jackets' power is in their bodies",eff:"makes the reader feel how small and breakable Subhi is next to them"},
   {lead:"In the same scene",q:"I can't talk. I can't say a single thing.",shows:"physical power also takes away Subhi's voice",eff:"makes the reader understand that fear can silence a person before a word is said"}]},
 {t:"a piece of paper has more power than a person",name:"the power of paper",c:"the power a piece of paper has over a person's life",e:[
   {lead:"When Eli is moved",q:"That's not what his paper says. He was meant to move last week. And writing doesn't lie.",shows:"a form counts for more than what everyone can see",eff:"makes the reader feel how helpless the people in the camp are"},
   {lead:"When Eli reads the wrappers",q:"I guess they don't want us getting any ideas, hey?",shows:"even the word freedom is something the camp controls",eff:"lets the reader see the camp's power through a joke"}]},
 {t:"imagination gives Subhi power to deal with things",name:"the power of imagination",c:"the power imagination gives Subhi to deal with the camp",e:[
   {lead:"When the novel opens",q:"Sometimes, at night, the dirt outside turns into a beautiful ocean.",shows:"Subhi can change the camp in his own mind",eff:"shows the reader a power the Jackets cannot touch"},
   {lead:"When Subhi explains the Night Sea",q:"A bit like my Night Sea that goes straight into my eyes that no one else can see.",shows:"his imagination is private and his own",eff:"makes the reader feel that this is the one place Subhi is free"}]},
 {t:"knowledge is power",name:"knowledge",c:"the power that comes from knowing things",e:[
   {lead:"When Subhi gives Eli the rock",q:"Harvey taught me all about space and rocks.",shows:"what Harvey teaches him is something Subhi gets to keep",eff:"shows the reader that knowledge is a gift nobody can confiscate"},
   {lead:"At home in her kitchen",q:"Jimmie wonders if her dad even remembers that she can't read.",shows:"not being able to read shuts Jimmie out of her own mother's story",eff:"makes the reader feel how much is lost without knowledge"}]},
 {t:"a name is power",name:"the power of a name",c:"the power of being called by your name instead of a number",e:[
   {lead:"When Subhi describes Harvey",q:"…learn their names so that he can talk with us for real, instead of talking to us by our numbers.",shows:"a name makes a person real",eff:"shows the reader how the camp takes people's power away one number at a time"},
   {lead:"After Nasir dies",q:"…I whisper the few words of Rohingya that I know, just so my brain doesn't turn to thinking that they are right and that I am only Aussie Boy.",shows:"Subhi's own language is a way of holding on to who he is",eff:"makes the reader feel the fight to stay yourself"}]},
 {t:"getting the truth out is power",name:"the power of the truth",c:"the power of getting the truth out to the world",e:[
   {lead:"When Jimmie remembers what Subhi told her",q:"…about Queeny and Eli sneaking in the camera to get their pictures out into the world.",shows:"a photo can leave the camp when a person cannot",eff:"shows the reader that being seen is a kind of power"},
   {lead:"When the protest grows",q:"There are twenty-four people with their lips sewn shut now, and eighty-seven on hunger strike.",shows:"the body can speak when words are not heard",eff:"makes the reader feel the cost of being ignored"}]},
 {t:"kindness is a kind of power",name:"kindness",c:"the quiet power of kindness",e:[
   {lead:"After Nasir dies",q:"Tonight, you look up at that sky, and there will be a new star there.",shows:"Harvey gives Subhi something to hold on to",eff:"shows the reader that one kind adult can change how a child survives"},
   {lead:"When Subhi describes Harvey",q:"…learn their names so that he can talk with us for real, instead of talking to us by our numbers.",shows:"treating people as people is a choice a Jacket can make",eff:"makes the reader see the difference one person makes"}]},
 {t:"friends give each other power",name:"friendship",c:"the power friends give each other",e:[
   {lead:"After Jimmie leaves",q:"I know for sure that Jimmie is the kind of person that keeps a promise.",shows:"a promise kept gives Subhi something to count on",eff:"makes the reader understand how rare that is in his life"},
   {lead:"When Subhi shows Eli the shell",q:"Eli, he's the only one I show all my treasures to.",shows:"trust is something the camp cannot ration",eff:"shows the reader where Subhi's power comes from"}]},
 {t:"Subhi is the most powerful person in the camp"},{t:"the ducks are in charge"},{t:"power means being the tallest"},{t:"Jimmie's dad runs the camp"},{t:"the Jackets are always kind"}
]};
const FALLBACK={power:[POOL.power[0],POOL.power[2]]};
const A_=t=>`<em class="hl-idea" data-sub="A">${t}</em>`, B_=t=>`<em class="hl-idea" data-sub="B">${t}</em>`;
const KIND=o=>esc(o.c||o.t), NM=o=>esc(o.name||o.t);
const ev=(o,i)=>o.e?o.e[i]:null;
/* the four sentences, from one kind of power */
const SENT={
  T:(o)=>`One kind of <em class="hl-idea">power</em> in The Bone Sparrow is <em class="hl-idea">${KIND(o)}</em>.`,
  E:(o,i)=>{const x=ev(o,i), tag=i?B_:A_; return x
    ? `${esc(x.lead)}, <em class="hl-ev">“${esc(x.q)}”</em> This <em class="hl-verb">shows</em> that ${tag(esc(x.shows))}, which <em class="hl-eff">${esc(x.eff)}</em>.`
    : `When …, <em class="hl-ev">“…”</em> This <em class="hl-verb">shows</em> that ${tag("…")}, which …`;},
  L:(o)=>{const a=ev(o,0),b=ev(o,1); return `So <em class="hl-idea">${NM(o)}</em> is one kind of power in the camp: ${A_(a?esc(a.shows):"…")}, and ${B_(b?esc(b.shows):"…")}.`;},
  Lseed:(o)=>`So <em class="hl-idea">${NM(o)}</em> is one kind of power in the camp: … , and … .`
};
function seed(which,o){
  S.seeded=S.seeded||{};
  const B=S.boxes[which], sd=S.seeded[which]||{};
  const T=SENT.T(o), L=SENT.Lseed(o);
  if(!B[0].trim()||B[0]===sd.T) B[0]=T;
  if(!B[3].trim()||B[3]===sd.L) B[3]=L;
  S.seeded[which]={T,L}; save();
}

