const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,HeightRule}=require('docx');

/* Two ways to assess the same skill, written up so the team can put them side
   by side. The criteria block is identical in both: the five parts of an
   analytical sentence, quoted from the school's Learning Continuum, English
   tab, at the two rungs either side of the expected level. */

const C={idea:"0B447C",feat:"6B4E9E",verb:"8A4B12",ev:"7A5A00",eff:"1F5C33"};
const SH={idea:"D6EAFC",feat:"E8DFF6",verb:"FAE3CF",ev:"FFF3B0",eff:"DFF0E2"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";
const PW=11906, PH=16838, MARG=800, W=PW-MARG*2;
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const RULE={style:BorderStyle.SINGLE,size:6,color:LINE};

const R=(t,o)=>new TextRun({text:t,size:21,font:"Georgia",color:INK,...o});
const S=(t,o)=>new TextRun({text:t,size:19,font:"Calibri",color:INK,...o});
const cell=(kids,w,o)=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:70,bottom:70,left:120,right:120},...(o||{}),children:kids});
const blank=()=>new Paragraph({spacing:{after:0},children:[new TextRun({text:"",size:20})]});
const P=(t,o={})=>new Paragraph({spacing:{after:o.after===undefined?110:o.after},children:[R(t,o)]});
const Sp=(t,o={})=>new Paragraph({spacing:{after:o.after===undefined?90:o.after},children:[S(t,o)]});
const H=(t)=>new Paragraph({spacing:{before:220,after:90},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:DEEP}},
  children:[new TextRun({text:t,size:23,bold:true,color:DEEP,font:"Georgia"})]});
const bullet=(t)=>new Paragraph({spacing:{after:60},indent:{left:280,hanging:180},
  children:[S("•   ",{color:MUTED}),S(t)]});

/* the five parts, and the continuum either side of the expected level */
const CRIT=[
 ["idea","The idea",
  "I can describe the way authors try to influence their audience",
  "I can explain how the structure and language used in a text helps influence the audience",
  "I can find the author’s point of view in a text and evaluate how credible the text is"],
 ["feat","Language feature",
  "I can explain how rhymes can add to descriptions in writing",
  "I can explain the meaning of non-literal language in narrative and poetic texts",
  "I can explain the effect of descriptions, different sentence types and figurative language"],
 ["verb","Analytical verb",
  "I can use different types of verbs in my writing (existing, doing, thinking, feeling)",
  "I can change my choice of words to be appropriate for spoken and written texts",
  "I can change my word choice to alter the tone of written and spoken texts"],
 ["ev","Embedded evidence",
  "I can include quotes in an explanation with teacher guidance",
  "I can explain the relevance of a quote",
  "I can embed quotes into sentences"],
 ["eff","Effect on the reader",
  "I can describe how repetition, emphasis and metaphor can influence the way a reader feels",
  "I can use examples from the text to discuss how language helps to create character",
  "I can explain how different types of evidence can add authority to a text"]
];
const NAMEW=2100, LVW=Math.floor((W-NAMEW)/3);
function criteria(){
  const th=(t,strong)=>new Paragraph({spacing:{after:0},children:[
    new TextRun({text:t,size:17,bold:true,color:strong?DEEP:MUTED,font:"Calibri"})]});
  return new Table({columnWidths:[NAMEW,LVW,LVW,LVW],width:{size:W,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({tableHeader:true,height:{value:330,rule:HeightRule.ATLEAST},children:[
        cell([th("")],NAMEW),
        cell([th("LEVEL 6")],LVW),
        cell([th("LEVEL 7 · EXPECTED",true)],LVW,{shading:{type:ShadingType.CLEAR,fill:"F1EDE3",color:"auto"}}),
        cell([th("LEVEL 8")],LVW)]}),
      ...CRIT.map(([k,name,l6,l7,l8])=>new TableRow({children:[
        cell([new Paragraph({spacing:{after:0},children:[
          new TextRun({text:"  "+name+"  ",size:18,bold:true,color:C[k],font:"Calibri",
            shading:{type:ShadingType.CLEAR,fill:SH[k]}})]})],NAMEW),
        cell([new Paragraph({spacing:{after:0},children:[S(l6,{size:17,color:MUTED})]})],LVW),
        cell([new Paragraph({spacing:{after:0},children:[S(l7,{size:17})]})],LVW,
          {shading:{type:ShadingType.CLEAR,fill:"F1EDE3",color:"auto"}}),
        cell([new Paragraph({spacing:{after:0},children:[S(l8,{size:17,color:MUTED})]})],LVW)]}))]});
}


const BOXW=1500;
function marking(){
  const th=t=>new Paragraph({spacing:{after:0},children:[new TextRun({text:t,size:16,bold:true,color:MUTED,font:"Calibri"})]});
  const NW=2100, DW=W-NW-BOXW*3;
  return new Table({columnWidths:[NW,DW,BOXW,BOXW,BOXW],width:{size:W,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({tableHeader:true,height:{value:330,rule:HeightRule.ATLEAST},children:[
        cell([th("")],NW),cell([th("AT LEVEL 7")],DW),
        cell([th("NOT YET")],BOXW),cell([th("THERE")],BOXW),cell([th("BEYOND")],BOXW)]}),
      ...CRIT.map(([k,name,l6,l7])=>new TableRow({height:{value:480,rule:HeightRule.ATLEAST},children:[
        cell([new Paragraph({spacing:{after:0},children:[
          new TextRun({text:"  "+name+"  ",size:18,bold:true,color:C[k],font:"Calibri",
            shading:{type:ShadingType.CLEAR,fill:SH[k]}})]})],NW),
        cell([new Paragraph({spacing:{after:0},children:[S(l7,{size:17})]})],DW),
        cell([blank()],BOXW),cell([blank()],BOXW),cell([blank()],BOXW)]}))]});
}

function title(t,sub){
  return [new Paragraph({spacing:{after:40},children:[
      new TextRun({text:t,bold:true,size:30,color:DEEP,font:"Georgia"})]}),
    new Paragraph({spacing:{after:160},children:[S(sub,{color:MUTED})]})];
}
const LI=[
  H("Learning intention"),
  Sp("To write an analytical paragraph about The Bone Sparrow: an idea, evidence from the novel, an explanation of what the writing does, and a link back."),
  new Paragraph({spacing:{after:60},children:[S("I will be successful when:",{bold:true})]}),
  bullet("I can state an idea about the novel in a topic sentence."),
  bullet("I can choose a quote that shows that idea, and put it inside my own sentence."),
  bullet("I can explain what the writing does to the reader, not just what happens."),
  bullet("I can finish the paragraph by linking both parts back to my idea.")
];

/* ------------------------------------------------------------------ A */
const A=[
  ...title("The Bone Sparrow — assessment · option A","A folio of paragraphs, collected across three sessions"),
  H("The task"),
  P("Students write three analytical paragraphs, one in each of the three paragraph sessions. Each session gives them a prompt, a modelled paragraph on the same prompt, and a frame for one of their own."),
  bullet("Session 1 — “The Bone Sparrow shows us that imagination and friendship are essential for survival.” The imagination paragraph is co-constructed; they write the friendship one."),
  bullet("Session 2 — “In The Bone Sparrow, power comes in many forms. Discuss.” The class brainstorms the kinds of power; the Jackets paragraph is modelled; they write a second kind."),
  bullet("Session 3 — “How does Fraillon make the reader see the people behind the numbers?” The class agrees or disagrees with the ways she does it; they write about one they backed."),
  H("Conditions"),
  bullet("Written in class, one period each, on the session sheet."),
  bullet("Novel, notes and the writing wall available throughout."),
  bullet("The modelled paragraph stays on the page — they are writing beside it, not from memory."),
  H("What is marked"),
  P("The paragraph the student nominates on the cover sheet. The other two stay in the folio as evidence of progress, and are not marked separately."),
  Sp("If a student nominates nothing, the last paragraph is marked.",{color:MUTED}),
  H("Differentiation"),
  bullet("Support — more of the frame is printed: the topic sentence and the analytical verb are given, the evidence and explanation are theirs."),
  bullet("Extension — TEEAL. Two evidence sentences, and a second paragraph on a different idea."),
  bullet("EAL — word list first, shorter sentences, one sentence per line in the frame."),
  ...LI,
  new Paragraph({spacing:{after:0},children:[new PageBreak()]}),
  H("Criteria"),
  Sp("The school’s Learning Continuum, English tab. Level 7 is the expected level for Year 7.",{color:MUTED,after:120}),
  criteria(),
  new Paragraph({spacing:{after:0},children:[new PageBreak()]}),
  ...title("Folio cover sheet","One per student, stapled to the front"),
  new Paragraph({spacing:{after:200},children:[
    S("Name  ",{color:MUTED}),S("______________________________     ",{color:LINE}),
    S("Class  ",{color:MUTED}),S("____________",{color:LINE})]}),
  H("What is in the folio"),
  new Table({columnWidths:[900,W-900-2400,2400],width:{size:W,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({height:{value:330,rule:HeightRule.ATLEAST},children:[
        cell([new Paragraph({spacing:{after:0},children:[S("IN",{size:16,bold:true,color:MUTED})]})],900),
        cell([new Paragraph({spacing:{after:0},children:[S("PARAGRAPH",{size:16,bold:true,color:MUTED})]})],W-900-2400),
        cell([new Paragraph({spacing:{after:0},children:[S("MARK THIS ONE",{size:16,bold:true,color:MUTED})]})],2400)]}),
      ...["1 · imagination and friendship","2 · kinds of power","3 · what Fraillon does to the reader"]
        .map(t=>new TableRow({height:{value:620,rule:HeightRule.ATLEAST},children:[
          cell([blank()],900),
          cell([new Paragraph({spacing:{after:0},children:[R(t)]})],W-900-2400),
          cell([blank()],2400)]}))]}),
  H("Before you hand it in"),
  bullet("Read your nominated paragraph out loud. Does every sentence say something about the idea?"),
  bullet("Colour the parts: idea, evidence, analytical verb, effect. Is anything missing?"),
  bullet("Check the last sentence links both halves back to the idea, and says more than the first sentence did."),
  H("What your teacher is looking for"),
  marking()
];

/* ------------------------------------------------------------------ B */
const B=[
  ...title("The Bone Sparrow — assessment · option B","One text response, written over two periods"),
  H("The task"),
  P("Students are given a prompt on the day and write an introduction, one or two body paragraphs and a conclusion. One body paragraph is printed on the paper for them to work from, so what they are assessed on is the paragraph or paragraphs they write themselves."),
  H("Period one — preparation"),
  bullet("Students work through the planning sheet: six prompts, and for each one what three paragraphs could be about, with a piece of evidence each."),
  bullet("They keep one page of notes — ideas and quotes with chapter numbers — and take it into the writing period."),
  bullet("The prompt for the task is not revealed. It is one of the six they planned."),
  H("Period two — writing"),
  bullet("The prompt is given at the start of the period."),
  bullet("The introduction and conclusion are started for them, with gaps — the essay argument (a contention and three claims) has not been taught this unit, so it is not what they are being asked to produce."),
  bullet("One body paragraph is printed in full. Students write one more, or two for extension."),
  bullet("Novel, their notes page and the writing wall available. No drafting help from the teacher."),
  H("What is marked"),
  P("The body paragraph or paragraphs the student writes. The introduction and conclusion are read for whether they answer the prompt, and are not marked against the criteria."),
  H("Differentiation"),
  bullet("Support — bigger print, one paragraph only, with a theme and a quote to choose from on the page."),
  bullet("Extension — the printed paragraph gives only the topic and link sentences; the evidence sentences are theirs, and they write two more paragraphs."),
  bullet("EAL — word list first, shorter sentences, one sentence per line in the frame."),
  new Paragraph({spacing:{after:0},children:[new PageBreak()]}),
  ...LI,
  H("Criteria"),
  Sp("The school’s Learning Continuum, English tab. Level 7 is the expected level for Year 7.",{color:MUTED,after:120}),
  criteria(),
  H("What this task does not assess"),
  P("Building an essay argument — a contention, three claims, and a conclusion that follows from them. That has not been taught this unit. Students meet the shape of an essay in the paragraph sessions, and the introduction and conclusion on this paper are started for them for that reason. What is marked is the analytical paragraph.")
];

function build(kids,out){
  const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:21,color:INK}}}},
    sections:[{properties:{page:{size:{width:PW,height:PH},
      margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:kids}]});
  return Packer.toBuffer(doc).then(b=>{fs.writeFileSync(out,b);console.log('written '+out);});
}
build(A,'BoneSparrow-assessment-folio.docx').then(()=>build(B,'BoneSparrow-assessment-response.docx'));
