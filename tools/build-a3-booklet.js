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

/* The idea vocabulary is the broad set taught across the unit, the same on
   every sheet. Broad words hold on any page of the novel, which is what lets
   one box serve every chapter. */
const IDEAS=["imagination","loneliness","fear","hope","freedom","friendship","power","survival"];

/* One purpose per idea, all built on the same frame. */
const PUR={
  imagination:"help the reader to see what imagination does for Subhi",
  loneliness:"help the reader to feel the loneliness on this page",
  fear:"help the reader to feel the fear on this page",
  hope:"help the reader to see where the hope comes from",
  freedom:"help the reader to understand what freedom means here",
  friendship:"help the reader to see what the friendship gives",
  power:"help the reader to understand who has the power here",
  survival:"help the reader to understand what surviving costs"
};

/* Twelve sheets, weighted to chapters 1–14. The chapter-1 lines are the
   hub's own quickread lines; the rest are matched against the verified
   quote store by their opening words. Each sheet's three cycles work three
   different threads: the quote in cycle 1, the c2 idea in cycle 2, the c3
   purpose in cycle 3. */
const pick=(start)=>{const L=LINKS.find(x=>x.quote.indexOf(start)===0);
  if(!L) throw new Error('no verified quote starting: '+start); return L;};
const SHEETS=[
 {ref:"Chapter 1, pages 1–2", quote:"Sometimes, at night, the dirt outside turns into a beautiful ocean.", c2:"hope", c3:"power"},
 {ref:"Chapter 1, pages 1–2", quote:"Queeny, she never tries to look in the shadows. She doesn't even squint.", c2:"loneliness", c3:"survival"},
 {q:"Jimmie wonders", c2:"freedom", c3:"fear"},
 {q:"A fence just means", c2:"friendship", c3:"power"},
 {q:"That’s not what his paper says", c2:"imagination", c3:"survival"},
 {q:"I guess they don’t want us getting", c2:"fear", c3:"hope"},
 {q:"…knowing that Jimmie has a whole real book", c2:"imagination", c3:"friendship"},
 {q:"…that quiet ballooning up", c2:"survival", c3:"imagination"},
 {q:"I know for sure that Jimmie", c2:"freedom", c3:"loneliness"},
 {q:"her whole face shines", c2:"power", c3:"friendship"},
 {q:"I whisper the few words of Rohingya", c2:"fear", c3:"freedom"},
 {q:"…about Queeny and Eli sneaking in the camera", c2:"hope", c3:"freedom"}
].map(sh=>{
  if(sh.q){const L=pick(sh.q); return {ref:L.ref, quote:L.quote, c2:sh.c2, c3:sh.c3};}
  return sh;
});

/* ---- the wall, exactly as the site draws it ---- */
const wallBlk=cut('const WK_WALL','resps:[');
const WALL=[];{const re=/lv:"(Level \d)", n:(\d), eal:"([^"]*)",\s*\n\s*focus:"([^"]*)",\s*\n\s*vic:"[^"]*",\s*\n\s*vicH:`([^`]*)`,\s*\n\s*exp:`([^`]*)`/g;let m;
 while((m=re.exec(wallBlk))) WALL.push({lv:m[1],n:+m[2],eal:m[3],focus:m[4],vicH:m[5],expH:m[6]});}
if(WALL.length!==5) throw new Error('wall parse: got '+WALL.length+' levels');

/* The wall's own worked responses, one per level: the Example row. */
const RESPS={};{const rb=src.slice(src.indexOf('resps:['),src.indexOf('const WK_LEVELS'));
 const re=/id:"w(\d)", lvl:\d,[\s\S]*?h:`([^`]*)`/g;let m;
 while((m=re.exec(rb))) RESPS[+m[1]]=m[2].replace(/\s+/g,' ').trim();}

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
const fromHtml=(h,sz)=>{const out=[];const re=/<em class="hl-(\w+)">(.*?)<\/em>/g;let last=0,x;
  const plain=t=>t.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ');
  while((x=re.exec(h))){ const pre=plain(h.slice(last,x.index)); if(pre) out.push(new TextRun({text:pre,size:sz||13}));
    out.push(new TextRun({text:plain(x[2]),size:sz||13,color:C[x[1]]||INK,bold:true,
      shading:SH[x[1]]?{type:ShadingType.CLEAR,fill:SH[x[1]]}:undefined}));
    last=x.index+x[0].length; }
  const tail=plain(h.slice(last)); if(tail) out.push(new TextRun({text:tail,size:sz||13}));
  return out;};

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
  const osz=items.length<2?23:19;
  const opt=t=>new Paragraph({spacing:{after:44},children:[
    new TextRun({text:t?"○  "+t:"",size:osz,bold:true,color:C[k],font:"Calibri"})]});
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
        children:[new TextRun({text:"“"+quote.t+"”",size:19,bold:true,color:C.ev,italics:true})]})]
    : [rule(40), rule(40), rule(0)])
],w,SH.ev);

/* Cycle 2's blue box carries its assigned theme the way cycle 1's yellow box
   carries its quote: given, not chosen. */
const ideaCell=(w,theme)=>cell([
  new Paragraph({spacing:{after:40},children:[
    new TextRun({text:"Idea",bold:true,size:20,color:C.idea,font:"Calibri"}),
    new TextRun({text:"  what",size:15,color:MUTED,font:"Calibri",italics:true})]}),
  new Paragraph({children:[new TextRun({text:theme,size:22,color:C.idea,bold:true,font:"Calibri"})]})
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

/* The wall as the site draws it: skill focus, rubric line, worked example,
   what makes it — colour highlights intact. */
const wallTable=()=>{const LW=900,CW=Math.floor((PANW-LW)/WALL.length);
  const hdr=new TableRow({children:[cell([new Paragraph({children:[]})],LW,DEEP)]
    .concat(WALL.map(L=>cell([new Paragraph({alignment:AlignmentType.CENTER,children:[
      new TextRun({text:L.lv.toUpperCase(),bold:true,size:13,color:"F6F1E6",font:"Calibri"})]})],CW,DEEP)))});
  const row=(name,fn,shade)=>new TableRow({children:[
    cell([new Paragraph({children:[new TextRun({text:name,bold:true,size:11,color:MUTED,font:"Calibri"})]})],LW,"F4EFE5")]
    .concat(WALL.map(L=>cell([new Paragraph({spacing:{line:200,lineRule:LineRuleType.EXACT},
      children:fn(L)})],CW,shade||"FFFFFF")))});
  return new Table({columnWidths:[LW].concat(WALL.map(()=>CW)),width:{size:LW+CW*WALL.length,type:WidthType.DXA},
    rows:[hdr,
      row("SKILL FOCUS",L=>[new TextRun({text:L.focus,bold:true,size:13,font:"Calibri"})]),
      row("THE RUBRIC",L=>fromHtml(L.vicH,12)),
      row("EXAMPLE",L=>fromHtml(RESPS[L.n]||'',12),"FDFBF5"),
      row("WHAT MAKES IT",L=>fromHtml(L.expH,12))]});};

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
              new TextRun({text:text,size:17,bold:true,color:C[k],italics:k==="ev"})]})],A,SH[k]),
      cell([new Paragraph({spacing:{after:16},children:[
              new TextRun({text:blabel,bold:true,size:14,color:C[bk],font:"Calibri"})]})]
           .concat(branches.map(b=>new Paragraph({spacing:{after:12},children:[
              new TextRun({text:"⤷  ",size:15,color:MUTED}),
              new TextRun({text:b,size:16,bold:true,color:C[bk],
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
    children:[new TextRun({text:"Writing an analytical sentence from three starting points",bold:true,size:22,color:DEEP}),
    new TextRun({text:"\u2003Chapter 5",size:15,color:MUTED,font:"Calibri"})]}),

  lab("1  START FROM THE EVIDENCE",C.ev),
  mapRow("ev","THE LINE",'"My throat is as dry as the dirt"',
    "idea","related ideas",
    ["thirst","fear","who is allowed to speak","a body someone else controls"],
    '{ev|"My throat is as dry as the dirt"} {verb|reveals} {idea|how completely Beaver controls what Subhi’s body can do}, which {eff|makes the reader feel the danger before Subhi names it}.'),

  lab("2  START FROM THE IDEA",C.idea),
  mapRow("idea","THE IDEA","power",
    "ev","related evidence",
    ['"I asked you a question"','"my feet leave the ground"','"as dark as the Jackets’ dogs"','"I can’t say a single thing"'],
    '{idea|The issue of power} is {verb|exposed} when Beaver’s voice arrives {ev|"as dark as the Jackets’ dogs"}, which {eff|positions the reader to fear him before he is described}.'),

  lab("3  START FROM THE PURPOSE",C.eff),
  mapRow("eff","THE PURPOSE","makes the reader feel how little control a child has",
    "feat","related evidence",
    ["the shove","the questions with no right answer","the dry‑throat image","the dog comparison"],
    'To {eff|make the reader feel how little control a child has}, Fraillon {verb|writes} Beaver shoving Subhi until {ev|"my feet leave the ground"}.'),

  wallTable(),

  lab("TYPES OF LANGUAGE TO DISCUSS"),
  ...[["Descriptive writing","writing that uses the senses (sights, feelings, sounds, smells) to describe settings, characters and events.",
       "Fraillon uses \u2026 in the line \u201C\u2026\u201D to \u2026",0],
      ["Dialogue","conversation between characters.",
       "The dialogue in line \u201C\u2026\u201D reveals \u2026",0],
      ["Internal dialogue","a voice written in the story that shows what a character is thinking. We might also think of this as imagined dialogue.",
       "Subhi\u2019s internal dialogue in line \u201C\u2026\u201D reveals \u2026",1],
      ["Symbolism","the use of repeated objects or motifs that represent important ideas. For example, birds symbolise freedom, the fence and the Jackets symbolise imprisonment, the camera and photographs symbolise hope.",
       "Fraillon employs the symbol of the \u2026 in the lines \u201C\u2026\u201D to \u2026",0]
     ].flatMap(([t,d,stem,ind])=>[
       new Paragraph({spacing:{after:8},indent:ind?{left:340}:undefined,children:[
         new TextRun({text:t+" — ",bold:true,size:16,color:DEEP,font:"Calibri"}),
         new TextRun({text:d,size:16,color:INK,font:"Calibri"})]}),
       new Paragraph({spacing:{after:26},indent:{left:(ind?340:0)+280},children:[
         new TextRun({text:stem,size:16,color:MUTED,italics:true})]})
     ])
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

const P2=(L)=>panel("1 · Start from the evidence",
  [new TextRun({text:"“"+L.quote+"”",size:19,bold:true,color:C.ev,italics:true})],
  L.ref, IDEAS, null, {t:L.quote,ch:(L.ref.match(/\d+/)||[''])[0]});

const P3=(L,theme)=>panel("2 · Start from the idea",
  [new TextRun({text:theme,size:22,color:C.idea,bold:true})],
  L.ref, null, null, null, theme);

const P4=(L,theme)=>panel("3 · Start from the effect and purpose",
  [], L.ref, IDEAS, [PUR[theme]]);

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
const kids=SHEETS.slice(0,LIMIT||SHEETS.length);
const children=[];
kids.forEach((L,i)=>{
  children.push(spread(P4(L,L.c3), P1()));
  children.push(new Paragraph({children:[new PageBreak()]}));
  children.push(spread(P2(L), P3(L,L.c2)));
  if(i<kids.length-1) children.push(new Paragraph({children:[new PageBreak()]}));
});

const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:19,color:INK}}}},
  sections:[{properties:{page:{size:{width:16838,height:23811,orientation:PageOrientation.LANDSCAPE},
    margin:{top:560,bottom:440,left:560,right:560}}},children}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);
  console.log('written '+OUT+' — '+kids.length+' A3 sheets, '+(kids.length*2)+' printed sides');
  kids.forEach((x,i)=>console.log('  '+(i+1)+'. ['+x.ref+'] \u201C'+x.quote.slice(0,54)+'\u201D  c2:'+x.c2+'  c3:'+x.c3));});
