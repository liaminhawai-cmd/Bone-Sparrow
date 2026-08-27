const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,AlignmentType,VerticalAlign,PageBreak,PageOrientation,LineRuleType,HeightRule,ImageRun}=require('docx');

/* One A3 sheet per student, printed double sided and folded once: four A4
   panels. Imposed so the fold reads 1,2,3,4 — side one carries panels 4 and 1,
   side two carries panels 2 and 3.
   The student is given a chapter and page, not a quote: the evidence is the
   thing they go and find. */
const HUB=process.argv[2]||'BoneSparrowReadingHub.html';
const OUT=process.argv[3]||'BoneSparrow-A3-booklet.docx';
const LIMIT=+(process.argv[4]||0);
const src=fs.readFileSync(HUB,'utf8');
const cut=(a,b)=>src.slice(src.indexOf(a),src.indexOf(b,src.indexOf(a)));
const wb=cut('const WK_BUILD','const TEACH_RAILS_FOCUS');
const qr=cut('const QUICKREADS','const MODULES');

/* ---- one sheet per VERIFIED (chapter, idea, quote) triple -----------------
   Each quickread link holds an idea, four options and the index of the correct
   one. Only that correct option is evidence for that idea in that chapter; the
   other three are distractors, and several are lines from elsewhere in the
   novel. An earlier version of this file used all four as quotes, which is why
   quotes did not match their chapters and ideas did not match their quotes. */
const refs={}; {const rx=/id:"(qr\d)"[\s\S]{0,300}?where:"([^"]*)"/g;let r;
  while((r=rx.exec(qr))) refs[r[1]]=r[2].trim();}
const LINKS=[];
{const re=/id:"(qr\d)L\d",\s*idea:"((?:[^"\\]|\\.)*)",\s*opts:\[([\s\S]*?)\],\s*\n\s*a:(\d)/g;let m;
 while((m=re.exec(qr))){
   const ref=refs[m[1]]||''; if(!ref||/Chapter 5/.test(ref)) continue;
   const opts=m[3].split(/",\s*\n?\s*"/).map(x=>x.replace(/^\s*"|"\s*$/g,'').trim());
   const q=(opts[+m[4]]||'').replace(/^['\u2018\u2019"]+|['\u2018\u2019"]+$/g,'').trim();
   if(q.length<20) continue;
   LINKS.push({ch:m[1], ref:ref, chk:(ref.match(/Chapter \d+/)||[''])[0], idea:m[2].replace(/\\'/g,"'").trim(), quote:q});
 }}
if(!LINKS.length) throw new Error('no verified quote/idea pairs found in the hub');

/* ---- banks ---- */
const bank=(n,p)=>{const b=wb.slice(wb.indexOf(' '+n+':['));const s=b.indexOf('\n ],');
  const body=b.slice(0,s<0?b.length:s);const o=[];const re=/\{ t:"((?:[^"\\]|\\.)*)"([^}]*)\}/g;let x;
  while((x=re.exec(body))){const mt=x[2];const lv=(mt.match(/lv:\[(\d),(\d)\]/)||[0,5,9]);
    o.push({t:x[1],lo:+lv[1],hi:+lv[2],q:(mt.match(/q:"(\w+)"/)||[])[1]});}return o.filter(p);};
const IDEAS_APP=bank('ideas', o=>o.lo>=7&&o.hi<=8&&o.q!=='weak');
const VERBS  =bank('verbs',  o=>o.q==='good'&&o.lo<=7).slice(0,7);
/* The four kinds of purpose, in the rubric's own words. Unlike a bank of
   specific effect sentences, these are true of any page of the novel. */
const PURPOSES=["makes the reader feel\u2026","makes the reader understand\u2026",
                "positions the reader to\u2026","keeps from the reader\u2026"];

/* Ideas are offered as single words. A student who can only write "loneliness"
   has still named something true about the page; a student who can go further
   has somewhere to go. Each chapter's first four are read from the ideas the
   app already verifies for that chapter, so every option in the box is
   circle-able for the page the student is holding. */
const THEMES={
  "Chapter 6" :["grief","being unseen","curiosity","family"],
  "Chapter 8" :["dignity","not enough to go round","kindness","being a number"],
  "Chapter 10":["friendship","imagination","hope","darkness"],
  "Chapter 14":["trust","friendship","happiness","promises"],
  "Chapter 17":["identity","shame","survival","being forgotten"],
  "Chapter 20":["powerlessness","having a voice","protest","witness"]
};
/* Cycle 3 hands the student one purpose, not a menu: naming the effect is the
   hard part, and the work of that cycle is finding writing that does it.
   One purpose per theme, so the purpose can be pointed at whichever thread
   this sheet's cycle 3 works. */
const AIMS={
 "Chapter 6":{
  "grief":"help the reader to feel how grief has changed Jimmie's family",
  "being unseen":"help the reader to notice who in this family is not being seen",
  "curiosity":"help the reader to feel Jimmie's pull towards the fence",
  "family":"help the reader to understand the importance of family"},
 "Chapter 8":{
  "dignity":"help the reader to understand what dignity costs in the camp",
  "not enough to go round":"help the reader to understand that nothing in the camp comes in the amounts people need",
  "kindness":"help the reader to feel how much one small kindness matters",
  "being a number":"help the reader to understand what it does to people to be counted instead of named"},
 "Chapter 10":{
  "friendship":"help the reader to feel what Jimmie's friendship gives Subhi",
  "imagination":"help the reader to understand why imagination matters in the camp",
  "hope":"help the reader to feel hope arriving",
  "darkness":"help the reader to feel the darkness pressing in"},
 "Chapter 14":{
  "trust":"help the reader to understand how the two children come to trust each other",
  "friendship":"help the reader to feel the friendship growing",
  "happiness":"help the reader to feel the happiness in this moment",
  "promises":"help the reader to understand why a kept promise matters so much here"},
 "Chapter 17":{
  "identity":"help the reader to understand what Subhi is giving up to fit in",
  "shame":"help the reader to feel the shame the camp puts on people",
  "survival":"help the reader to understand what survival costs here",
  "being forgotten":"help the reader to understand that the camp is built to be forgotten"},
 "Chapter 20":{
  "powerlessness":"help the reader to feel how little power anyone inside the fence has",
  "having a voice":"help the reader to understand what it takes to be heard",
  "protest":"help the reader to read the men's silence as protest",
  "witness":"help the reader to understand why Queeny photographs everything"}
};

/* The three cycles on one sheet work three different threads: the quote's own
   idea in cycle 1, an assigned theme in cycle 2, a purpose built from a third
   theme in cycle 3. Indexed by sheet, [cycle-2 theme, cycle-3 theme], each
   chosen away from what that sheet's quote is about. */
const ASSIGN=[
 ["grief","family"],            ["being unseen","grief"],
 ["dignity","not enough to go round"], ["being a number","kindness"],
 ["imagination","darkness"],    ["hope","friendship"],
 ["friendship","happiness"],    ["promises","trust"],
 ["shame","being forgotten"],   ["survival","identity"],
 ["witness","powerlessness"],   ["having a voice","protest"]
];

/* ---- the wall, exactly, minus the Example row ---- */
const wallBlk=cut('const WK_WALL','resps:[');
const WALL=[];{const re=/lv:"(Level \d)", n:(\d), eal:"([^"]*)",\s*\n\s*focus:"([^"]*)",\s*\n\s*vic:"([^"]*)"[\s\S]*?exp:`([^`]*)`/g;let m;
 while((m=re.exec(wallBlk))) WALL.push({lv:m[1],n:+m[2],eal:m[3],focus:m[4],vic:m[5],
   exp:m[6].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()});}

const C={idea:"0B447C",verb:"8A4B12",ev:"7A5A00",eff:"1F5C33",feat:"4B2F7A"};
const SH={idea:"D6EAFC",verb:"FAE3CF",ev:"FFF3B0",eff:"DFF0E2",feat:"E7DDF6"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";
const G={style:BorderStyle.SINGLE,size:4,color:"9C9382"};
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};

const PANW=11200;                       /* an A4-ish panel inside A3 landscape */
/* Writing lines are a single-column table with only its horizontal borders
   drawn: no box down the left and right. Row height is set explicitly so the
   lines are evenly spaced whatever is typed into them. This is the mechanism
   from the EAL film booklets. */
const RULEB={style:BorderStyle.SINGLE,size:4,color:LINE};
const rule=(a)=>new Paragraph({spacing:{after:a||40,line:280,lineRule:LineRuleType.EXACT},
  border:{bottom:{style:BorderStyle.SINGLE,size:4,color:LINE,space:1}},children:[new TextRun({text:"",size:21})]});
const lines=(n)=>[new Table({
  columnWidths:[PANW], width:{size:PANW,type:WidthType.DXA},
  borders:{top:NONE,left:NONE,right:NONE,bottom:RULEB,insideH:RULEB,insideV:NONE},
  rows:Array.from({length:n},()=>new TableRow({
    height:{value:620,rule:HeightRule.ATLEAST},
    children:[new TableCell({width:{size:PANW,type:WidthType.DXA},
      margins:{top:0,bottom:0,left:20,right:20},
      children:[new Paragraph({spacing:{after:0,line:280,lineRule:LineRuleType.EXACT},
        children:[new TextRun({text:"",size:24})]})]})]
  }))})];
const lab=(t,c,sz)=>new Paragraph({spacing:{before:70,after:30},children:[
  new TextRun({text:t,bold:true,size:sz||13,color:c||DEEP,characterSpacing:18,font:"Calibri"})]});
const cell=(ch,w,shade,brd)=>new TableCell({width:{size:w,type:WidthType.DXA},children:ch,
  verticalAlign:VerticalAlign.TOP,
  shading:shade?{type:ShadingType.CLEAR,fill:shade,color:"auto"}:undefined,
  margins:{top:50,bottom:50,left:80,right:80},
  borders:brd||{top:G,bottom:G,left:G,right:G}});
const tagged=(s,sz)=>{const out=[];const re=/\{(\w+)\|([^}]*)\}/g;let last=0,x;
  while((x=re.exec(s))){if(x.index>last)out.push(new TextRun({text:s.slice(last,x.index),size:sz||13}));
    out.push(new TextRun({text:x[2],size:sz||13,color:C[x[1]],bold:true,shading:{type:ShadingType.CLEAR,fill:SH[x[1]]}}));
    last=x.index+x[0].length;}
  if(last<s.length)out.push(new TextRun({text:s.slice(last),size:sz||13}));return out;};

/* The four questions, as the four-colour grid the teacher deck ends on.
   Options sit in two columns, read down then across, so a box is as wide as
   it is tall instead of a long thin list. */
const optCell=(k,title,q,items,w)=>{
  const IW=Math.floor((w-260)/2), rows=Math.ceil(items.length/2);
  const opt=t=>new Paragraph({spacing:{after:44},children:[
    new TextRun({text:t?"○  "+t:"",size:19,color:INK,font:"Calibri"})]});
  const body=items.length<2?items.map(opt)
    :[new Table({columnWidths:[IW,IW],width:{size:IW*2,type:WidthType.DXA},
        borders:{top:NONE,bottom:NONE,left:NONE,right:NONE,insideH:NONE,insideV:NONE},
        rows:Array.from({length:rows},(_,r)=>new TableRow({children:[items[r],items[r+rows]]
          .map(t=>new TableCell({width:{size:IW,type:WidthType.DXA},
            margins:{top:0,bottom:0,left:0,right:60},
            borders:{top:NONE,bottom:NONE,left:NONE,right:NONE},
            children:[opt(t)]}))}))})];
  return cell([new Paragraph({spacing:{after:40},children:[
    new TextRun({text:title,bold:true,size:20,color:C[k],font:"Calibri"}),
    new TextRun({text:"  "+q,size:15,color:MUTED,font:"Calibri",italics:true})]})
  ].concat(body),w,SH[k]);
};

/* Cycle 1 already knows the line, so the yellow box carries it rather than
   asking the student to copy it out twice. Cycles 2 and 3 leave it ruled. */
const writeCell=(w,quote)=>cell([
  new Paragraph({spacing:{after:40},children:[
    new TextRun({text:"Evidence",bold:true,size:20,color:C.ev,font:"Calibri"}),
    new TextRun({text:"  "+(quote?"chapter "+quote.ch:"when"),size:15,color:MUTED,font:"Calibri",italics:true})]}),
  ...(quote
    ? [new Paragraph({spacing:{after:0,line:300,lineRule:LineRuleType.EXACT},
        children:[new TextRun({text:"“"+quote.t+"”",size:19,color:INK,italics:true})]})]
    : [rule(40), rule(40), rule(0)])
],w,SH.ev);

/* Cycle 2's blue box carries its assigned theme the way cycle 1's yellow box
   carries its quote: given, not chosen. */
const ideaCell=(w,theme)=>cell([
  new Paragraph({spacing:{after:40},children:[
    new TextRun({text:"Idea",bold:true,size:20,color:C.idea,font:"Calibri"}),
    new TextRun({text:"  what",size:15,color:MUTED,font:"Calibri",italics:true})]}),
  new Paragraph({children:[new TextRun({text:theme,size:22,color:INK,bold:true,font:"Calibri"})]})
],w,SH.idea);

/* 2x2: circle three, write one. */
const grid=(ideaOpts,purposeOpts,quote,ideaText)=>{const W=Math.floor(PANW/2);
  return new Table({columnWidths:[W,W],width:{size:W*2,type:WidthType.DXA},rows:[
    new TableRow({children:[
      ideaText?ideaCell(W,ideaText):optCell("idea","Idea","what",ideaOpts,W),
      optCell("eff","Purpose","why",purposeOpts||PURPOSES,W)]}),
    new TableRow({children:[
      writeCell(W,quote),
      optCell("verb","Verb","how",VERBS.map(o=>o.t),W)]})
  ]});};

/* A one-line-per-level strip: enough of the wall to lift a draft against,
   without reprinting the whole grid on every page. */
const strip=()=>{const LW=Math.floor(PANW/WALL.length);
  return new Table({columnWidths:WALL.map(()=>LW),width:{size:LW*WALL.length,type:WidthType.DXA},
    rows:[
      new TableRow({children:WALL.map(L=>cell([new Paragraph({alignment:AlignmentType.CENTER,
        children:[new TextRun({text:L.lv.toUpperCase(),bold:true,size:14,color:"F6F1E6",font:"Calibri"})]})],LW,DEEP))}),
      new TableRow({children:WALL.map(L=>cell([new Paragraph({alignment:AlignmentType.CENTER,
        children:[new TextRun({text:L.focus,size:15,color:INK,font:"Calibri"})]})],LW,"FFFFFF"))})
    ]});};

/* ---- the four panels ---- */

/* A worked example drawn as a map: where you started, what branched off it,
   and the sentence that came out. The three maps are the same passage worked
   three ways, so the difference between them is the route, not the material. */
const mapRow=(k,label,text,bk,blabel,branches,sentence)=>{
  const A=3050,B=3350,D=PANW-A-B;
  return new Table({columnWidths:[A,B,D],width:{size:PANW,type:WidthType.DXA},
    rows:[new TableRow({children:[
      cell([new Paragraph({spacing:{after:16},children:[
              new TextRun({text:label,bold:true,size:14,color:C[k],font:"Calibri"})]}),
            new Paragraph({spacing:{line:280,lineRule:LineRuleType.EXACT},children:[
              new TextRun({text:text,size:17,color:INK,italics:k==="ev"})]})],A,SH[k]),
      cell([new Paragraph({spacing:{after:16},children:[
              new TextRun({text:blabel,bold:true,size:14,color:C[bk],font:"Calibri"})]})]
           .concat(branches.map(b=>new Paragraph({spacing:{after:12},children:[
              new TextRun({text:"⤷  ",size:15,color:MUTED}),
              new TextRun({text:b,size:16,color:INK,
                shading:{type:ShadingType.CLEAR,fill:SH[bk]}})]}))),B,"FFFFFF"),
      cell([new Paragraph({spacing:{after:10},children:[
              new TextRun({text:"THE SENTENCE",bold:true,size:14,color:DEEP,
                characterSpacing:14,font:"Calibri"})]}),
            new Paragraph({spacing:{line:300,lineRule:LineRuleType.EXACT},
              children:tagged(sentence,17)})],D,"FFFFFF")]})]});
};

const P1=()=>[
  new Paragraph({spacing:{after:20},children:[
    new TextRun({text:"Name",size:14,color:MUTED,font:"Calibri"}),
    new TextRun({text:"  ______________________  ",size:14,color:LINE,font:"Calibri"}),
    new TextRun({text:"Class",size:14,color:MUTED,font:"Calibri"}),
    new TextRun({text:"  __________",size:14,color:LINE,font:"Calibri"})]}),
  new Paragraph({spacing:{after:16},border:{bottom:{style:BorderStyle.SINGLE,size:10,color:DEEP,space:4}},
    children:[new TextRun({text:"Three ways into a sentence",bold:true,size:22,color:DEEP}),
    new TextRun({text:"\u2003Chapter 5",size:15,color:MUTED,font:"Calibri"})]}),

  lab("1  START FROM THE EVIDENCE",C.ev),
  mapRow("ev","THE LINE",'"My throat is as dry as the dirt"',
    "idea","WHAT IT COULD BE ABOUT",
    ["thirst","fear","who is allowed to speak","a body someone else controls"],
    '{ev|"My throat is as dry as the dirt"} {verb|reveals} {idea|how completely Beaver controls what Subhi’s body can do}, which {eff|makes the reader feel the danger before Subhi names it}.'),

  lab("2  START FROM THE IDEA",C.idea),
  mapRow("idea","THE IDEA","power",
    "ev","LINES THAT PROVE IT",
    ['"I asked you a question"','"my feet leave the ground"','"as dark as the Jackets’ dogs"','"I don\u2019t say anything"'],
    '{idea|The issue of power} is {verb|exposed} when Beaver’s voice arrives {ev|"as dark as the Jackets’ dogs"}, which {eff|positions the reader to fear him before he is described}.'),

  lab("3  START FROM THE PURPOSE",C.eff),
  mapRow("eff","THE PURPOSE","makes the reader feel how little control a child has",
    "feat","WRITING THAT DOES IT",
    ["the shove","the questions with no right answer","the dry‑throat image","the dog comparison"],
    'To {eff|make the reader feel how little control a child has}, Fraillon {verb|writes} Beaver shoving Subhi until {ev|"my feet leave the ground"}.'),

  lab("THE WALL"),
  new Paragraph({spacing:{after:20},children:[
    new ImageRun({type:"png",data:fs.readFileSync(__dirname+"/wall.png"),
      transformation:{width:737,height:236}})]}),

  lab("TYPES OF LANGUAGE TO DISCUSS"),
  ...[["Descriptive writing","writing that uses the senses (sights, feelings, sounds, smells) to describe settings, characters and events.",0],
      ["Dialogue","conversation between characters.",0],
      ["Internal dialogue","a voice written in the story that shows what a character is thinking. We might also think of this as imagined dialogue.",1],
      ["Symbolism","the use of repeated objects or motifs that represent important ideas. For example, birds symbolise freedom, the fence and the Jackets symbolise imprisonment, the camera and photographs symbolise hope.",0]
     ].map(([t,d,ind])=>new Paragraph({spacing:{after:36},indent:ind?{left:340}:undefined,children:[
       new TextRun({text:t+" — ",bold:true,size:17,color:DEEP,font:"Calibri"}),
       new TextRun({text:d,size:17,color:INK,font:"Calibri"})]}))
];

const head=(t)=>new Paragraph({spacing:{after:14},
  border:{bottom:{style:BorderStyle.SINGLE,size:10,color:DEEP,space:4}},
  children:[new TextRun({text:t,bold:true,size:22,color:DEEP})]});
const note=(t)=>new Paragraph({spacing:{after:22},children:[
  new TextRun({text:t,size:14,color:MUTED,font:"Calibri"})]});

/* A page carries what a student writes on and nothing that talks to them:
   the starting point, the boxes, the draft, the wall strip, the rewrite. */
const panel=(title,startRuns,ref,ideaOpts,purposeOpts,quote,ideaText)=>[
  new Paragraph({spacing:{after:14},
    border:{bottom:{style:BorderStyle.SINGLE,size:10,color:DEEP,space:4}},
    children:[new TextRun({text:title,bold:true,size:22,color:DEEP}),
              new TextRun({text:" "+ref,size:15,color:MUTED,font:"Calibri"})]}),
  ...(startRuns.length?[new Paragraph({spacing:{after:24},children:startRuns})]:[]),
  grid(ideaOpts,purposeOpts,quote,ideaText),
  lab("DRAFT"),
  ...lines(7),
  lab("THE WALL"),
  strip(),
  lab("REWRITE"),
  ...lines(7)
];

const P2=(L,opts)=>panel("1 · Start from the evidence",
  [new TextRun({text:"“"+L.quote+"”",size:19,color:INK,italics:true})],
  L.ref, opts, null, {t:L.quote,ch:L.chk.replace('Chapter ','')});

const P3=(L,theme)=>panel("2 · Start from the idea",
  [new TextRun({text:theme,size:22,color:C.idea,bold:true})],
  L.ref, null, null, null, theme);

const P4=(L,theme,opts)=>panel("3 · Start from the effect and purpose",
  [], L.ref, opts, [AIMS[L.chk][theme]]);

/* Two panels side by side on one A3 landscape page, no visible border. */
const spread=(left,right)=>new Table({columnWidths:[PANW,600,PANW],
  width:{size:PANW*2+600,type:WidthType.DXA},
  rows:[new TableRow({children:[
    cell(left,PANW,null,{top:NONE,bottom:NONE,left:NONE,right:NONE}),
    cell([new Paragraph({children:[]})],600,null,{top:NONE,bottom:NONE,
      left:{style:BorderStyle.DASHED,size:4,color:LINE},right:NONE}),
    cell(right,PANW,null,{top:NONE,bottom:NONE,left:NONE,right:NONE})]})]});

/* Folded once, an A3 sheet reads 1,2,3,4. Side one carries panels 4 and 1;
   side two carries panels 2 and 3.

   The Idea box always offers BOTH ideas verified for this student's chapter,
   so at least one circle-able option is correct for the page in front of
   them, plus three ideas from elsewhere as distractors. */
const kids=LINKS.slice(0,LIMIT||LINKS.length);
const children=[];
kids.forEach((L,i)=>{
  const [t2,t3]=ASSIGN[i%ASSIGN.length];
  const mine   = THEMES[L.chk]||[];
  const others = Object.keys(THEMES).filter(k=>k!==L.chk)
                   .reduce((a,k)=>a.concat(THEMES[k]),[]);
  const picks  = [];
  for(let k=0;k<2;k++){const t=others[(i*5+k*7)%others.length];
    if(mine.indexOf(t)<0 && picks.indexOf(t)<0) picks.push(t);}
  const opts   = mine.concat(picks).slice(0,6);
  children.push(spread(P4(L,t3,opts), P1()));
  children.push(new Paragraph({children:[new PageBreak()]}));
  children.push(spread(P2(L,opts), P3(L,t2)));
  if(i<kids.length-1) children.push(new Paragraph({children:[new PageBreak()]}));
});

const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:19,color:INK}}}},
  sections:[{properties:{page:{size:{width:16838,height:23811,orientation:PageOrientation.LANDSCAPE},
    margin:{top:560,bottom:440,left:560,right:560}}},children}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);
  console.log('written '+OUT+' — '+kids.length+' A3 sheets, '+(kids.length*2)+' printed sides');
  kids.forEach((x,i)=>console.log('  '+(i+1)+'. ['+x.ref+'] \u201C'+x.quote.slice(0,54)+'\u201D\n        idea: '+x.idea.slice(0,62)));});
