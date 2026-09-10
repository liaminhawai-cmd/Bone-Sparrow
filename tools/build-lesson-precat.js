const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,HeightRule}=require('docx');

/* One lesson, on the department's own two-column lesson-plan table:
   label | content, blank left cell to continue a section onto another row.
   This is the shape every OneNote lesson page in the unit already uses. */
const OUT=process.argv[2]||'BoneSparrow-lesson-precat.docx';

const INK="000000",MUTED="595959",LINE="BFBFBF";
const LABEL_FILL="E7E6E6";
const RULE={style:BorderStyle.SINGLE,size:4,color:LINE};

const T=(t,o={})=>new TextRun({text:t,font:"Calibri",size:22,color:INK,...o});
const P=(runs,o={})=>new Paragraph({spacing:{after:o.after===undefined?60:o.after},
  children:Array.isArray(runs)?runs:[T(runs)]});
const bullet=(t,o={})=>new Paragraph({spacing:{after:40},indent:{left:300,hanging:200},
  children:[T("•\t"+t,o)]});

const PW=11906, PH=16838, MARG=800, W=PW-MARG*2;
const LABW=2600, CONW=W-LABW;
const cell=(kids,w,o={})=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:100,bottom:100,left:140,right:140},...o,children:kids});
const label=(t)=>cell([P([T(t,{bold:true})])],LABW,{shading:{type:ShadingType.CLEAR,fill:LABEL_FILL,color:"auto"}});
const blankLabel=()=>cell([P("")],LABW,{shading:{type:ShadingType.CLEAR,fill:LABEL_FILL,color:"auto"}});

/* a section is one or more rows: the label on the first row only, the
   content split across as many rows as it needs */
function section(lab,blocks){
  return blocks.map((b,i)=>new TableRow({children:[
    i===0?label(lab):blankLabel(),
    cell(Array.isArray(b)?b:[b],CONW)]}));
}

const rows=[
  ...section("Reading The Bone Sparrow",[P([T("Pre-CAT — collecting evidence for the assessment",{bold:true,size:26})])]),
  ...section("Learning intention",[
    P("To find and record quotations from across the whole novel, organised by the ideas I might write about in the CAT.")]),
  ...section("I will be successful when:",[[
    bullet("I have found at least 6 quotes from my chapters, each with the correct chapter number"),
    bullet("I have added my quotes to the posters they belong to"),
    bullet("I have a completed quote-hunt sheet to take into the CAT")]]),
  ...section("Engage",[
    P([T("Quick recap.",{bold:true}),T(" On the board or out loud: the six ideas the unit has tracked — imprisonment, freedom, imagination, storytelling, loneliness, friendship and family. 2 minutes, think–pair–share: which one already has a quote in your memory, and which chapter is it from?")])]),
  ...section("Develop and Discover",[[
    P([T("The posters are up around the room, one idea on each"),T(" — imprisonment, freedom, imagination, storytelling, loneliness, friendship and family. Each poster has the idea and a few ways of reading it; the rest of the sheet is blank.")]),
    P([T("Model the task"),T(" with one example: take a chapter, find a quote, say which poster it belongs to and why, then write it on a sticky note (the words, the chapter number, your name) and on the quote-hunt sheet in the same go. Point out that the same quote can sometimes fit more than one poster — that's fine, put it on both.")]),
    P([T("Hand out chapter tickets.",{bold:true}),T(" Cut and shuffled in advance (BoneSparrow-chapter-tickets.docx). Each student draws one at random and gets two chapters (chapter 37 is on its own). If a class is bigger than 19, the tickets repeat — that's fine, two students on the same two chapters will still find different quotes.")])]]),
  ...section("Apply",[[
    P([T("Working alone, students:")]),
    bullet("Skim their two chapters for the ideas on the posters — most of this reading has already been done; this is a re-read with a purpose"),
    bullet("Find at least 6 quotes total, from at least 3 different posters"),
    bullet("Write each quote on a sticky note — the words, the chapter, their name — and stick it on the matching poster as they go"),
    bullet("Copy the same information onto their own quote-hunt sheet (BoneSparrow-quote-hunt.docx), plus a line on what the quote shows"),
    P([T("Circulate and check the posters as they fill — a chapter with nothing found is a chapter nobody has actually opened.",{})],{after:0})]]),
  ...section("Explore and extend",[[
    bullet("Find a quote that fits two different posters and explain the overlap on your sheet"),
    bullet("If your two chapters are quiet on a particular idea, read the poster and borrow one other student's quote onto your own sheet, with their name and the chapter noted")]]),
  ...section("Review and reflect:",[
    P("Gallery walk: two minutes reading posters that aren't your own. Then, as a class: remind them what the CAT conditions are. Nothing goes into the sitting except this quote-hunt sheet, one page of their own notes if they want it, their novel and a dictionary — the posters and the writing wall stay in the room.")]),
  ...section("You will need",[[
    bullet("Idea posters around the room (BoneSparrow-idea-posters.docx, printed A3)"),
    bullet("Chapter tickets, cut and shuffled (BoneSparrow-chapter-tickets.docx)"),
    bullet("One quote-hunt sheet per student (BoneSparrow-quote-hunt.docx)"),
    bullet("Sticky notes"),
    bullet("Novels")]]),
  ...section("After the lesson",[
    P("Collect the posters, scan them, and print a set for every student — that becomes the shared evidence booklet the class can study from before the CAT. The personal quote-hunt sheet is theirs to keep and bring into the sitting.")])
];

const table=new Table({columnWidths:[LABW,CONW],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
  rows});

const kids=[table];
const doc=new Document({styles:{default:{document:{run:{font:"Calibri",size:22,color:INK}}}},
  sections:[{properties:{page:{size:{width:PW,height:PH},
    margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:kids}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);console.log('written '+OUT);});
