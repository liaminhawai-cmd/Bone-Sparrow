const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,LineRuleType,HeightRule}=require('docx');

/* The student essay sheet. The intro and conclusion are printed with gaps,
   paragraph A is printed in full to copy, paragraphs B and C are a frame
   of stems with lines under each. */
const V=process.argv[2]||'core';   /* core | eal | low | ext */
const OUT=process.argv[3]||('BoneSparrow-TEEL-worksheet'+(V==='core'?'':'-'+V)+'.docx');
const BIG=V==='low'||V==='eal';
const SZ=BIG?26:22, ST=BIG?24:21, LH=BIG?640:520;

const C={idea:"0B447C",verb:"8A4B12",ev:"7A5A00",eff:"1F5C33"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";
const PW=11906, MARG=1000, W=PW-MARG*2;
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const RULE={style:BorderStyle.SINGLE,size:6,color:LINE};
const BOX={style:BorderStyle.SINGLE,size:8,color:DEEP};

/* runs: plain text with [k|text] role markup and ____ gaps */
const runs=(t,sz)=>{
  const out=[]; const re=/\[(\w+)\|([^\]]*)\]|(_{3,})/g; let last=0,x;
  const push=(text,o)=>{ if(text) out.push(new TextRun({text,size:sz,font:"Georgia",color:INK,...o})); };
  while((x=re.exec(t))){
    push(t.slice(last,x.index));
    if(x[1]) push(x[2],{color:C[x[1]],bold:true,italics:x[1]==="ev"});
    else push(x[3].replace(/_/g," "),{underline:{},color:INK});
    last=re.lastIndex;
  }
  push(t.slice(last)); return out;
};
const P=(t,sz,o)=>new Paragraph({spacing:{after:o&&o.after!=null?o.after:120,line:sz*18,lineRule:LineRuleType.AUTO},children:runs(t,sz)});
const lab=t=>new Paragraph({spacing:{before:260,after:60},children:[
  new TextRun({text:t,bold:true,size:18,color:DEEP,characterSpacing:20,font:"Calibri"})]});
const stem=t=>new Paragraph({spacing:{before:120,after:40},children:runs(t,ST)});
const lines=n=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:NONE,left:NONE,right:NONE,bottom:RULE,insideH:RULE,insideV:NONE},
  rows:Array.from({length:n},()=>new TableRow({height:{value:LH,rule:HeightRule.ATLEAST},
    children:[new TableCell({width:{size:W,type:WidthType.DXA},margins:{top:0,bottom:0,left:20,right:20},
      children:[new Paragraph({spacing:{after:0},children:[new TextRun({text:"",size:22})]})]})]}))});
const box=(kids,fill)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:NONE,insideV:NONE},
  rows:[new TableRow({children:[new TableCell({width:{size:W,type:WidthType.DXA},
    shading:fill?{type:ShadingType.CLEAR,fill,color:"auto"}:undefined,
    margins:{top:140,bottom:140,left:200,right:200},children:kids})]})]});
const br=()=>new Paragraph({children:[new PageBreak()]});

const INTRO="In The Bone Sparrow, Zana Fraillon tells the story of Subhi, a boy born inside a detention camp, and Jimmie, the girl who finds a way in. Through these two children, Fraillon presents [idea|imagination], ____________________ and ____________________.";
const A=[
 "Fraillon [verb|presents] [idea|imagination] as the most precious thing Subhi has, because it is the one thing the camp cannot take from him.",
 "When the novel opens at night, [ev|“Sometimes, at night, the dirt outside turns into a beautiful ocean”] [verb|shows] [idea|that imagination is the most precious thing in the camp], which [eff|lets the reader see the camp the way Subhi sees it].",
 "When Jimmie brings her mother’s book, [ev|“…knowing that Jimmie has a whole real book in her hands gives me a sort of brave that I haven’t felt since Eli got taken”] [verb|shows] [idea|that imagination can never be taken away, even when people are], which [eff|makes the reader understand where Subhi’s courage comes from].",
 "This shows that [idea|imagination is the most precious thing in the camp] and that [idea|it can never be stolen], and in doing so Fraillon [verb|shows] the reader that [eff|the fences hold Subhi’s body but not his mind]."
];
const CONC="Fraillon uses Subhi and Jimmie to show the reader [idea|imagination], ____________________ and ____________________. Together, these ideas suggest that ________________________________________________ ________________________________________________.";


/* a word box: small shaded table of words to pick from */
const words=(title,items,k)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:NONE,insideV:NONE},
  rows:[new TableRow({children:[new TableCell({width:{size:W,type:WidthType.DXA},
    shading:{type:ShadingType.CLEAR,fill:"F6F1E6",color:"auto"},margins:{top:80,bottom:80,left:160,right:160},
    children:[new Paragraph({spacing:{after:40},children:[new TextRun({text:title,bold:true,size:16,color:MUTED,characterSpacing:16,font:"Calibri"})]}),
      new Paragraph({spacing:{after:0},children:items.flatMap((x,i)=>[
        new TextRun({text:x,size:SZ-2,font:"Georgia",color:k?C[k]:INK,bold:!!k,italics:k==="ev"}),
        ...(i<items.length-1?[new TextRun({text:"     ·     ",size:SZ-2,color:LINE})]:[])])})]})]})]});
const gloss=(pairs)=>new Table({columnWidths:[Math.floor(W*0.3),W-Math.floor(W*0.3)],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:NONE,right:NONE,insideH:RULE,insideV:NONE},
  rows:pairs.map(([a,b])=>new TableRow({children:[
    new TableCell({width:{size:Math.floor(W*0.3),type:WidthType.DXA},margins:{top:60,bottom:60,left:80,right:80},
      children:[new Paragraph({spacing:{after:0},children:[new TextRun({text:a,bold:true,size:SZ-2,font:"Georgia",color:C.idea})]})]}),
    new TextCellPlain(b)]}))});
function TextCellPlain(b){return new TableCell({width:{size:W-Math.floor(W*0.3),type:WidthType.DXA},margins:{top:60,bottom:60,left:80,right:80},
  children:[new Paragraph({spacing:{after:0},children:[new TextRun({text:b,size:SZ-2,font:"Georgia",color:INK})]})]});}

const THEMES=["imprisonment","friendship","power","loneliness","hope"];
const QUOTES=[
 ["“My throat is as dry as the dirt.”","power"],
 ["“There are only fourteen pairs of real shoes in this whole entire camp.”","imprisonment"],
 ["“None of us knows what it is like just on the other side of the fences.”","imprisonment"],
 ["“I know for sure that Jimmie is the kind of person that keeps a promise.”","friendship"],
 ["“Jimmie has never felt so alone.”","loneliness"],
 ["“Tonight, you look up at that sky, and there will be a new star there.”","hope"]];

/* ---- the frames for B and C, by version ---- */
const frameCore=(L)=>[
  lab("PARAGRAPH "+L+"   ·   ____________________"),
  stem("[verb|T]   Fraillon also presents [idea|____________] as ______________________________."), lines(1),
  stem("[ev|E]   When ______________, [ev|“______________________________”] shows that [idea|____________] is ______________, which makes the reader ______________."), lines(3),
  stem("[ev|E]   When ______________, [ev|“______________________________”] shows that [idea|____________] is ______________, which makes the reader ______________."), lines(3),
  stem("[eff|L]   This shows that [idea|____________] is ______________ and ______________, and in doing so Fraillon shows the reader that ______________."), lines(2)
];
const frameEal=(L)=>[
  lab("PARAGRAPH "+L+"   ·   ____________________"),
  words("MY IDEA",THEMES,"idea"),
  stem("[verb|T]   Fraillon also presents [idea|____________]."), lines(1),
  stem("[ev|E]   In the book it says [ev|“______________________________”]."), lines(2),
  stem("This shows that [idea|____________] is ______________."), lines(1),
  stem("This makes the reader feel ______________."), lines(1),
  stem("[ev|E]   In the book it also says [ev|“______________________________”]."), lines(2),
  stem("This shows that [idea|____________] is ______________."), lines(1),
  stem("This makes the reader feel ______________."), lines(1),
  stem("[eff|L]   So, [idea|____________] is ______________ and ______________."), lines(2)
];
const frameLow=(L)=>[
  lab("PARAGRAPH "+L+"   ·   ____________________"),
  words("PICK ONE",THEMES,"idea"),
  stem("[verb|T]   Fraillon also presents [idea|____________]."), lines(1),
  words("PICK A QUOTE",QUOTES.map(q=>q[0]),"ev"),
  stem("[ev|E]   [ev|“______________________________”]"), lines(2),
  stem("This shows [idea|____________] is ______________."), lines(1),
  stem("[eff|L]   So [idea|____________] is ______________."), lines(2)
];
const frameExt=(L)=>[
  lab("PARAGRAPH "+L+"   ·   ____________________"),
  stem("[verb|T]   Fraillon presents [idea|____________] as …"), lines(2),
  stem("[ev|E]   evidence · verb · what it shows about [idea|____________] · effect on the reader"), lines(4),
  stem("[ev|E]   a second piece of evidence, from a different part of the novel"), lines(4),
  stem("[eff|A]   By … , Fraillon shows that …"), lines(2),
  stem("[eff|L]   This shows that [idea|____________] is … and … , and in doing so Fraillon shows the reader that …"), lines(2)
];
const FRAME={core:frameCore,eal:frameEal,low:frameLow,ext:frameExt}[V];

/* ---- paragraph A, by version ---- */
const A_EAL=[
 "Fraillon [verb|presents] [idea|imagination] as the most precious thing Subhi has. It is the one thing the camp cannot take from him.",
 "In the book it says [ev|“Sometimes, at night, the dirt outside turns into a beautiful ocean”]. This [verb|shows] [idea|that imagination is the most precious thing in the camp]. It [eff|lets the reader see the camp the way Subhi sees it].",
 "In the book it also says [ev|“…knowing that Jimmie has a whole real book in her hands gives me a sort of brave”]. This [verb|shows] [idea|that imagination can never be taken away]. It [eff|makes the reader understand where Subhi’s courage comes from].",
 "So, [idea|imagination is the most precious thing in the camp] and [idea|it can never be stolen]. Fraillon [verb|shows] the reader that [eff|the fences hold Subhi’s body but not his mind]."
];
const A_LOW=[
 "Fraillon [verb|presents] [idea|imagination] as the most precious thing Subhi has.",
 "[ev|“Sometimes, at night, the dirt outside turns into a beautiful ocean.”] This [verb|shows] [idea|imagination is the most precious thing in the camp]. It [eff|lets the reader see the camp the way Subhi sees it].",
 "[ev|“…a whole real book in her hands gives me a sort of brave.”] This [verb|shows] [idea|imagination can never be taken away]. It [eff|shows the reader where Subhi’s courage comes from].",
 "So [idea|imagination is the most precious thing in the camp] and [idea|it can never be stolen]."
];
const A_EXT=[
 "Fraillon [verb|presents] [idea|imagination] as the most precious thing Subhi has, because it is the one thing the camp cannot take from him.",
 "[ev|E]   ______________________________________________________________",
 "[ev|E]   ______________________________________________________________",
 "[eff|A]   By … , Fraillon shows that …",
 "This shows that [idea|imagination is the most precious thing in the camp] and that [idea|it can never be stolen], and in doing so Fraillon [verb|shows] the reader that [eff|the fences hold Subhi’s body but not his mind]."
];
const APARA={core:A,eal:A_EAL,low:A_LOW,ext:A_EXT}[V];

const INTRO_EAL="In The Bone Sparrow, Zana Fraillon tells the story of Subhi. Subhi is a boy who was born inside a detention camp. Jimmie is a girl who lives outside the camp and finds a way in. Fraillon presents [idea|imagination], ____________________ and ____________________.";
const INTRO_LOW="The Bone Sparrow is by Zana Fraillon. It is about Subhi, a boy born in a detention camp, and Jimmie, a girl from outside. Fraillon presents [idea|imagination] and ____________________.";
const INTRO_EXT="In The Bone Sparrow, Zana Fraillon tells the story of Subhi, a boy born inside a detention camp, and Jimmie, the girl who finds a way in. Through these two children, Fraillon presents [idea|imagination], ____________________ and ____________________, and suggests that ________________________________________________.";
const CONC_EAL="Fraillon shows the reader [idea|imagination], ____________________ and ____________________. These ideas show that ________________________________________________.";
const CONC_LOW="Fraillon shows the reader [idea|imagination] and ____________________. This shows that ________________________________________________.";
const CONC_EXT="Fraillon uses Subhi and Jimmie to show the reader [idea|imagination], ____________________ and ____________________. Together, these ideas suggest that ________________________________________________ ________________________________________________. In the end, ________________________________________________.";
const INTROS={core:INTRO,eal:INTRO_EAL,low:INTRO_LOW,ext:INTRO_EXT}[V];
const CONCS={core:CONC,eal:CONC_EAL,low:CONC_LOW,ext:CONC_EXT}[V];

const GLOSS=[["detention camp","a place where people are locked up while they wait"],["imagination","making pictures and stories in your mind"],
  ["precious","worth a lot; very important"],["stolen","taken away from you"],["the fences","the edge of the camp; Subhi cannot go past them"],
  ["presents","shows"],["the reader","the person reading the book"]];

const kids=[
  new Paragraph({spacing:{after:200},children:[
    new TextRun({text:"The Bone Sparrow — an essay",bold:true,size:30,color:DEEP,font:"Georgia"}),
    new TextRun({text:"\tName  ",size:18,color:MUTED,font:"Calibri"}),
    new TextRun({text:"______________________",size:18,color:LINE,font:"Calibri"})],
    tabStops:[{type:"right",position:W}]}),
  ...(V==="eal"?[lab("WORDS"),gloss(GLOSS)]:[]),
  lab("INTRODUCTION"),
  box([P(INTROS,SZ,{after:0})]),
  lab("PARAGRAPH A   ·   IMAGINATION"),
  box(APARA.map((t,i)=>P(t,SZ,{after:i<APARA.length-1?100:0})),"FBF7EE"),
  ...(V==="ext"?[lines(6)]:[]),
  br(),
  ...FRAME("B"),
  ...(V==="low"?[]:[br(),...FRAME("C")]),
  lab("CONCLUSION"),
  box([P(CONCS,SZ,{after:0})]),
  ...(V==="ext"?[lines(3)]:[])
];

const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:22,color:INK}}}},
  sections:[{properties:{page:{size:{width:PW,height:16838},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:kids}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);console.log('written '+OUT);});
