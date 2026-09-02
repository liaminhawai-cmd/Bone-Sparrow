const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,LineRuleType,HeightRule}=require('docx');

/* The student essay sheet. The intro and conclusion are printed with gaps,
   paragraph A is printed in full to copy, paragraphs B and C are a frame
   of stems with lines under each. */
const OUT=process.argv[2]||'BoneSparrow-TEEL-worksheet.docx';

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
const stem=t=>new Paragraph({spacing:{before:120,after:40},children:runs(t,21)});
const lines=n=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:NONE,left:NONE,right:NONE,bottom:RULE,insideH:RULE,insideV:NONE},
  rows:Array.from({length:n},()=>new TableRow({height:{value:520,rule:HeightRule.ATLEAST},
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

const frame=(L)=>[
  lab("PARAGRAPH "+L+"   ·   ____________________"),
  stem("[verb|T]   Fraillon also presents [idea|____________] as ______________________________."), lines(1),
  stem("[ev|E]   When ______________, [ev|“______________________________”] shows that [idea|____________] is ______________, which makes the reader ______________."), lines(3),
  stem("[ev|E]   When ______________, [ev|“______________________________”] shows that [idea|____________] is ______________, which makes the reader ______________."), lines(3),
  stem("[eff|L]   This shows that [idea|____________] is ______________ and ______________, and in doing so Fraillon shows the reader that ______________."), lines(2)
];

const kids=[
  new Paragraph({spacing:{after:200},children:[
    new TextRun({text:"The Bone Sparrow — an essay",bold:true,size:30,color:DEEP,font:"Georgia"}),
    new TextRun({text:"\tName  ",size:18,color:MUTED,font:"Calibri"}),
    new TextRun({text:"______________________",size:18,color:LINE,font:"Calibri"})],
    tabStops:[{type:"right",position:W}]}),
  lab("INTRODUCTION"),
  box([P(INTRO,22,{after:0})]),
  lab("PARAGRAPH A   ·   IMAGINATION"),
  box(A.map((t,i)=>P(t,22,{after:i<A.length-1?100:0})),"FBF7EE"),
  br(),
  ...frame("B"),
  br(),
  ...frame("C"),
  lab("CONCLUSION"),
  box([P(CONC,22,{after:0})])
];

const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:22,color:INK}}}},
  sections:[{properties:{page:{size:{width:PW,height:16838},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:kids}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);console.log('written '+OUT);});
