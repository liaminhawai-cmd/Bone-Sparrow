const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,AlignmentType,VerticalAlign,PageBreak}=require('docx');

/* A booklet per student, in the shape of the EAL film-analysis booklets: a
   reference page, a worked example with a line explaining each colour, then
   three writing cycles. Each cycle starts from a different part of the
   sentence, carries its own sentence stems, and ends with the rubric rows that
   cycle is marked on and a rewrite. Every student's quote is different.

   Everything is read out of the hub and the anchor sheets, so nothing here can
   drift from the app or the printed wall. */
const HUB   = process.argv[2] || 'BoneSparrowReadingHub.html';
const SHEET = process.argv[3] || 'BoneSparrowWagollSheets.html';
const OUT   = process.argv[4] || 'BoneSparrow-writing-booklet.docx';
const LIMIT = +(process.argv[5]||0);
const src = fs.readFileSync(HUB,'utf8');
const shs = fs.readFileSync(SHEET,'utf8');
const slice=(s,a,b)=>s.slice(s.indexOf(a), s.indexOf(b, s.indexOf(a)));
const wb = slice(src,'const WK_BUILD','const TEACH_RAILS_FOCUS');
const qr = slice(src,'const QUICKREADS','const MODULES');

/* ---- quotes, each with a real reference ---------------------------------- */
const quotes=[];
const where = wb.match(/where:"([^"]*)"/)[1];
const segBlock = wb.slice(wb.indexOf(' segs:['), wb.indexOf(' opens:['));
const segRe=/\{ t:"((?:[^"\\]|\\.)*)", themes:\{([^}]*)\}/g; let m;
while((m=segRe.exec(segBlock))){ if(!m[2].trim()) continue;
  quotes.push({t:m[1].replace(/\\"/g,'"'), ref:where}); }
const refs={}; const qrRe=/id:"(qr\d)"[\s\S]{0,300}?where:"([^"]*)"/g; let r;
while((r=qrRe.exec(qr))) refs[r[1]]=r[2].trim();
const linkRe=/id:"(qr\d)L\d",\s*idea:"((?:[^"\\]|\\.)*)",\s*opts:\[([\s\S]*?)\],\s*\n\s*a:(\d)/g; let L;
while((L=linkRe.exec(qr))){
  const opts=L[3].split(/",\s*\n?\s*"/).map(x=>x.replace(/^\s*"|"\s*$/g,'').trim());
  const pick=opts[+L[4]]; if(!pick) continue;
  quotes.push({t:pick.replace(/^['"]|['"]$/g,''), ref:refs[L[1]]||'', idea:L[2]});
}

/* ---- banks --------------------------------------------------------------- */
const bank=(name,pred)=>{
  const b=wb.slice(wb.indexOf(' '+name+':['));
  const stop=b.indexOf('\n ],'); const body=b.slice(0,stop<0?b.length:stop);
  const out=[]; const re=/\{ t:"((?:[^"\\]|\\.)*)"([^}]*)\}/g; let x;
  while((x=re.exec(body))){ const meta=x[2];
    const lv=(meta.match(/lv:\[(\d),(\d)\]/)||[0,5,9]);
    out.push({t:x[1], lo:+lv[1], hi:+lv[2], q:(meta.match(/q:"(\w+)"/)||[])[1]}); }
  return out.filter(pred);
};
const IDEAS   = bank('ideas',   o=>o.lo>=7&&o.hi<=8&&o.q!=='weak').slice(0,6);
const VERBS   = bank('verbs',   o=>o.q==='good'&&o.lo<=7).slice(0,8);
const EFFECTS = bank('effects', o=>o.lo>=7&&o.q!=='weak'&&o.q!=='interp').slice(0,6);

/* ---- worked examples, already colour-tagged on the anchor sheets ---------- */
const exBlock = slice(shs,'const EXAMPLES','const EXPLANATIONS');
const exFor=lv=>{ const k='"Level '+lv+'":'; const i=exBlock.indexOf(k); if(i<0) return null;
  const a=exBlock.indexOf('`',i), b=exBlock.indexOf('`',a+1); return exBlock.slice(a+1,b); };
const expBlock = shs.slice(shs.indexOf('const EXPLANATIONS'));
const expFor=lv=>{ const k='"Level '+lv+'": {'; const i=expBlock.indexOf(k); if(i<0) return {};
  const seg=expBlock.slice(i,expBlock.indexOf('},',i)); const o={}; const re=/(\w+):"((?:[^"\\]|\\.)*)"/g; let x;
  while((x=re.exec(seg))) o[x[1]]=x[2].replace(/\\u201C/g,'“').replace(/\\u201D/g,'”').replace(/\\"/g,'"');
  return o; };

/* ---- palette -------------------------------------------------------------- */
const C={idea:"0B447C",verb:"8A4B12",ev:"7A5A00",eff:"1F5C33",feat:"4B2F7A"};
const SH={idea:"D6EAFC",verb:"FAE3CF",ev:"FFF3B0",eff:"DFF0E2",feat:"E7DDF6"};
const SQ={idea:"\u{1F7E6}",verb:"\u{1F7E7}",ev:"\u{1F7E8}",eff:"\u{1F7E9}",feat:"\u{1F7EA}"};
const NM={idea:"the idea",verb:"the verb",ev:"the evidence",eff:"the effect on the reader",feat:"the way it is written"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";
const G={style:BorderStyle.SINGLE,size:4,color:"9C9382"};

const FEATURES=[
 {n:"Descriptive writing",d:"uses the senses — sights, sounds, smells, feelings — to describe settings, characters and events"},
 {n:"Internal dialogue",  d:"a voice in the story showing what a character is thinking"},
 {n:"Symbolism",          d:"repeated objects or motifs standing for bigger ideas: birds for freedom, the fence and the Jackets for imprisonment, the camera for hope"}
];

const RUBRIC=[
 {k:"idea",name:"The idea",d:{6:"I can describe characters and events that relate to key ideas",
  7:"I can describe the ideas and issues that are illustrated through characters and events",
  8:"I can explain the way ideas and issues are represented by characters and events",
  9:"I can analyse the way different people and perspectives are represented in the story"}},
 {k:"feat",name:"The way it is written",d:{6:"I can describe language features, perspectives and non-literal ideas from the story",
  7:"I can describe the meaning of language and literary features that create characterisation and tone",
  8:"I can explain how language and literary features create setting, characterisation and tone",
  9:"I can analyse how language features and non-literal language work together to explore ideas"}},
 {k:"verb",name:"The verb",d:{6:"I can use a reporting verb accurately",
  7:"I can use an analytical verb that carries the thinking",8:"I can open on the author's choice",
  9:"I can use a verb that says what the writing does to the reader"}},
 {k:"ev",name:"The evidence",d:{6:"I can include details from the text in my response",
  7:"I can use details from the text to demonstrate my ideas",
  8:"I can embed details from the text to support my interpretation",
  9:"I can use a range of complex sentence structures to embed different types of evidence"}},
 {k:"eff",name:"The effect on the reader",d:{6:"I can say what the writing makes the reader feel",
  7:"I can say what the writing makes the reader understand",8:"I can say how the writing positions the reader",
  9:"I can say what the writing withholds from the reader"}}
];
const LVLS=[6,7,8,9];

/* ---- building blocks ------------------------------------------------------ */
const rule=(after)=>new Paragraph({spacing:{after:after||70,line:320},
  border:{bottom:{style:BorderStyle.SINGLE,size:4,color:LINE,space:1}},children:[new TextRun({text:"",size:20})]});
const lines=n=>Array.from({length:n},()=>rule());
const label=(t,col,sz)=>new Paragraph({spacing:{before:90,after:35},children:[
  new TextRun({text:t,bold:true,size:sz||14,color:col||DEEP,characterSpacing:20,font:"Calibri"})]});
const body=(t,sz,col)=>new Paragraph({spacing:{after:40},children:[
  new TextRun({text:t,size:sz||16,color:col||INK,font:"Calibri"})]});
const stem=(t)=>new Paragraph({spacing:{after:25},indent:{left:220},children:[
  new TextRun({text:"•  "+t,size:15,color:INK,font:"Calibri"})]});
const chip=(t,k)=>new TextRun({text:"  "+t+"  ",size:13,color:C[k],bold:true,font:"Calibri",
  shading:{type:ShadingType.CLEAR,fill:SH[k]}});
const chipRow=(items,k)=>new Paragraph({spacing:{after:45},
  children:items.flatMap(o=>[chip(o.t||o.n||o,k),new TextRun({text:" ",size:13})])});
const cell=(ch,w,shade)=>new TableCell({width:{size:w,type:WidthType.DXA},children:ch,
  verticalAlign:VerticalAlign.CENTER,
  shading:shade?{type:ShadingType.CLEAR,fill:shade,color:"auto"}:undefined,
  margins:{top:45,bottom:45,left:70,right:70},borders:{top:G,bottom:G,left:G,right:G}});
const bar=(t)=>new Paragraph({spacing:{before:60,after:18},
  border:{bottom:{style:BorderStyle.SINGLE,size:10,color:DEEP,space:4}},
  children:[new TextRun({text:t,bold:true,size:18,color:DEEP})]});

/* Render an anchor-sheet example: {idea|...} becomes a coloured run. */
const tagged=(s,sz)=>{ const out=[]; const re=/\{(\w+)\|([^}]*)\}/g; let last=0,x;
  while((x=re.exec(s))){ if(x.index>last) out.push(new TextRun({text:s.slice(last,x.index),size:sz||15}));
    out.push(new TextRun({text:x[2],size:sz||15,color:C[x[1]],bold:true,shading:{type:ShadingType.CLEAR,fill:SH[x[1]]}}));
    last=x.index+x[0].length; }
  if(last<s.length) out.push(new TextRun({text:s.slice(last),size:sz||15}));
  return out; };

/* Only the rubric rows a cycle is marked on. */
const miniRubric=(keys)=>{
  const LABW=1500, LVLW=Math.floor((9746-LABW)/LVLS.length);
  const rows=[new TableRow({tableHeader:true,children:[cell([new Paragraph({children:[]})],LABW,DEEP)]
    .concat(LVLS.map(n=>cell([new Paragraph({alignment:AlignmentType.CENTER,children:[
      new TextRun({text:"LEVEL "+n,bold:true,size:12,color:"F6F1E6",font:"Calibri",characterSpacing:8})]})],LVLW,DEEP)))})];
  RUBRIC.filter(x=>keys.indexOf(x.k)>=0).forEach(row=>rows.push(new TableRow({children:[
    cell([new Paragraph({children:[new TextRun({text:SQ[row.k]+" "+row.name,bold:true,size:11,color:C[row.k],font:"Calibri"})]})],LABW,SH[row.k])]
    .concat(LVLS.map(n=>cell([new Paragraph({children:[new TextRun({text:row.d[n],size:11,color:INK,font:"Calibri"})]})],LVLW,"FFFFFF")))})));
  return new Table({columnWidths:[LABW].concat(LVLS.map(()=>LVLW)),
    width:{size:LABW+LVLW*LVLS.length,type:WidthType.DXA},rows});
};

const cycle=(n,title,startLabel,startRuns,stems,extra,keys)=>[
  bar("Cycle "+n+" — "+title),
  label(startLabel,DEEP),
  new Paragraph({spacing:{after:35},children:startRuns}),
  ...extra,
  label("SENTENCE STEMS",MUTED,13),
  ...stems.map(stem),
  label("WRITE YOUR SENTENCE"),
  ...lines(6),
  label("HOW IT IS MARKED",MUTED,13),
  miniRubric(keys),
  label("NOW LIFT IT — REWRITE"),
  ...lines(7),
  new Paragraph({children:[new PageBreak()]})
];

const booklet=(qt,idea,eff,i,total)=>{
  const FW=Math.floor(9746/3);
  return [
  /* ---- page 1: the reference ---- */
  new Paragraph({spacing:{after:25},children:[
    new TextRun({text:"Name",size:14,color:MUTED,font:"Calibri"}),
    new TextRun({text:"  ____________________________     ",size:14,color:LINE,font:"Calibri"}),
    new TextRun({text:"Class",size:14,color:MUTED,font:"Calibri"}),
    new TextRun({text:"  ____________          ",size:14,color:LINE,font:"Calibri"}),
    new TextRun({text:"Booklet "+(i+1)+" of "+total,size:14,color:MUTED,font:"Calibri"})]}),
  new Paragraph({spacing:{after:15},border:{bottom:{style:BorderStyle.SINGLE,size:12,color:DEEP,space:5}},
    children:[new TextRun({text:"Writing about The Bone Sparrow",bold:true,size:28,color:DEEP})]}),
  body("Three cycles. Each one starts from a different part of the sentence, and each one ends with a rewrite.",15,MUTED),

  label("THE FIVE PARTS"),
  new Table({columnWidths:[1900,7846],width:{size:9746,type:WidthType.DXA},
    rows:["feat","verb","idea","ev","eff"].map(k=>new TableRow({children:[
      cell([new Paragraph({children:[new TextRun({text:SQ[k]+" "+NM[k],bold:true,size:13,color:C[k],font:"Calibri"})]})],1900,SH[k]),
      cell([new Paragraph({children:[new TextRun({text:({
        feat:"the thing the writer actually did — descriptive writing, internal dialogue, symbolism",
        verb:"the verb that carries the thinking",
        idea:"what the writing is about, beyond the plot",
        ev:"the words of the novel, inside your own sentence",
        eff:"what it does to the person reading"})[k],size:13,color:INK,font:"Calibri"})]})],7846,"FFFFFF")
    ]}))}),

  label("THE THREE WAYS OF WRITING"),
  new Table({columnWidths:[FW,FW,FW],width:{size:FW*3,type:WidthType.DXA},
    rows:[new TableRow({children:FEATURES.map(f=>cell([
      new Paragraph({spacing:{after:15},children:[new TextRun({text:f.n,bold:true,size:13,color:C.feat,font:"Calibri"})]}),
      new Paragraph({children:[new TextRun({text:f.d,size:10,color:MUTED,font:"Calibri"})]})],FW,SH.feat))})]}),

  label("THE SAME SENTENCE, LIFTED"),
  new Table({columnWidths:[900,8846],width:{size:9746,type:WidthType.DXA},
    rows:LVLS.map(lv=>new TableRow({children:[
      cell([new Paragraph({alignment:AlignmentType.CENTER,children:[
        new TextRun({text:String(lv),bold:true,size:16,color:DEEP,font:"Calibri"})]})],900,"F4EFE5"),
      cell([new Paragraph({spacing:{after:20},children:tagged(exFor(lv)||"",13)})]
        .concat(Object.keys(expFor(lv)).slice(0,3).map(k=>new Paragraph({spacing:{after:8},children:[
          new TextRun({text:SQ[k]+"  "+expFor(lv)[k],size:10,color:MUTED,font:"Calibri"})]}))),8846,"FFFFFF")
    ]}))}),
  new Paragraph({children:[new PageBreak()]}),

  /* ---- the three cycles ---- */
  ...cycle(1,"start from the evidence","YOUR QUOTE — read the whole page it came from",
    [new TextRun({text:"“"+qt.t.replace(/^[‘’'"]+|[‘’'".,]+$/g,'')+"”",size:20,color:INK,italics:true}),
     new TextRun({text:"    "+qt.ref,size:12,color:MUTED,font:"Calibri"})],
    ["This quote is [descriptive writing / internal dialogue / symbolism].",
     "Fraillon [verb] [the idea] when she writes “[your quote]”.",
     "The [way it is written] in “[your quote]” [verb] [the idea]."],
    [label("CIRCLE THE WAY IT IS WRITTEN",C.feat),
     new Paragraph({spacing:{after:40},children:FEATURES.flatMap(f=>[chip(f.n,"feat"),new TextRun({text:" ",size:13})])}),
     label("CIRCLE THE IDEA IT PROVES",C.idea), chipRow(IDEAS,"idea"),
     label("CIRCLE A VERB",C.verb), chipRow(VERBS,"verb")],
    ["idea","ev","feat"]),

  ...cycle(2,"start from the idea","YOUR IDEA — go back to the novel and find evidence for it",
    [new TextRun({text:idea,size:19,color:C.idea,bold:true})],
    ["Fraillon [verb] [the idea] through [the way it is written], when she writes “[quote]”.",
     "[The idea] is [verb] in “[quote]”, which [effect on the reader]."],
    [label("YOUR EVIDENCE — copy the line, and write the page you found it on",C.ev),
     ...lines(2),
     label("CIRCLE THE WAY IT IS WRITTEN",C.feat),
     new Paragraph({spacing:{after:40},children:FEATURES.flatMap(f=>[chip(f.n,"feat"),new TextRun({text:" ",size:13})])}),
     label("CIRCLE A VERB",C.verb), chipRow(VERBS,"verb")],
    ["ev","verb","feat"]),

  ...cycle(3,"start from the effect on the reader","YOUR EFFECT — find the writing that does this",
    [new TextRun({text:eff,size:19,color:C.eff,bold:true})],
    ["[The way it is written] [verb] [the idea], which makes the reader [effect].",
     "By [writing choice], Fraillon positions the reader to [effect]."],
    [label("YOUR EVIDENCE — copy the line, and write the page you found it on",C.ev),
     ...lines(2),
     label("CIRCLE THE IDEA",C.idea), chipRow(IDEAS,"idea"),
     label("CIRCLE A VERB",C.verb), chipRow(VERBS,"verb")],
    ["eff","verb","idea"])
];};

const kids = quotes.slice(0, LIMIT||quotes.length);
const children = kids.flatMap((q,i)=>booklet(q, IDEAS[i%IDEAS.length].t, EFFECTS[i%EFFECTS.length].t, i, kids.length));
children.pop();

const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:20,color:INK}}}},
  sections:[{properties:{page:{margin:{top:620,bottom:440,left:1000,right:1000}}},children}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);
  console.log('written '+OUT+' — '+kids.length+' booklets, '+(kids.length*4)+' pages');});
