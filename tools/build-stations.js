const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,AlignmentType,VerticalAlign,PageBreak,PageOrientation,HeightRule}=require('docx');

/* Six station cards for the walls of the room, then one map sheet per
   student. Students walk the stations and draw a line on the map between any
   two that connect, writing the connection on the line. */
const OUT=process.argv[2]||'BoneSparrow-stations.docx';

const C={idea:"0B447C",ev:"7A5A00",eff:"1F5C33"};
const SH={idea:"D6EAFC",ev:"FFF3B0",eff:"DFF0E2"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";

const STATIONS=[
 {kind:"ev",  label:"EVIDENCE", text:"“Sometimes, at night, the dirt outside turns into a beautiful ocean.”", sub:"Chapter 1"},
 {kind:"idea",label:"IDEA",     text:"imagination", sub:""},
 {kind:"eff", label:"EFFECT",   text:"makes the reader see the camp the way Subhi sees it", sub:""},
 {kind:"ev",  label:"EVIDENCE", text:"“There are only fourteen pairs of real shoes in this whole entire camp.”", sub:"Chapter 4"},
 {kind:"idea",label:"IDEA",     text:"power", sub:""},
 {kind:"eff", label:"EFFECT",   text:"makes the reader feel how little the camp gives people", sub:""}
];

/* A4 portrait */
const PW=11906, PH=16838, MARG=900;

const children=[];
const mapKids=[];

/* ---- the six cards ---- */
STATIONS.forEach((st,i)=>{
  children.push(new Paragraph({spacing:{before:1200,after:600},alignment:AlignmentType.CENTER,
    children:[new TextRun({text:"STATION "+(i+1),bold:true,size:40,color:MUTED,
      characterSpacing:40,font:"Calibri"})]}));
  children.push(new Paragraph({spacing:{after:1400},alignment:AlignmentType.CENTER,
    children:[new TextRun({text:st.label,bold:true,size:56,color:C[st.kind],
      characterSpacing:60,font:"Calibri"})]}));
  children.push(new Table({columnWidths:[PW-MARG*2],width:{size:PW-MARG*2,type:WidthType.DXA},
    borders:{top:{style:BorderStyle.SINGLE,size:12,color:C[st.kind]},
             bottom:{style:BorderStyle.SINGLE,size:12,color:C[st.kind]},
             left:{style:BorderStyle.SINGLE,size:12,color:C[st.kind]},
             right:{style:BorderStyle.SINGLE,size:12,color:C[st.kind]}},
    rows:[new TableRow({height:{value:5200,rule:HeightRule.ATLEAST},children:[
      new TableCell({width:{size:PW-MARG*2,type:WidthType.DXA},
        verticalAlign:VerticalAlign.CENTER,
        shading:{type:ShadingType.CLEAR,fill:SH[st.kind],color:"auto"},
        margins:{top:400,bottom:400,left:500,right:500},
        children:[new Paragraph({alignment:AlignmentType.CENTER,spacing:{line:640,lineRule:"exact"},
          children:[new TextRun({text:st.text,bold:true,size:st.kind==="idea"?96:52,
            italics:st.kind==="ev",color:INK,font:"Georgia"})]})]})]})]}));
  if(st.sub) children.push(new Paragraph({spacing:{before:500},alignment:AlignmentType.CENTER,
    children:[new TextRun({text:st.sub,size:30,color:MUTED,font:"Calibri"})]}));
  if(i<STATIONS.length-1) children.push(new Paragraph({children:[new PageBreak()]}));
});

/* ---- the map sheet ---- */
const node=(st,i,w)=>new TableCell({width:{size:w,type:WidthType.DXA},
  verticalAlign:VerticalAlign.CENTER,
  shading:{type:ShadingType.CLEAR,fill:SH[st.kind],color:"auto"},
  borders:{top:{style:BorderStyle.SINGLE,size:8,color:C[st.kind]},
           bottom:{style:BorderStyle.SINGLE,size:8,color:C[st.kind]},
           left:{style:BorderStyle.SINGLE,size:8,color:C[st.kind]},
           right:{style:BorderStyle.SINGLE,size:8,color:C[st.kind]}},
  margins:{top:120,bottom:120,left:160,right:160},
  children:[
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:40},children:[
      new TextRun({text:(i+1)+" · "+st.label,bold:true,size:14,color:C[st.kind],font:"Calibri"})]}),
    new Paragraph({alignment:AlignmentType.CENTER,children:[
      new TextRun({text:st.text,size:st.kind==="idea"?26:16,bold:st.kind==="idea",
        italics:st.kind==="ev",color:INK,font:"Georgia"})]}),
    ...(st.sub?[new Paragraph({alignment:AlignmentType.CENTER,children:[
      new TextRun({text:st.sub,size:12,color:MUTED,font:"Calibri"})]})]:[])
  ]});
const gap=(w,h)=>new TableCell({width:{size:w,type:WidthType.DXA},
  borders:{top:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},bottom:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},
           left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}},
  children:[new Paragraph({children:[]})]});

/* A4 landscape map: six nodes around an empty middle */
const LW=15838-800*2; const NW=Math.floor(LW/3);
mapKids.push(new Paragraph({spacing:{after:20},children:[
  new TextRun({text:"Name",size:14,color:MUTED,font:"Calibri"}),
  new TextRun({text:"  ______________________",size:14,color:LINE,font:"Calibri"})]}));
mapKids.push(new Paragraph({spacing:{after:120},children:[
  new TextRun({text:"Walk the stations. Draw a line between two that connect, and write the connection on the line.",
    size:16,color:INK,font:"Calibri"})]}));
mapKids.push(new Table({columnWidths:[NW,NW,NW],width:{size:LW,type:WidthType.DXA},
  borders:{top:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},bottom:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},
           left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},
           insideH:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},insideV:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}},
  rows:[
    new TableRow({height:{value:2400,rule:HeightRule.ATLEAST},
      children:[node(STATIONS[0],0,NW),gap(NW),node(STATIONS[1],1,NW)]}),
    new TableRow({height:{value:2900,rule:HeightRule.ATLEAST},
      children:[node(STATIONS[5],5,NW),gap(NW),node(STATIONS[2],2,NW)]}),
    new TableRow({height:{value:2400,rule:HeightRule.ATLEAST},
      children:[node(STATIONS[4],4,NW),gap(NW),node(STATIONS[3],3,NW)]})
  ]}));

const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:19,color:INK}}}},
  sections:[
    {properties:{page:{size:{width:PW,height:PH},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},
     children:children},
    {properties:{page:{size:{width:PW,height:PH,orientation:PageOrientation.LANDSCAPE},
      margin:{top:700,bottom:700,left:800,right:800}}},
     children:mapKids}
  ]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);
  console.log('written '+OUT+' — 6 station cards + map sheet');});
