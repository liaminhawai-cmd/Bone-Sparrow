const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,AlignmentType,VerticalAlign,PageBreak,HeightRule}=require('docx');

/* Six A3 posters for the walls, one idea each, and a notes sheet per student.
   Each student or pair owns a chapter or two, finds the quotes in it, and
   sticks them on whichever posters they belong to; the notes sheet is their
   own record of what went where. The posters are collated, scanned and
   printed as the booklet for the sitting, so every quote needs its chapter. */
const OUT=process.argv[2]||'BoneSparrow-idea-posters.docx';
const NOTES=process.argv[3]||'BoneSparrow-quote-hunt.docx';

const C={idea:"0B447C",verb:"8A4B12",ev:"7A5A00",eff:"1F5C33"};
const SH={idea:"D6EAFC",verb:"FAE3CF",ev:"FFF3B0",eff:"DFF0E2"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const RULE={style:BorderStyle.SINGLE,size:6,color:LINE};
const BOX={style:BorderStyle.SINGLE,size:12,color:DEEP};

/* the ideas, each with the ways it can be read — a hint, not a grid */
const POSTERS=[
 ["Imprisonment","locked in  ·  locked out  ·  two sides of one fence"],
 ["Freedom","freedom to move  ·  freedom in your head  ·  small freedoms"],
 ["Imagination","somewhere to go  ·  making sense of things  ·  believing in what comes next"],
 ["Storytelling","stories that carry people  ·  stories that get the truth out  ·  stories that make you brave"],
 ["Loneliness","alone inside  ·  alone outside  ·  unseen"],
 ["Friendship and family","friends who come back  ·  friends who share  ·  family worn down"]
];

/* ------------------------------------------------------------ the posters
   A3 landscape. docx swaps the page dimensions itself for a landscape page,
   so the size passed is A3 portrait; the printed sheet is 23811 wide. */
const A3W=16838, A3H=23811, MARG=800;
const W=A3H-MARG*2, H=A3W-MARG*2;
const BANNER=2600;

const poster=([idea,hint])=>[
  new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
    borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:RULE,insideV:NONE},
    rows:[
      new TableRow({height:{value:BANNER,rule:HeightRule.ATLEAST},children:[
        new TableCell({width:{size:W,type:WidthType.DXA},verticalAlign:VerticalAlign.CENTER,
          shading:{type:ShadingType.CLEAR,fill:SH.idea,color:"auto"},
          margins:{top:120,bottom:120,left:300,right:300},
          children:[
            new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},
              children:[new TextRun({text:idea,bold:true,size:120,color:C.idea,font:"Georgia"})]}),
            new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},
              children:[new TextRun({text:hint,size:28,color:MUTED,font:"Calibri"})]})]})]}),
      new TableRow({height:{value:H-BANNER-700,rule:HeightRule.ATLEAST},children:[
        new TableCell({width:{size:W,type:WidthType.DXA},
          margins:{top:200,bottom:200,left:300,right:300},
          children:[new Paragraph({children:[]})]})]})]}),
  new Paragraph({spacing:{before:120,after:0},children:[
    new TextRun({text:"The Bone Sparrow",size:20,color:MUTED,font:"Calibri"}),
    new TextRun({text:"\tEvery quote: the words, the chapter, your name.",size:20,color:MUTED,font:"Calibri"})],
    tabStops:[{type:"right",position:W}]})
];

const pkids=[];
POSTERS.forEach((p,i)=>{
  if(i) pkids.push(new Paragraph({spacing:{after:0},children:[new PageBreak()]}));
  pkids.push(...poster(p));
});
const posters=new Document({styles:{default:{document:{run:{font:"Georgia",size:24,color:INK}}}},
  sections:[{properties:{page:{size:{width:A3W,height:A3H,orientation:"landscape"},
    margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:pkids}]});

/* ------------------------------------------------------------ the notes sheet
   A4 portrait, one per student: their chapters, and every quote they found
   with where it went. */
const PW=11906, PH=16838, M4=900, W4=PW-M4*2;
const R=(t,o)=>new TextRun({text:t,size:22,font:"Georgia",color:INK,...o});
const cell=(kids,w,o)=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:90,bottom:90,left:120,right:120},...(o||{}),children:kids});
const th=(t,k)=>new Paragraph({spacing:{after:0},children:[new TextRun({text:t,bold:true,size:17,
  color:k?C[k]:MUTED,font:"Calibri",characterSpacing:20})]});
const QW=W4-1100-2600-3200;
const ROWS=9;
const nkids=[
  new Paragraph({spacing:{after:60},children:[
    new TextRun({text:"The Bone Sparrow — quote hunt",bold:true,size:30,color:DEEP,font:"Georgia"}),
    new TextRun({text:"\tName  ",size:18,color:MUTED,font:"Calibri"}),
    new TextRun({text:"______________________",size:18,color:LINE,font:"Calibri"})],
    tabStops:[{type:"right",position:W4}]}),
  new Paragraph({spacing:{after:200},children:[
    R("My chapters:  ",{color:MUTED,size:20}),R("________________",{color:LINE}),
    R("        Posters I added to:  ",{color:MUTED,size:20}),R("_____  of 6",{color:LINE})]}),
  new Table({columnWidths:[QW,1100,2600,3200],width:{size:W4,type:WidthType.DXA},
    borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({tableHeader:true,children:[
        cell([th("The quote","ev")],QW,{shading:{type:ShadingType.CLEAR,fill:SH.ev,color:"auto"}}),
        cell([th("Chapter")],1100),
        cell([th("Which poster","idea")],2600,{shading:{type:ShadingType.CLEAR,fill:SH.idea,color:"auto"}}),
        cell([th("What it shows","eff")],3200,{shading:{type:ShadingType.CLEAR,fill:SH.eff,color:"auto"}})]}),
      ...Array.from({length:ROWS},()=>new TableRow({height:{value:1380,rule:HeightRule.ATLEAST},children:[
        cell([new Paragraph({children:[]})],QW),cell([new Paragraph({children:[]})],1100),
        cell([new Paragraph({children:[]})],2600),cell([new Paragraph({children:[]})],3200)]}))]}),
  new Paragraph({spacing:{before:160,after:0},children:[
    new TextRun({text:"At least 6 quotes, across at least three different posters. Chapter number on every one.",size:19,color:MUTED,font:"Calibri"})]}),
  new Paragraph({spacing:{before:80,after:0},children:[
    new TextRun({text:"Keep this sheet — you can bring it into the CAT.",size:19,color:DEEP,font:"Calibri",bold:true})]})
];
const notes=new Document({styles:{default:{document:{run:{font:"Georgia",size:22,color:INK}}}},
  sections:[{properties:{page:{size:{width:PW,height:PH},margin:{top:M4,bottom:M4,left:M4,right:M4}}},
    children:nkids}]});

Packer.toBuffer(posters).then(b=>{fs.writeFileSync(OUT,b);console.log('written '+OUT+'  ('+POSTERS.length+' A3 landscape)');
  console.log('  banner '+BANNER+' + field '+(H-BANNER-700)+' + footer ~500 of '+H);
  return Packer.toBuffer(notes);
}).then(b=>{fs.writeFileSync(NOTES,b);console.log('written '+NOTES);
  console.log('  header ~900 + table '+(400+ROWS*1380)+' + foot 400 of '+(PH-M4*2));});
