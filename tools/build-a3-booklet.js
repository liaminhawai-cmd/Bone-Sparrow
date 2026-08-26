const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,AlignmentType,VerticalAlign,PageBreak,PageOrientation}=require('docx');

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

/* ---- a different quote per student, each with the section to read for
   context. Chapter 5 is deliberately excluded: those lines are the ones the
   app already works through, so the paper task uses fresh material. ---- */
const refs={}; {const rx=/id:"(qr\d)"[\s\S]{0,300}?where:"([^"]*)"/g;let r;
  while((r=rx.exec(qr))) refs[r[1]]=r[2].trim();}
const QUOTES=[]; const seen={};
{const re=/id:"(qr\d)L\d",\s*idea:"(?:[^"\\]|\\.)*",\s*opts:\[([\s\S]*?)\],\s*\n\s*a:\d/g;let m;
 while((m=re.exec(qr))){
   const ref=refs[m[1]]||''; if(/Chapter 5/.test(ref)) continue;
   m[2].split(/",\s*\n?\s*"/).map(x=>x.replace(/^\s*"|"\s*$/g,'').trim())
     .forEach(t=>{ const q=t.replace(/^['\u2018\u2019"]+|['\u2018\u2019".,]+$/g,'').trim();
       if(q.length<25) return; QUOTES.push({t:q,ref:ref}); });
 }}

/* The same line appears both whole and truncated with an ellipsis. Keep the
   fuller one: a quote that is a prefix of another is the same quote. */
{const norm=x=>x.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
 QUOTES.sort((a,b)=>b.t.length-a.t.length);
 const kept=[];
 QUOTES.slice().forEach(x=>{ const k=norm(x.t);
   if(kept.some(y=>y.indexOf(k)===0||k.indexOf(y)===0)) return; kept.push(k);
   x._keep=1; });
 for(let i=QUOTES.length-1;i>=0;i--) if(!QUOTES[i]._keep) QUOTES.splice(i,1);
 QUOTES.sort((a,b)=>a.ref.localeCompare(b.ref)||a.t.localeCompare(b.t));}

/* ---- banks ---- */
const bank=(n,p)=>{const b=wb.slice(wb.indexOf(' '+n+':['));const s=b.indexOf('\n ],');
  const body=b.slice(0,s<0?b.length:s);const o=[];const re=/\{ t:"((?:[^"\\]|\\.)*)"([^}]*)\}/g;let x;
  while((x=re.exec(body))){const mt=x[2];const lv=(mt.match(/lv:\[(\d),(\d)\]/)||[0,5,9]);
    o.push({t:x[1],lo:+lv[1],hi:+lv[2],q:(mt.match(/q:"(\w+)"/)||[])[1]});}return o.filter(p);};
const IDEAS  =bank('ideas',  o=>o.lo>=7&&o.hi<=8&&o.q!=='weak').slice(0,5);
const VERBS  =bank('verbs',  o=>o.q==='good'&&o.lo<=7).slice(0,7);
const EFFECTS=bank('effects',o=>o.lo>=7&&o.q!=='weak'&&o.q!=='interp').slice(0,5);

/* ---- the wall, exactly, minus the Example row ---- */
const wallBlk=cut('const WK_WALL','resps:[');
const WALL=[];{const re=/lv:"(Level \d)", n:(\d), eal:"([^"]*)",\s*\n\s*focus:"([^"]*)",\s*\n\s*vic:"([^"]*)"[\s\S]*?exp:`([^`]*)`/g;let m;
 while((m=re.exec(wallBlk))) WALL.push({lv:m[1],n:+m[2],eal:m[3],focus:m[4],vic:m[5],
   exp:m[6].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()});}

/* The wall's own worked responses. The rubric grid below them carries no
   Example row, so this is where a student sees a finished sentence. */
const RESPS=[];{const rb=src.slice(src.indexOf('resps:['),src.indexOf('const WK_LEVELS'));
 const re=/id:"w(\d)", lvl:\d,[\s\S]*?h:`([^`]*)`/g;let m;
 while((m=re.exec(rb))) RESPS.push({n:+m[1],h:m[2].replace(/\s+/g,' ').trim()});}

const C={idea:"0B447C",verb:"8A4B12",ev:"7A5A00",eff:"1F5C33",feat:"4B2F7A"};
const SH={idea:"D6EAFC",verb:"FAE3CF",ev:"FFF3B0",eff:"DFF0E2",feat:"E7DDF6"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";
const G={style:BorderStyle.SINGLE,size:4,color:"9C9382"};
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};

const PANW=11200;                       /* an A4-ish panel inside A3 landscape */
const rule=(a)=>new Paragraph({spacing:{after:a||75,line:400},
  border:{bottom:{style:BorderStyle.SINGLE,size:4,color:LINE,space:1}},children:[new TextRun({text:"",size:21})]});
const lines=n=>Array.from({length:n},()=>rule());
const lab=(t,c,sz)=>new Paragraph({spacing:{before:70,after:30},children:[
  new TextRun({text:t,bold:true,size:sz||13,color:c||DEEP,characterSpacing:18,font:"Calibri"})]});
const cell=(ch,w,shade,brd)=>new TableCell({width:{size:w,type:WidthType.DXA},children:ch,
  verticalAlign:VerticalAlign.TOP,
  shading:shade?{type:ShadingType.CLEAR,fill:shade,color:"auto"}:undefined,
  margins:{top:50,bottom:50,left:80,right:80},
  borders:brd||{top:G,bottom:G,left:G,right:G}});
const fromHtml=(h,sz)=>{const out=[];const re=/<em class="hl-(\w+)">(.*?)<\/em>/g;let last=0,x;
  const plain=t=>t.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
  while((x=re.exec(h))){ if(x.index>last) out.push(new TextRun({text:plain(h.slice(last,x.index)),size:sz||14}));
    out.push(new TextRun({text:plain(x[2]),size:sz||14,color:C[x[1]],bold:true,
      shading:{type:ShadingType.CLEAR,fill:SH[x[1]]}}));
    last=x.index+x[0].length; }
  if(last<h.length) out.push(new TextRun({text:plain(h.slice(last)),size:sz||14}));
  return out;};

const tagged=(s,sz)=>{const out=[];const re=/\{(\w+)\|([^}]*)\}/g;let last=0,x;
  while((x=re.exec(s))){if(x.index>last)out.push(new TextRun({text:s.slice(last,x.index),size:sz||13}));
    out.push(new TextRun({text:x[2],size:sz||13,color:C[x[1]],bold:true,shading:{type:ShadingType.CLEAR,fill:SH[x[1]]}}));
    last=x.index+x[0].length;}
  if(last<s.length)out.push(new TextRun({text:s.slice(last),size:sz||13}));return out;};

/* The four questions, as the four-colour grid the teacher deck ends on. */
const optCell=(k,title,q,items,w)=>cell([
  new Paragraph({spacing:{after:20},children:[
    new TextRun({text:title,bold:true,size:13,color:C[k],font:"Calibri"}),
    new TextRun({text:"  "+q,size:10,color:MUTED,font:"Calibri",italics:true})]}),
  new Paragraph({children:[new TextRun({text:items.join("   ·   "),size:10,color:INK,font:"Calibri"})]})
],w,SH[k]);

const writeCell=(w)=>cell([
  new Paragraph({spacing:{after:20},children:[
    new TextRun({text:"Evidence",bold:true,size:13,color:C.ev,font:"Calibri"}),
    new TextRun({text:"  when",size:10,color:MUTED,font:"Calibri",italics:true})]}),
  rule(30), rule(0)
],w,SH.ev);

/* 2x2: circle three, write one. */
const grid=()=>{const W=Math.floor(PANW/2);
  return new Table({columnWidths:[W,W],width:{size:W*2,type:WidthType.DXA},rows:[
    new TableRow({children:[
      optCell("idea","Idea","what",IDEAS.map(o=>o.t),W),
      optCell("eff","Purpose","why",EFFECTS.map(o=>o.t),W)]}),
    new TableRow({children:[
      writeCell(W),
      optCell("verb","Verb","how",VERBS.map(o=>o.t),W)]})
  ]});};

/* The wall's own rows, without the Example row. */
const rubric=()=>{const LW=1250,CW=Math.floor((PANW-LW)/WALL.length);
  const hdr=new TableRow({tableHeader:true,children:[cell([new Paragraph({children:[]})],LW,DEEP)]
    .concat(WALL.map(L=>cell([new Paragraph({alignment:AlignmentType.CENTER,children:[
      new TextRun({text:L.lv.toUpperCase(),bold:true,size:11,color:"F6F1E6",font:"Calibri"})]})],CW,DEEP)))});
  const row=(name,fn)=>new TableRow({children:[
    cell([new Paragraph({children:[new TextRun({text:name,bold:true,size:10,color:MUTED,font:"Calibri"})]})],LW,"F4EFE5")]
    .concat(WALL.map(L=>cell([new Paragraph({children:[new TextRun({text:fn(L),size:11,color:INK,font:"Calibri"})]})],CW,"FFFFFF")))});
  return new Table({columnWidths:[LW].concat(WALL.map(()=>CW)),width:{size:LW+CW*WALL.length,type:WidthType.DXA},
    rows:[hdr,row("SKILL FOCUS",L=>L.focus),row("THE RUBRIC",L=>L.vic),row("WHAT MAKES IT",L=>L.exp)]});};

/* ---- the four panels ---- */
const P1=()=>[
  new Paragraph({spacing:{after:20},children:[
    new TextRun({text:"Name",size:12,color:MUTED,font:"Calibri"}),
    new TextRun({text:"  ______________________  ",size:12,color:LINE,font:"Calibri"}),
    new TextRun({text:"Class",size:12,color:MUTED,font:"Calibri"}),
    new TextRun({text:"  __________",size:12,color:LINE,font:"Calibri"})]}),
  new Paragraph({spacing:{after:14},border:{bottom:{style:BorderStyle.SINGLE,size:10,color:DEEP,space:4}},
    children:[new TextRun({text:"Three ways into a sentence",bold:true,size:20,color:DEEP})]}),
  new Table({columnWidths:[2000,PANW-2000],width:{size:PANW,type:WidthType.DXA},rows:[
    ["From the evidence",'{ev|"My throat is as dry as the dirt"} {verb|reveals} {idea|the issue of fear in detention}, which {eff|makes the reader feel the danger with Subhi}.'],
    ["From the idea",'{idea|The issue of power in detention} is {verb|exposed} when Beaver says {ev|"I asked you a question"}, which {eff|shows how little control a child has}.'],
    ["From the effect",'To make {eff|the reader feel how little control a child has}, Fraillon {verb|writes} Beaver shoving Subhi so hard that {ev|"my feet leave the ground"}.']
  ].map(p=>new TableRow({children:[
    cell([new Paragraph({children:[new TextRun({text:p[0],bold:true,size:11,color:DEEP,font:"Calibri"})]})],2000,"F4EFE5"),
    cell([new Paragraph({children:tagged(p[1],13)})],PANW-2000,"FFFFFF")]}))}),
  lab("THE SAME SENTENCE, LIFTED"),
  new Table({columnWidths:[1050,PANW-1050],width:{size:PANW,type:WidthType.DXA},
    rows:RESPS.filter(x=>x.n>=6&&x.n<=8).map(x=>new TableRow({children:[
      cell([new Paragraph({alignment:AlignmentType.CENTER,children:[
        new TextRun({text:"LEVEL "+x.n,bold:true,size:11,color:"F6F1E6",font:"Calibri"})]})],1050,DEEP),
      cell([new Paragraph({children:fromHtml(x.h,13)})],PANW-1050,"FFFFFF")]}))}),
  lab("THE WALL"),
  rubric(),
  lab("YOUR FIRST GO"),
  ...lines(6)
];

const head=(t)=>new Paragraph({spacing:{after:14},
  border:{bottom:{style:BorderStyle.SINGLE,size:10,color:DEEP,space:4}},
  children:[new TextRun({text:t,bold:true,size:21,color:DEEP})]});
const note=(t)=>new Paragraph({spacing:{after:22},children:[
  new TextRun({text:t,size:11,color:MUTED,font:"Calibri"})]});

/* Every process page: the starting point, the grid, write, then lift. */
const panel=(title,startRuns,noteText,ref)=>[
  head(title),
  new Paragraph({spacing:{after:8},children:startRuns}),
  new Paragraph({spacing:{after:22},children:[
    new TextRun({text:"Read "+ref+" for the context.",size:11,color:MUTED,font:"Calibri",italics:true})]}),
  note(noteText),
  grid(),
  lab("WRITE YOUR SENTENCE"),
  ...lines(10),
  lab("NOW LIFT IT"),
  ...lines(11)
];

const P2=(qt)=>panel("1 — Start from the evidence",
  [new TextRun({text:"\u201C"+qt.t+"\u201D",size:17,color:INK,italics:true})],
  "Write the line into the Evidence box, then circle the rest.", qt.ref);

const P3=(idea,ref)=>panel("2 — Start from the idea",
  [new TextRun({text:idea,size:18,color:C.idea,bold:true})],
  "Go back and find a line that proves it.", ref);

const P4=(eff,ref)=>panel("3 — Start from the effect on the reader",
  [new TextRun({text:eff,size:18,color:C.eff,bold:true})],
  "Find the writing that does this to you.", ref);

/* Two panels side by side on one A3 landscape page, no visible border. */
const spread=(left,right)=>new Table({columnWidths:[PANW,600,PANW],
  width:{size:PANW*2+600,type:WidthType.DXA},
  rows:[new TableRow({children:[
    cell(left,PANW,null,{top:NONE,bottom:NONE,left:NONE,right:NONE}),
    cell([new Paragraph({children:[]})],600,null,{top:NONE,bottom:NONE,
      left:{style:BorderStyle.DASHED,size:4,color:LINE},right:NONE}),
    cell(right,PANW,null,{top:NONE,bottom:NONE,left:NONE,right:NONE})]})]});

/* Folded once, an A3 sheet reads 1,2,3,4. Side one carries panels 4 and 1;
   side two carries panels 2 and 3. */
const kids=QUOTES.slice(0,LIMIT||QUOTES.length);
const children=[];
kids.forEach((qt,i)=>{
  const idea=IDEAS[i%IDEAS.length].t, eff=EFFECTS[i%EFFECTS.length].t;
  children.push(spread(P4(eff,qt.ref), P1()));
  children.push(new Paragraph({children:[new PageBreak()]}));
  children.push(spread(P2(qt), P3(idea,qt.ref)));
  if(i<kids.length-1) children.push(new Paragraph({children:[new PageBreak()]}));
});

const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:19,color:INK}}}},
  sections:[{properties:{page:{size:{width:16838,height:23811,orientation:PageOrientation.LANDSCAPE},
    margin:{top:560,bottom:440,left:560,right:560}}},children}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);
  console.log('written '+OUT+' — '+kids.length+' A3 sheets, '+(kids.length*2)+' printed sides');
  kids.forEach((x,i)=>console.log('  '+(i+1)+'. ['+x.ref+'] '+x.t.slice(0,64)));});
