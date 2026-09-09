/* Paragraph options for the purpose prompt. Keep the first eight indices
   stable: saved brainstorm choices refer to them. Each model is written as
   a paragraph, rather than assembled from interchangeable clauses. */
const I=(t,sub)=>'<em class="hl-idea"'+(sub?' data-sub="'+sub+'"':'')+'>'+t+'</em>';
const V=t=>'<em class="hl-verb">'+t+'</em>';
const Q=t=>'<em class="hl-ev">“'+t+'”</em>';
const P=t=>'<em class="hl-eff">'+t+'</em>';
const POOL={purpose:[
 {t:"Subhi's childhood",name:"Subhi's childhood",
  topic:"By letting Subhi tell his own story, Fraillon "+V("presents")+" him as "+I("a child with a vivid imagination and a need for comfort")+".",
  e:[
   "Subhi describes how "+Q("the dirt outside turns into a beautiful ocean")+". The contrast between the dirt and the ocean "+V("reveals")+" "+I("his ability to imagine beauty in the camp","A")+", "+P("giving the reader access to his private world")+".",
   "He reaches towards his mother, "+Q("my fingers feeling for her smile in the dark")+". This small gesture "+V("shows")+" "+I("his wish to share the experience with her","B")+", "+P("allowing readers to recognise a child's familiar need for closeness")+"."],
  link:"Through "+I("Subhi's imagination","A")+" and "+I("his affection for his mother","B")+", Fraillon "+V("encourages")+" readers to "+P("see him as a child with thoughts and feelings that an ID number cannot express")+"."},
 {t:"names and identity",name:"names and identity",
  topic:"Fraillon "+V("shows")+" that "+I("names and language are important parts of a person's identity")+".",
  e:[
   "Harvey learns the children's names so that he can "+Q("talk with us for real, instead of talking to us by our numbers")+". The contrast "+V("suggests")+" that "+I("using a name recognises the individual","A")+", "+P("drawing attention to the impersonal way the camp treats its detainees")+".",
   "Subhi whispers "+Q("the few words of Rohingya that I know")+" to remind himself that he is more than "+Q("only Aussie Boy")+". His determination "+V("emphasises")+" "+I("his need to preserve his culture","B")+" and "+P("encourages readers to respect this part of his identity")+"."],
  link:"By showing the importance of "+I("a name","A")+" and "+I("a connection to culture","B")+", Fraillon "+V("invites")+" readers to "+P("respect the individual identities hidden by the camp's numbers")+"."},
 {t:"everyday needs",name:"everyday needs",
  topic:"Fraillon "+V("reveals")+" that "+I("detention prevents people from meeting ordinary needs for freedom, family and learning")+".",
  e:[
   "Subhi admits, "+Q("None of us knows what it is like just on the other side of the fences.")+" The word "+Q("just")+" "+V("emphasises")+" "+I("how close ordinary life is, although he cannot experience it","A")+", "+P("encouraging readers to question his confinement")+".",
   "The men in Alpha live "+Q("without their families, without being able to work or learn or do anything")+". The repeated "+Q("without")+" "+V("highlights")+" "+I("the relationships and activities they have lost","B")+", "+P("prompting readers to consider how they would cope with these restrictions")+"."],
  link:"These limits on "+I("freedom","A")+" and "+I("daily life","B")+" "+V("encourage")+" readers to "+P("understand detention through the needs of the people living there")+"."},
 {t:"fear and violence",name:"fear and violence",
  topic:"By describing Beaver's violence from Subhi's perspective, Fraillon "+V("presents")+" "+I("a frightened child exposed to an adult's power")+".",
  e:[
   "When Beaver questions him, Subhi thinks, "+Q("I can't talk. I can't say a single thing.")+" The repeated "+Q("I can't")+" "+V("conveys")+" "+I("fear so strong that he cannot answer","A")+", "+P("helping the reader understand his silence")+".",
   "Beaver then shoves him "+Q("so hard that my feet leave the ground")+". This physical detail "+V("emphasises")+" "+I("the difference in strength between the adult and the child","B")+", "+P("making Subhi's vulnerability clear to the reader")+"."],
  link:"By showing "+I("Subhi's fear","A")+" alongside "+I("his physical vulnerability","B")+", Fraillon "+V("asks")+" readers to "+P("consider the harm done to a child in the camp's care")+"."},
 {t:"Subhi and Jimmie's friendship",name:"Subhi and Jimmie's friendship",
  topic:"Subhi and Jimmie's friendship "+V("shows")+" that "+I("children on either side of the fence can find trust and happiness in each other")+".",
  e:[
   "Subhi describes Jimmie as "+Q("the kind of person that keeps a promise")+". His confidence in her "+V("reveals")+" "+I("the security their friendship gives him","A")+", "+P("allowing readers to recognise his need for someone he can rely on")+".",
   "Fraillon describes Jimmie's face as shining "+Q("like someone's lit a candle in her cheeks")+". This warm image "+V("suggests")+" "+I("her happiness in Subhi's company","B")+", "+P("showing readers what he contributes to her life")+"."],
  link:"Their "+I("trust","A")+" and "+I("shared happiness","B")+" "+V("encourage")+" readers to "+P("see Subhi as a valued friend whose relationships matter")+"."},
 {t:"the camp's rules",name:"the camp's rules",
  topic:"The decision to move Eli into Alpha "+V("reveals")+" how "+I("the camp's rules take priority over a child's wellbeing")+".",
  e:[
   "Although Eli is too young for Alpha, a Jacket insists, "+Q("That's not what his paper says.")+" The appeal to paperwork "+V("shows")+" that "+I("Eli is being judged by his record rather than his actual age","A")+", "+P("encouraging readers to question the fairness of the decision")+".",
   "Subhi describes life in Alpha as being "+Q("without their families, without being able to work or learn")+". The repeated "+Q("without")+" "+V("emphasises")+" "+I("the losses Eli faces","B")+", "+P("inviting readers to judge the decision by its effect on him")+"."],
  link:"By connecting "+I("the official decision","A")+" with "+I("its consequences for Eli","B")+", Fraillon "+V("encourages")+" readers to "+P("question a system that values a record above the person it describes")+"."},
 {t:"care and neglect",name:"care and neglect",
  topic:"Harvey's kindness "+V("exposes")+" "+I("how little care the other Jackets show towards the children")+".",
  e:[
   "Subhi says Harvey has "+Q("come in extra early today")+" to bring a pool in the heat. This extra effort "+V("shows")+" "+I("that the children's comfort matters to him","A")+", "+P("helping readers understand why they value his kindness")+".",
   "While Harvey struggles with the pool and the gates, "+Q("not a single one helps")+". The contrast "+V("reveals")+" "+I("the other Jackets' indifference","B")+", "+P("encouraging readers to question why such a simple act of care is unusual")+"."],
  link:"The contrast between "+I("Harvey's care","A")+" and "+I("the others' neglect","B")+" "+V("reminds")+" readers that "+P("the children behind the numbers deserve comfort and consideration")+"."},
 {t:"hope and belonging",name:"hope and belonging",
  topic:"Fraillon "+V("presents")+" "+I("hope for a life beyond detention as something Subhi shares with his mother")+".",
  e:[
   "Maá tells him, "+Q("Someday, Subhi, someday they see we belong.")+" The repeated "+Q("someday")+" "+V("expresses")+" "+I("her wish to be accepted","A")+", while "+P("leaving the reader aware that she cannot say when it will happen")+".",
   "Subhi later thinks, "+Q("Like maybe it really will be okay. Someday.")+" His use of the same word "+V("suggests")+" "+I("that he shares his mother's hope","B")+", while "+Q("maybe")+" "+P("leaves readers uncertain whether it will be fulfilled")+"."],
  link:"By giving "+I("Maá","A")+" and "+I("Subhi","B")+" a shared wish for belonging, Fraillon "+V("encourages")+" readers to "+P("recognise a family's hopes for the future behind its official numbers")+"."}
]};
const FALLBACK={purpose:[POOL.purpose[1],POOL.purpose[0]]};
const NM=o=>esc(o.name||o.t);
const SENT={
  T:o=>o.topic||"",
  E:(o,i)=>o.e?o.e[i]:"",
  L:o=>o.link||""
};
const STEMS={
  im:["Fraillon shows that …","For example, …","Further evidence …","Through …, Fraillon encourages readers to …"],
  fr:["Fraillon shows that …","For example, …","Further evidence …","Through …, Fraillon encourages readers to …"]
};
function seed(which,o){
  S.seeded=S.seeded||{};
  const previous=S.seeded[which]||{}, boxes=S.boxes[which];
  const oldModel=POOL.purpose.find(p=>p.name===previous.idea);
  const oldRows=oldModel?[SENT.T(oldModel),SENT.E(oldModel,0),SENT.E(oldModel,1),SENT.L(oldModel)]:[];
  const rows=[SENT.T(o),SENT.E(o,0),SENT.E(o,1),SENT.L(o)];
  if(previous.idea && previous.idea!==(o.name||o.t)){
    boxes.forEach((h,i)=>{if(h && h===oldRows[i]) boxes[i]=which==='im'?rows[i]:'';});
  }
  if(which==='im'&&!boxes[0].trim()) boxes[0]=rows[0];
  S.seeded[which]={idea:o.name||o.t}; save();
}
function drawAnchor(id,o){
  const seg=(k,txt)=>'<i class="'+k+'" style="flex:1">'+txt+'</i>';
  $(id).innerHTML='<h3>'+NM(o)+'</h3>'+
    '<div class="row"><b>T</b><div class="bar">'+seg('verb','shows')+seg('idea','idea')+'</div></div>'+
    '<div class="row"><b>E</b><div class="bar">'+seg('ev','evidence')+seg('verb','verb')+seg('idea','analysis')+'</div></div>'+
    '<div class="row"><b>E</b><div class="bar">'+seg('ev','evidence')+seg('verb','verb')+seg('idea','analysis')+'</div></div>'+
    '<div class="row"><b>L</b><div class="bar">'+seg('idea','idea')+seg('eff','purpose')+'</div></div>';
}

/* Saved writing stays on the same key. Migration only replaces exact old
   auto-seeded text or known, unchanged model suggestions. */
const LEGACY_MODELS=["158:1ee9681f:7abc6eab","332:37c9b679:32b5ee5","406:17d200eb:b4239121","346:2e5b3e82:9cd8cf5c","161:b4ed6e34:af6aefd0","158:22c5b97e:3cf1c100","361:40d3597d:d5c3c191","402:a6373119:f5db8131","334:ea25dc31:1f44e7a7","161:4b6bb793:252b719b","171:889d0d8a:9c43eb78","339:219654ad:625a657b","339:6c0ce9d0:d53a27ec","333:2578a8da:a95716de","174:6fcd4717:f0f93363","167:fdb5bf80:1aa8123c","323:2063a976:7a554300","355:d1f9b348:9c177be2","351:d6e2e87b:a24af951","170:87a7ce51:4bf5f8a7","174:af53f499:69a279cd","328:711268eb:4d0ec867","305:358cab2e:75998bb0","347:5237d77f:7aa7c6dd","177:59eabeba:17988376","162:c746b61e:8a7bd63a","355:80c03e40:54923696","303:22390bd:bcca1fd9","320:64dcd004:b21ecbba","165:9ad814d3:fa40f421","158:35ff905f:8cafe9d7","333:4996aa88:3b0ea460","358:e6561ab:2999014d","329:2f5ae8d2:436b9704","161:a9865914:fbf7352c","152:cafca6ad:6c94a401","318:ff36df4:2b75a856","306:39e9ab64:f3ea63d8","321:71d03637:7197f70d","155:ddf3f2f6:68cc2bba","193:d5de3082:3d706926","124:f2a98d37:4bd42a3b","124:fb0fb638:4ec3ea98","271:939e4998:a895fffe","196:5a6bb3ff:8f70c6fd","223:7284859e:dad6b470","301:b3d484f0:f5cce2a8","226:1cb9ecb3:6f97a6b","196:144aa688:c2e26148","274:b5f74c68:1a95f1b0","199:b59b2249:d45693d3","167:4b3fb77c:1a678b2e","245:23852446:2eb79136","170:3c43e7d5:41173075","157:f60c6969:e42446ef","235:544f48d1:c3dcc417","160:a42c486a:e0129054","166:cbaa62ee:3bb55e2e","244:fb5109e2:8f234ed6","169:5d616f43:f7b6b135","159:920add85:26ff6685","237:f7e5b871:fe4855bd","162:c0cdcf1e:7e91effe","174:b44b5f55:34b89a1b","252:191c634f:4c9823c3","177:7679be2e:e7a7f060","158:268699a9:f64cd759","236:a83da30f:518e0701","161:a7cc98aa:22d6c3e2","153:8f88d996:dac93846","231:58486bf0:340d8ede","156:55ee7fb:5046ccdd","181:e8f0e2ec:b77fbba","368:5fef0028:dde09934","413:8333653d:aee54ef3","358:f400d9c0:78798a04","184:b0417325:9943cfe1","177:70faa6f2:4fb73cce","373:5ab4475e:6bb8c380","435:abdbe655:5eee0465","396:a0dec648:f6b3431a","180:28ac252f:6577dbd5","177:6ed21413:ca5a04c5","306:5e8a6828:c9ff2478","365:f69a2a0b:5e820e0d","365:54db8fb:1ffc8c3f","180:9feac750:38bf193e","160:ef46fcf3:f926f51f","360:852d32ec:47d72240","347:c03d88d5:e4c5165f","368:2d14a1bb:469f8c7","163:742781b0:fd6c88e4","195:d8be21c4:581de432","381:bfbbf1c0:7453c87a","393:f6d14345:94548ff9","410:5610fdb2:8020bbcc","198:7746ba8d:906530e9","177:9aea2f99:a3bd0cf","323:e6258e03:1ce8e83d","417:63435a60:85be62ec","370:9f39a3f4:39c1cf72","180:5c557e9a:23e6ae74","192:afe7491c:a8019c52","326:31d2e16b:8485c37f","347:9a189884:16e4d05e","383:633a86da:348bb314","195:56ee7ff5:72887689","162:bdc9c0b9:24e7a3c5","240:f0396d0b:c5cffa1d","165:183ef89a:9c137e7e","165:eb7e389d:c8feb073","243:5ff88af1:1f7713cb","168:b47ea566:977acb48","163:3199150:ad3812aa","241:7747595a:ee023732","166:dcf51a01:4f81a6f1"];
function modelFingerprint(h){
  let a=2166136261,b=5381;
  for(let i=0;i<h.length;i++){a=Math.imul(a^h.charCodeAt(i),16777619);b=Math.imul(b,33)^h.charCodeAt(i);}
  return h.length+':'+(a>>>0).toString(16)+':'+(b>>>0).toString(16);
}
function upgradePurposeState(){
  if(S.purposeVersion===2) return;
  const generated=new Set(LEGACY_MODELS);
  for(const which of ['im','fr']){
    const sd=(S.seeded||{})[which]||{};
    S.boxes[which]=S.boxes[which].map((h,i)=>
      ((i===0&&h===sd.T)||(i===3&&h===sd.L)||generated.has(modelFingerprint(h)))?'':h);
  }
  const st=S.clouds.purpose;
  if(st){
    st.nodes=st.nodes.filter(n=>n.i==null||n.i<POOL.purpose.length);
    st.nodes.forEach(n=>{
      if(n.i>=0&&n.i<POOL.purpose.length) n.t=POOL.purpose[n.i].t;
      else n.i=-1;
      delete n.st;
    });
    st.used=st.used.filter(i=>i<POOL.purpose.length);
    st.order=POOL.purpose.map((_,i)=>i).sort(()=>Math.random()-.5);
  }
  S.seeded={}; S.purposeVersion=2;
}
