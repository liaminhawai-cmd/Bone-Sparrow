const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,LineRuleType,HeightRule,AlignmentType}=require('docx');

/* The pre-teaching sheet: what an essay is, the big idea, the worked
   paragraph to colour, and a TEEL template for friendship. */
const OUT=process.argv[2]||'BoneSparrow-TEEL-template.docx';
const C={idea:"0B447C",verb:"8A4B12",ev:"7A5A00",eff:"1F5C33"};
const SH={idea:"D6EAFC",verb:"FAE3CF",ev:"FFF3B0",eff:"DFF0E2"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";
const PW=11906, MARG=1000, W=PW-MARG*2;
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const RULE={style:BorderStyle.SINGLE,size:6,color:LINE};
const BOX={style:BorderStyle.SINGLE,size:8,color:DEEP};

const R=(t,o)=>new TextRun({text:t,size:22,font:"Georgia",color:INK,...o});
const P=(runs,o)=>new Paragraph({spacing:{after:120,...(o||{})},children:Array.isArray(runs)?runs:[R(runs)]});
const H=t=>new Paragraph({spacing:{before:260,after:80},children:[new TextRun({text:t,bold:true,size:24,color:DEEP,font:"Georgia"})]});
const lab=t=>new Paragraph({spacing:{before:220,after:60},children:[new TextRun({text:t,bold:true,size:18,color:DEEP,characterSpacing:20,font:"Calibri"})]});
const bullet=t=>new Paragraph({spacing:{after:60},indent:{left:400,hanging:240},children:[R("•  "),R(t)]});
const lines=n=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:NONE,left:NONE,right:NONE,bottom:RULE,insideH:RULE,insideV:NONE},
  rows:Array.from({length:n},()=>new TableRow({height:{value:560,rule:HeightRule.ATLEAST},
    children:[new TableCell({width:{size:W,type:WidthType.DXA},margins:{top:0,bottom:0,left:20,right:20},
      children:[new Paragraph({spacing:{after:0},children:[new TextRun({text:"",size:22})]})]})]}))});
const box=(kids,fill)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:NONE,insideV:NONE},
  rows:[new TableRow({children:[new TableCell({width:{size:W,type:WidthType.DXA},
    shading:fill?{type:ShadingType.CLEAR,fill,color:"auto"}:undefined,
    margins:{top:140,bottom:140,left:200,right:200},children:kids})]})]});
const br=()=>new Paragraph({children:[new PageBreak()]});
const swatch=(k,t)=>new TextRun({text:"  "+t+"  ",size:20,bold:true,color:C[k],font:"Calibri",shading:{type:ShadingType.CLEAR,fill:SH[k]}});
const key=()=>new Paragraph({spacing:{after:160},children:[swatch("idea","idea"),R("   "),swatch("verb","verb"),R("   "),swatch("ev","evidence"),R("   "),swatch("eff","purpose")]});

/* the paragraph in bars: each row is the shape of one sentence */
const BARC={idea:"7FB3E6",verb:"F2B27A",ev:"F5D75A",eff:"8FD39A",plain:"D8CFBB"};
const bars=(rows)=>{const BW=W-900;
  return new Table({columnWidths:[900,BW],width:{size:W,type:WidthType.DXA},
    borders:{top:NONE,bottom:NONE,left:NONE,right:NONE,insideH:NONE,insideV:NONE},
    rows:rows.map(([l,segs])=>{const tot=segs.reduce((a,x)=>a+x[1],0);
      const cw=segs.map(x=>Math.floor(BW*x[1]/tot));
      return new TableRow({height:{value:420,rule:HeightRule.ATLEAST},children:[
        new TableCell({width:{size:900,type:WidthType.DXA},margins:{top:60,bottom:60,left:120,right:60},
          children:[new Paragraph({children:[new TextRun({text:l,bold:true,size:26,color:"A83232",font:"Calibri"})]})]}),
        new TableCell({width:{size:BW,type:WidthType.DXA},margins:{top:80,bottom:80,left:0,right:0},children:[
          new Table({columnWidths:cw,width:{size:cw.reduce((a,b)=>a+b,0),type:WidthType.DXA},
            borders:{top:NONE,bottom:NONE,left:NONE,right:NONE,insideH:NONE,insideV:{style:BorderStyle.SINGLE,size:24,color:"FFFFFF"}},
            rows:[new TableRow({height:{value:260,rule:HeightRule.EXACT},children:segs.map((x,i)=>new TableCell({width:{size:cw[i],type:WidthType.DXA},
              shading:{type:ShadingType.CLEAR,fill:BARC[x[0]],color:"auto"},margins:{top:0,bottom:0,left:0,right:0},
              children:[new Paragraph({spacing:{after:0,line:200,lineRule:LineRuleType.EXACT},children:[new TextRun({text:"",size:8})]})]}))})]})]})]});})});};
const T_BAR=[["idea",1]], E_BAR=[["ev",3],["verb",1],["idea",3],["eff",3]], L_BAR=[["idea",2],["idea",2],["eff",3]];

/* TEEL rows: letter, what goes there, a box to write in */
const teel=(rows)=>new Table({columnWidths:[700,2600,W-3300],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:RULE,insideV:RULE},
  rows:rows.map(([l,d,h])=>new TableRow({height:{value:h,rule:HeightRule.ATLEAST},children:[
    new TableCell({width:{size:700,type:WidthType.DXA},margins:{top:100,bottom:100,left:120,right:60},
      children:[new Paragraph({children:[new TextRun({text:l,bold:true,size:40,color:DEEP,font:"Georgia"})]})]}),
    new TableCell({width:{size:2600,type:WidthType.DXA},margins:{top:100,bottom:100,left:100,right:100},
      shading:{type:ShadingType.CLEAR,fill:"F6F1E6",color:"auto"},
      children:d.map(x=>new Paragraph({spacing:{after:40},children:[new TextRun({text:x,size:17,color:MUTED,font:"Calibri"})]}))}),
    new TableCell({width:{size:W-3300,type:WidthType.DXA},margins:{top:100,bottom:100,left:120,right:120},
      children:[new Paragraph({children:[]})]})]}))});

const WORKED=[
 "Imagination is essential to Subhi's survival because it gives him somewhere to go when he cannot leave and it keeps his hope alive.",
 "When the novel opens, “Sometimes, at night, the dirt outside turns into a beautiful ocean.” This shows that imagination gives Subhi somewhere to go, which lets the reader see the camp the way Subhi sees it.",
 "Later, “…knowing that Jimmie has a whole real book in her hands gives me a sort of brave that I haven't felt since Eli got taken.” This shows that imagination keeps his hope alive, which makes the reader understand where Subhi's courage comes from.",
 "So, because it gives him somewhere to go and it keeps his hope alive, imagination is what keeps Subhi alive inside the fence."
];

const kids=[
  new Paragraph({spacing:{after:200},children:[
    new TextRun({text:"The Bone Sparrow — writing about an idea",bold:true,size:30,color:DEEP,font:"Georgia"}),
    new TextRun({text:"\tName  ",size:18,color:MUTED,font:"Calibri"}),
    new TextRun({text:"______________________",size:18,color:LINE,font:"Calibri"})],
    tabStops:[{type:"right",position:W}]}),

  H("What an essay is"),
  P("An essay is an argument. It says one thing about the novel and then proves it, one paragraph at a time. It is written in full sentences and paragraphs, in formal language, for a reader who has already read the book. That reader does not need the story retold. They need to be shown why your idea is true."),
  P("A text response essay has an introduction, three body paragraphs, and a conclusion. Every body paragraph does the same job: it takes one part of your argument, gives evidence from the novel, and explains what that evidence shows and why the author wrote it that way."),

  H("The argument"),
  box([P([R("The Bone Sparrow shows us that "),R("imagination",{bold:true,color:C.idea,shading:{type:ShadingType.CLEAR,fill:SH.idea}}),
     R(" and "),R("friendship",{bold:true,color:C.idea,shading:{type:ShadingType.CLEAR,fill:SH.idea}}),R(" are essential for survival.")],{after:0})]),

  H("The shape of a paragraph"),
  key(),
  bars([["T",T_BAR],["E",E_BAR],["E",E_BAR],["L",L_BAR]]),
  P([R("T  the idea, and why it matters.   E  a quote, what it shows, what it does to the reader.   L  A and B, back to the main idea.",{size:18,color:MUTED,font:"Calibri"})],{before:120}),

  br(),
  H("Colour the worked paragraph"),
  P([R("Colour each sentence to match its bar: "),swatch("idea","idea"),R(", "),swatch("verb","verb"),R(", "),swatch("ev","evidence"),R(", "),swatch("eff","purpose"),R(".")]),
  bars([["T",T_BAR],["E",E_BAR],["E",E_BAR],["L",L_BAR]]),
  box(WORKED.map((t,i)=>new Paragraph({spacing:{after:i<3?140:0,line:520,lineRule:LineRuleType.EXACT},children:[R(t,{size:23})]})),"FBF7EE"),

  H("Friendship"),
  P("Two reasons friendship is essential for Subhi's survival:"),
  P([R("A  "),R("______________________________________________________",{color:LINE})]),
  P([R("B  "),R("______________________________________________________",{color:LINE})]),
  teel([
    ["T",["Friendship is essential to Subhi's survival because A and B."],1300],
    ["E",["When …, “…”.","This shows that A, which …"],2000],
    ["E",["Later, “…”.","This shows that B, which …"],2000],
    ["L",["So, because A and B, friendship is what …"],1300]])
];

const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:22,color:INK}}}},
  sections:[{properties:{page:{size:{width:PW,height:16838},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:kids}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);console.log('written '+OUT);});
