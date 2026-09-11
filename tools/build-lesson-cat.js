const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,ExternalHyperlink,AlignmentType}=require('docx');

/* The CAT sitting, on the department's lesson-plan table. One plan; it runs
   three times with a different booklet each time. No Engage row: the lesson
   opens with the conditions. Links go to the live site. */
const OUT=process.argv[2]||'BoneSparrow-lesson-cat.docx';
const SITE="https://liaminhawai-cmd.github.io/Bone-Sparrow/";

const INK="000000", LINK="0563C1";
const HEAD_FILL="7030A0", HEAD_TEXT="FFC000";
const TINT={
  develop:["F4B6B6","FCE4E4"], apply:["9DC3E6","DEEBF7"],
  review:["FFE699","FFF2CC"], plain:["FFFFFF","FFFFFF"]
};
const RULE={style:BorderStyle.SINGLE,size:6,color:"808080"};

const T=(t,o={})=>new TextRun({text:t,font:"Calibri",size:22,color:INK,...o});
const L=(t,href)=>new ExternalHyperlink({link:href,children:[
  new TextRun({text:t,font:"Calibri",size:22,color:LINK,underline:{}})]});
const P=(runs,o={})=>new Paragraph({spacing:{after:o.after===undefined?60:o.after},
  children:Array.isArray(runs)?runs:[T(runs)]});
const bullet=(runs)=>new Paragraph({spacing:{after:40},indent:{left:300,hanging:200},
  children:[T("•\t"),...(Array.isArray(runs)?runs:[T(runs)])]});

const U={
  ideas:SITE+"BoneSparrow-CAT-folio-ideas.docx",
  sentences:SITE+"BoneSparrow-CAT-folio-sentences.docx",
  hunt:SITE+"BoneSparrow-quote-hunt.docx"
};

const PW=11906, PH=16838, MARG=800, W=PW-MARG*2;
const LABW=2700, CONW=W-LABW;
const cell=(kids,w,fill)=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:90,bottom:90,left:140,right:140},
  shading:{type:ShadingType.CLEAR,fill,color:"auto"},children:kids});
const row=(lab,kind,content)=>new TableRow({children:[
  cell([P([T(lab,{bold:true})])],LABW,TINT[kind][0]),
  cell(Array.isArray(content)?content:[content],CONW,TINT[kind][1])]});

const header=new TableRow({tableHeader:true,children:[
  cell([P([T("Reading The Bone Sparrow",{bold:true,color:HEAD_TEXT})])],LABW,HEAD_FILL),
  cell([new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},
    children:[T("Analytical writing – CAT folio sitting",{bold:true,color:HEAD_TEXT})]})],CONW,HEAD_FILL)]});

const rows=[
  header,
  row("Learning intention","plain",
    P("We are learning to write an analytical paragraph under test conditions.")),
  row("I will be successful when:","plain",[
    bullet("I have finished the introduction"),
    bullet("I have written a TEEL paragraph of my own with an embedded quote"),
    bullet("I have self scored my paragraph")]),
  row("Develop and Discover","develop",[
    P([T("Teacher to explain the test conditions. On the table: novel, dictionary, "),L("quote-hunt sheet",U.hunt),T(", one page of notes. No pre-written paragraphs or essays. 40 minutes. No help with drafting.")]),
    P([T("Hand out the task: two sheets, four pages. This lesson runs three times, one task each. Task sheet, cover and rubric are in the same file: "),
       L("idea colours",U.ideas),T(" or "),L("one colour per sentence",U.sentences),T(".")],{after:0})]),
  row("Apply","apply",[
    P("Students complete the booklet:"),
    bullet("Finish the introduction"),
    bullet("Read paragraph 1"),
    bullet("Write paragraph 2"),
    bullet("Finish the conclusion")]),
  row("Explore and extend","apply",
    P("Students write paragraph 3, or a third piece of evidence in paragraph 2.")),
  row("Review and reflect:","review",
    P("Students self score on the last page of the booklet and write one thing to do better next time. Teacher feedback goes in the box below it before the next sitting.")),
  row("You will need","plain",[
    P([T("Your copy of "),T("The Bone Sparrow",{italics:true})]),
    P("Dictionary"),
    P([L("Quote-hunt sheet",U.hunt)]),
    P("One page of notes"),
    P([L("CAT folio, idea colours",U.ideas),T("  ·  "),L("one colour per sentence",U.sentences)],{after:0})])
];

const table=new Table({columnWidths:[LABW,CONW],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},rows});

const doc=new Document({styles:{default:{document:{run:{font:"Calibri",size:22,color:INK}}}},
  sections:[{properties:{page:{size:{width:PW,height:PH},
    margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:[table]}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);console.log('written '+OUT);});
