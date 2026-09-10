const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,ExternalHyperlink,AlignmentType}=require('docx');

/* One lesson, on the department's own lesson-plan table: the purple header
   row with the unit on the left and the lesson on the right, then a tinted
   row for each phase — green Engage, pink Develop and Discover, blue Apply
   and Explore, yellow Review. Every resource is a link to the live site, so
   a change there is a change here. */
const OUT=process.argv[2]||'BoneSparrow-lesson-precat.docx';
const SITE="https://liaminhawai-cmd.github.io/Bone-Sparrow/";

const INK="000000", LINK="0563C1";
const HEAD_FILL="7030A0", HEAD_TEXT="FFC000";
const TINT={ /* label cell, content cell */
  engage:["A9D18E","E2EFDA"], develop:["F4B6B6","FCE4E4"],
  apply:["9DC3E6","DEEBF7"],  review:["FFE699","FFF2CC"], plain:["FFFFFF","FFFFFF"]
};
const RULE={style:BorderStyle.SINGLE,size:6,color:"808080"};

const T=(t,o={})=>new TextRun({text:t,font:"Calibri",size:22,color:INK,...o});
const L=(t,href)=>new ExternalHyperlink({link:href,children:[
  new TextRun({text:t,font:"Calibri",size:22,color:LINK,underline:{}})]});
const P=(runs,o={})=>new Paragraph({spacing:{after:o.after===undefined?60:o.after},
  children:Array.isArray(runs)?runs:[T(runs)]});
const bullet=(runs)=>new Paragraph({spacing:{after:40},indent:{left:300,hanging:200},
  children:[T("•\t"),...(Array.isArray(runs)?runs:[T(runs)])]});

/* the live resources */
const U={
  hub:SITE+"teacher/",
  posters:SITE+"BoneSparrow-idea-posters.docx",
  tickets:SITE+"BoneSparrow-chapter-tickets.docx",
  hunt:SITE+"BoneSparrow-quote-hunt.docx",
  wall:SITE+"BoneSparrowWagollWall.html",
  folio:SITE+"BoneSparrow-assessment-folio.docx"
};

const PW=11906, PH=16838, MARG=800, W=PW-MARG*2;
const LABW=2700, CONW=W-LABW;
const cell=(kids,w,fill)=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:90,bottom:90,left:140,right:140},
  shading:{type:ShadingType.CLEAR,fill,color:"auto"},children:kids});

/* one row: the label, its tint, the content */
const row=(lab,kind,content)=>new TableRow({children:[
  cell([P([T(lab,{bold:true})])],LABW,TINT[kind][0]),
  cell(Array.isArray(content)?content:[content],CONW,TINT[kind][1])]});

const header=new TableRow({tableHeader:true,children:[
  cell([P([T("Reading The Bone Sparrow",{bold:true,color:HEAD_TEXT})])],LABW,HEAD_FILL),
  cell([new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},
    children:[T("Analytical writing – collecting evidence",{bold:true,color:HEAD_TEXT})]})],CONW,HEAD_FILL)]});

const rows=[
  header,
  row("Learning intention","plain",
    P("We are learning to find and record evidence from the whole novel, organised by idea.")),
  row("I will be successful when:","plain",[
    bullet("I have found at least 6 quotes from my two chapters, each with its chapter number"),
    bullet("I have added every one of them to the poster it belongs to"),
    bullet("I have a finished quote-hunt sheet to bring into the CAT")]),
  row("Engage","engage",
    P("The six ideas on the board — imprisonment, freedom, imagination, storytelling, loneliness, friendship and family. Think–pair–share, 2 minutes: which one do you already have a quote for, and which chapter is it in?")),
  row("Develop and Discover","develop",[
    P([T("The six "),L("idea posters",U.posters),T(" are up around the room, one idea each with a few ways of reading it; the rest of the sheet is blank.")]),
    P("Model one: pick a chapter, find a quote, name the poster it belongs to and why. Write it on a sticky note — the words, the chapter, your name — and on the quote-hunt sheet in the same go. A quote can fit two posters; put it on both."),
    P([T("Hand out the "),L("chapter tickets",U.tickets),T(", cut and shuffled. Each student draws one: two chapters (chapter 37 is on its own). Tickets repeat for a class bigger than 19, and that is fine — two students on the same chapters find different quotes.")],{after:0})]),
  row("Apply","apply",[
    P([T("Working alone, on the "),L("quote-hunt sheet",U.hunt),T(":")]),
    bullet("Skim your two chapters for the six ideas — a re-read with a purpose"),
    bullet("At least 6 quotes, from at least 3 different posters"),
    bullet("Each one on a sticky note — the words, the chapter, your name — onto the matching poster as you go"),
    bullet("The same quote on your own sheet, plus what it shows")]),
  row("Explore and extend","apply",[
    bullet("Find a quote that fits two posters and explain the overlap on your sheet"),
    bullet("If your chapters are quiet on an idea, borrow one from a poster onto your sheet — with the chapter, and whose it is")]),
  row("Review and reflect:","review",
    P([T("Gallery walk, two minutes, posters that aren't yours. Then the conditions for the "),L("CAT",U.folio),T(": your novel, a dictionary, your quote-hunt sheet, one page of your own notes if you want it — nothing else. The posters and the "),L("writing wall",U.wall),T(" stay in the room.")])),
  row("You will need","plain",[
    P([T("Your copy of "),T("The Bone Sparrow",{italics:true})]),
    P([L("Idea posters",U.posters),T("  (A3, around the room)")]),
    P([L("Chapter tickets",U.tickets),T("  (cut and shuffled)")]),
    P([L("Quote-hunt sheet",U.hunt),T("  (one each)")]),
    P("Sticky notes",{after:0})]),
  row("After the lesson","plain",
    P([T("Collect the posters, scan them, print a set for everyone — the class evidence booklet to study from before the CAT. The quote-hunt sheet is theirs to keep and bring in. Everything above lives on the "),L("teacher hub",U.hub),T(".")]))
];

const table=new Table({columnWidths:[LABW,CONW],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},rows});

const doc=new Document({styles:{default:{document:{run:{font:"Calibri",size:22,color:INK}}}},
  sections:[{properties:{page:{size:{width:PW,height:PH},
    margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:[table]}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);console.log('written '+OUT);});
