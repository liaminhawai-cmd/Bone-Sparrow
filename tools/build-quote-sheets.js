const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,AlignmentType,VerticalAlign,PageBreak}=require('docx');

/* One A4 per student, each with a DIFFERENT quote and its reference, so the
   class cannot copy sideways and every kid has to read the page their quote
   came from. Quotes, ideas, verbs and the rubric are all read out of
   BoneSparrowReadingHub.html, so this sheet cannot drift from the app. */
const HUB = process.argv[2] || 'BoneSparrowReadingHub.html';
const OUT = process.argv[3] || 'BoneSparrow-quote-sheets.docx';
const src = fs.readFileSync(HUB,'utf8');

const slice=(a,b)=>src.slice(src.indexOf(a), src.indexOf(b, src.indexOf(a)));
const wb = slice('const WK_BUILD','const TEACH_RAILS_FOCUS');
const qr = slice('const QUICKREADS','const MODULES');

/* ---- quote bank -------------------------------------------------------- */
/* Chapter 5 carries a verified page number; the other quickreads carry a
   chapter. Nothing here invents a reference. */
const quotes=[];
const where = wb.match(/where:"([^"]*)"/)[1];
const segBlock = wb.slice(wb.indexOf(' segs:['), wb.indexOf(' opens:['));
const segRe=/\{ t:"((?:[^"\\]|\\.)*)", themes:\{([^}]*)\}/g;
let m;
while((m=segRe.exec(segBlock))){
  if(!m[2].trim()) continue;                 /* plot-only lines are not analysable */
  quotes.push({t:m[1].replace(/\\"/g,'"'), ref:where, themes:m[2]});
}
const qrRe=/id:"(qr\d)"[\s\S]{0,300}?where:"([^"]*)"/g;
const refs={};
let r; while((r=qrRe.exec(qr))) refs[r[1]] = r[2].trim();
const linkRe=/id:"(qr\d)L\d",\s*idea:"((?:[^"\\]|\\.)*)",\s*opts:\[([\s\S]*?)\],\s*\n\s*a:(\d)/g;
let L; while((L=linkRe.exec(qr))){
  const opts=L[3].split(/",\s*\n?\s*"/).map(x=>x.replace(/^\s*"|"\s*$/g,'').trim());
  const pick=opts[+L[4]];
  if(!pick) continue;
  quotes.push({t:pick.replace(/^['"]|['"]$/g,'').replace(/^'|'$/g,''), ref:refs[L[1]]||'', idea:L[2]});
}

/* ---- idea and verb banks ----------------------------------------------- */
const bank=(name,pred)=>{
  const b=wb.slice(wb.indexOf(' '+name+':['));
  const out=[]; const re=/\{ t:"((?:[^"\\]|\\.)*)"([^}]*)\}/g; let x;
  const stop=b.indexOf('\n ],');
  const body=b.slice(0,stop<0?b.length:stop);
  while((x=re.exec(body))){ const meta=x[2];
    const lv=(meta.match(/lv:\[(\d),(\d)\]/)||[0,5,9]);
    out.push({t:x[1], lo:+lv[1], hi:+lv[2], q:(meta.match(/q:"(\w+)"/)||[])[1]});
  }
  return out.filter(pred);
};
const IDEAS = bank('ideas', o=>o.lo>=7 && o.hi<=8 && o.q!=='weak').slice(0,6);
const VERBS = bank('verbs', o=>o.q==='good' && o.lo<=7).slice(0,8);

/* ---- the rubric: one row per colour, one column per level -------------- */
/* Wording for the idea, language-feature and evidence rows is the school's
   Text Response rubric, strand for strand. The verb and effect rows are not
   separate strands there, so they carry the workshop's own level wording
   rather than a descriptor this file made up. */
const LVLS=[6,7,8,9];
const RUBRIC=[
 {k:"idea", name:"The idea", d:{
  6:"I can describe characters and events that relate to key ideas",
  7:"I can describe the ideas and issues that are illustrated through characters and events",
  8:"I can explain the way ideas and issues are represented by characters and events",
  9:"I can analyse the way different people and perspectives are represented in the story"}},
 {k:"feat", name:"Language feature", d:{
  6:"I can describe language features, perspectives and non-literal ideas from the story",
  7:"I can describe the meaning of language and literary features that create characterisation and tone",
  8:"I can explain how language and literary features create setting, characterisation and tone",
  9:"I can analyse how language features and non-literal language work together to explore ideas"}},
 {k:"verb", name:"Analytical verb", d:{
  6:"I can use a reporting verb accurately",
  7:"I can use an analytical verb that carries the thinking",
  8:"I can open on the author's choice",
  9:"I can use a verb that says what the writing does to the reader"}},
 {k:"ev", name:"Embedded evidence", d:{
  6:"I can include details from the text in my response",
  7:"I can use details from the text to demonstrate my ideas",
  8:"I can embed details from the text to support my interpretation",
  9:"I can use a range of complex sentence structures to embed different types of evidence"}},
 {k:"eff", name:"Effect on the reader", d:{
  6:"I can say what the writing makes the reader feel",
  7:"I can say what the writing makes the reader understand",
  8:"I can say how the writing positions the reader",
  9:"I can say what the writing withholds from the reader"}}
];

/* The three ways of writing named in Lesson 16. On the evidence-first sheet the
   student circles which one their quote is, because at Level 8 the subject of
   the sentence stops being a character and becomes the writing itself. */
const FEATURES=[
 {n:"Descriptive writing", d:"uses the senses — sights, sounds, smells, feelings — to describe settings, characters and events"},
 {n:"Internal dialogue",   d:"a voice in the story showing what a character is thinking"},
 {n:"Symbolism",           d:"repeated objects or motifs standing for bigger ideas: birds for freedom, the fence and the Jackets for imprisonment, the camera for hope"}
];

const C={idea:"0B447C", verb:"8A4B12", ev:"7A5A00", eff:"1F5C33", feat:"4B2F7A"};
const SH={idea:"D6EAFC", verb:"FAE3CF", ev:"FFF3B0", eff:"DFF0E2", feat:"E7DDF6"};
const INK="1E211F", MUTED="645D54", LINE="C9BFAE", DEEP="1D3C34";
const G={style:BorderStyle.SINGLE,size:4,color:"9C9382"};

const rule=(after)=>new Paragraph({spacing:{after:after||70,line:320},
  border:{bottom:{style:BorderStyle.SINGLE,size:4,color:LINE,space:1}},
  children:[new TextRun({text:"",size:20})]});
const lines=n=>Array.from({length:n},()=>rule());
const label=(t,col)=>new Paragraph({spacing:{before:80,after:35},children:[
  new TextRun({text:t,bold:true,size:14,color:col||DEEP,characterSpacing:24,font:"Calibri"})]});
const chip=(t,k)=>new TextRun({text:"  "+t+"  ",size:13,color:C[k],bold:true,font:"Calibri",
  shading:{type:ShadingType.CLEAR,fill:SH[k]}});
const cell=(ch,w,shade)=>new TableCell({width:{size:w,type:WidthType.DXA},children:ch,
  verticalAlign:VerticalAlign.CENTER,
  shading:shade?{type:ShadingType.CLEAR,fill:shade,color:"auto"}:undefined,
  margins:{top:45,bottom:45,left:70,right:70},
  borders:{top:G,bottom:G,left:G,right:G}});

const LABW=1500, LVLW=Math.floor((9746-LABW)/LVLS.length);
const COLS=[LABW].concat(LVLS.map(()=>LVLW));
const rubricTable=()=>new Table({columnWidths:COLS,width:{size:LABW+LVLW*LVLS.length,type:WidthType.DXA},
  rows:[new TableRow({tableHeader:true,children:[cell([new Paragraph({children:[]})],LABW,DEEP)]
    .concat(LVLS.map(n=>cell([new Paragraph({alignment:AlignmentType.CENTER,children:[
      new TextRun({text:"LEVEL "+n,bold:true,size:13,color:"F6F1E6",font:"Calibri",characterSpacing:10})]})],LVLW,DEEP)))})]
   .concat(RUBRIC.map(row=>new TableRow({children:[
      cell([new Paragraph({children:[new TextRun({text:row.name,bold:true,size:12,color:C[row.k],font:"Calibri"})]})],LABW,SH[row.k])]
      .concat(LVLS.map(n=>cell([new Paragraph({children:[
        new TextRun({text:row.d[n],size:12,color:INK,font:"Calibri"})]})],LVLW,"FFFFFF")))})))});

/* ---- the sheets ---------------------------------------------------------
   Three jobs, three surfaces, so no one sheet is crowded and each task can be
   set on its own. Sheet 1 holds both drafting tasks; sheet 2 is the bump-up,
   where the rubric finally appears and one of the two drafts gets lifted. */

const featureTable=()=>{
  const W=Math.floor(9746/3);
  return new Table({columnWidths:[W,W,W],width:{size:W*3,type:WidthType.DXA},
    rows:[new TableRow({children:FEATURES.map(f=>cell([
      new Paragraph({spacing:{after:15},children:[new TextRun({text:f.n,bold:true,size:13,color:C.feat,font:"Calibri"})]}),
      new Paragraph({children:[new TextRun({text:f.d,size:10,color:MUTED,font:"Calibri"})]})
    ],W,SH.feat))})]});
};

const nameRow=(right)=>new Paragraph({spacing:{after:25},children:[
  new TextRun({text:"Name",size:14,color:MUTED,font:"Calibri"}),
  new TextRun({text:"  ____________________________     ",size:14,color:LINE,font:"Calibri"}),
  new TextRun({text:"Class",size:14,color:MUTED,font:"Calibri"}),
  new TextRun({text:"  ____________          ",size:14,color:LINE,font:"Calibri"}),
  new TextRun({text:right,size:14,color:MUTED,font:"Calibri"})]});

const bar=(t)=>new Paragraph({spacing:{after:18},
  border:{bottom:{style:BorderStyle.SINGLE,size:10,color:DEEP,space:4}},
  children:[new TextRun({text:t,bold:true,size:18,color:DEEP})]});

const chipRow=(items,k)=>new Paragraph({spacing:{after:40},
  children:items.flatMap(o=>[chip(o.t||o,k),new TextRun({text:" ",size:13})])});

/* Sheet 1: start from the evidence, then start from the idea. */
const sheetOne=(qt,idea,i,total)=>[
  nameRow("Sheet 1 of 2  ·  quote "+(i+1)+" of "+total),
  bar("Task 1 — you have the evidence. Read the whole page it came from."),
  new Paragraph({spacing:{before:60,after:12},children:[
    new TextRun({text:"\u201C"+qt.t.replace(/^[\u2018\u2019'"]+|[\u2018\u2019'".,]+$/g,'')+"\u201D",size:22,color:INK,italics:true})]}),
  new Paragraph({spacing:{after:35},children:[new TextRun({text:qt.ref,size:12,color:MUTED,font:"Calibri"})]}),
  label("WHICH KIND OF WRITING IS IT? Circle one.",C.feat),
  featureTable(),
  label("WHICH IDEA IS IT EVIDENCE OF? Circle one, or write your own.",C.idea),
  chipRow(IDEAS,"idea"),
  rule(50),
  label("YOUR VERB \u2014 circle one",C.verb),
  chipRow(VERBS,"verb"),
  label("WRITE YOUR SENTENCE"),
  ...lines(7),

  bar("Task 2 \u2014 you have the idea. Go and find the evidence."),
  new Paragraph({spacing:{before:50,after:30},children:[
    new TextRun({text:idea,size:19,color:C.idea,bold:true})]}),
  label("YOUR EVIDENCE \u2014 copy the line, and write where you found it",C.ev),
  ...lines(2),
  label("WHICH KIND OF WRITING IS IT? Circle one.",C.feat),
  new Paragraph({spacing:{after:45},children:FEATURES.flatMap(f=>[chip(f.n,"feat"),new TextRun({text:" ",size:13})])}),
  label("WRITE YOUR SENTENCE"),
  ...lines(7),
  new Paragraph({children:[new PageBreak()]}),

  /* Sheet 2: the rubric, and the lift. */
  nameRow("Sheet 2 of 2"),
  bar("Choose the better of your two sentences. Copy it here, then lift it."),
  label("THE SENTENCE YOU CHOSE"),
  ...lines(3),
  label("THE RUBRIC"),
  rubricTable(),
  new Paragraph({spacing:{before:55,after:0},children:[
    chip("subject","feat"), new TextRun({text:" ",size:12}),
    chip("verb","verb"),    new TextRun({text:" ",size:12}),
    chip("idea","idea"),    new TextRun({text:" ",size:12}),
    chip("evidence","ev"),  new TextRun({text:" ",size:12}),
    chip("purpose","eff")]}),
  label("REWRITE"),
  ...lines(9),
  new Paragraph({children:[new PageBreak()]})
];

const IDEA_STARTS = IDEAS.map(o=>o.t);
const kids = quotes.slice(0, +(process.argv[4]||quotes.length));
const children = kids.flatMap((q,i)=>sheetOne(q, IDEA_STARTS[i%IDEA_STARTS.length], i, kids.length));
children.pop();

const doc=new Document({
  styles:{default:{document:{run:{font:"Georgia",size:20,color:INK}}}},
  sections:[{properties:{page:{margin:{top:640,bottom:460,left:1000,right:1000}}},children}]
});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);
  console.log('written '+OUT+' \u2014 '+kids.length+' students, '+(kids.length*2)+' pages');
  kids.forEach((q,i)=>console.log('  '+(i+1)+'. ['+q.ref+'] '+q.t.slice(0,60)));
});
