const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,HeightRule,AlignmentType}=require('docx');

/* Two ways to assess the same skill, on the shape the 2025 and 2026 tasks
   use: a title, the task in a paragraph, name and date, the structure to
   help you, then the rubric at the end of the same document. The rubric
   rows are the school's Learning Continuum substrands in its own single-year
   levels; the grade is the average across the rows. The EAL rubric is the
   ELC analytical writing one, C2 to C4. */

const A4W=11906, A4H=16838, MARG=720;
const PW=A4W-MARG*2, LW=A4H-MARG*2;
const GREY="D9D9D9", MID="E7E6E6";
const SH={idea:"D6EAFC",verb:"FAE3CF",ev:"FFF3B0",eff:"DFF0E2",plain:"F1EDE3"};
const PALE={idea:"EAF4FD",verb:"FDF1E7",ev:"FFF9DC",eff:"EFF7F0",plain:"FFFFFF"};
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const RULE={style:BorderStyle.SINGLE,size:6,color:"808080"};

const T=(t,o={})=>new TextRun({text:t,font:"Arial",size:24,...o});
const P=(t,o={})=>new Paragraph({spacing:{after:o.after===undefined?120:o.after},
  children:[T(t,o)]});
const HEAD=(t)=>new Paragraph({spacing:{before:220,after:80},children:[T(t,{bold:true,size:26})]});
const num=(n,bold,rest)=>new Paragraph({spacing:{after:100},indent:{left:400,hanging:400},
  children:[T(n+".\t",{bold:true}),T(bold,{bold:true}),T(rest?"  "+rest:"")]});
const dot=(t)=>new Paragraph({spacing:{after:80},indent:{left:400,hanging:220},children:[T("•\t"+t)]});
const gap=(a=0)=>new Paragraph({spacing:{after:a},children:[T("")]});
const line=(label,w)=>[T(label,{bold:true}),T("  "+"_".repeat(w)+"    ")];

function titleBlock(task,strand,cat){
  return [
    new Paragraph({spacing:{after:0},children:[T("The Bone Sparrow",{bold:true,size:40})]}),
    new Paragraph({spacing:{after:0},children:[T(task,{size:32})]}),
    new Paragraph({spacing:{after:0},children:[T(strand,{size:24,color:"595959"})]}),
    new Paragraph({spacing:{after:200},children:[T(cat,{bold:true,size:24,color:"595959"})]}),
    new Paragraph({spacing:{after:260},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:"808080"}},
      children:[...line("Name:",34),...line("Due date:",22)]})
  ];
}

/* ---------------------------------------------------------------- rubric
   Rows are the school's Learning Continuum substrands, English tab; the
   cells are its wording, verbatim, in the continuum's own single-year
   levels. Each row is marked at a level and the levels are averaged, which
   is where the half levels on a report come from. */
const BANDS=["Level 5","Level 6","Level 7","Level 8","Level 9"];
const ROWS=[
 ["idea","Interpreting texts","the idea about the novel","Reading and Viewing",
  "I can describe the purpose of different text types",
  "I can describe the way authors try to influence their audience",
  "I can explain how the structure and language used in a text helps influence the audience",
  "I can find the author\u2019s point of view in a text and evaluate how credible the text is",
  "I can compare the way people and issues are represented in different texts"],
 ["ev","Using evidence","choosing the quote, and putting it in the sentence","Reading and Viewing · Writing",
  "I can describe the depiction of events, characters and settings in texts and explain my responses to them",
  "I can select specific details from texts to develop and explain my own responses. I can include quotes in an explanation with teacher guidance",
  "I can select and use evidence from texts to explain my response to it. I can explain the relevance of a quote",
  "I can select evidence from texts to describe how authors depict events, situations, and people from different viewpoints. I can embed quotes into sentences",
  "I can select evidence from texts to explain how language choices influence an audience. I can correctly embed quotes within an explanation sentence"],
 ["eff","Evaluating texts","the effect on the reader, and the verb that carries it","Reading and Viewing",
  "I can use metalanguage to discuss the effect of texts on the reader",
  "I can describe how repetition, emphasis and metaphor can influence the way a reader feels",
  "I can use examples from the text to discuss how language helps to create character",
  "I can explain how different types of evidence can add authority to a text",
  "I can explain how a text explores issues that relate to our own lives"],
 ["plain","Text structure and organisation","the shape of the paragraph","Writing",
  "I can change the focus of a sentence by modifying the subject",
  "I can avoid repetition by changing the participants in a follow-on idea",
  "I can write a paragraph for informative and narrative texts",
  "I can sequence ideas relating to a topic within a given structure",
  "I can sequence ideas to present a clear argument"]
];
const CRITW=3000, BANDW=Math.floor((LW-CRITW)/5);
const rc=(kids,w,o)=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:70,bottom:70,left:90,right:90},...(o||{}),children:kids});
const small=(t,o={})=>new Paragraph({spacing:{after:0},children:[T(t,{size:17,...o})]});
function rubric(){
  return new Table({columnWidths:[CRITW,BANDW,BANDW,BANDW,BANDW,BANDW],
    width:{size:LW,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({tableHeader:true,children:[
        rc([small("Criteria",{bold:true,size:18})],CRITW,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}}),
        ...BANDS.map((lv,i)=>rc([small(lv,{bold:true,size:18})],BANDW,
          {shading:{type:ShadingType.CLEAR,fill:i===2?MID:GREY,color:"auto"}}))]}),
      ...ROWS.map(r=>new TableRow({children:[
        rc([small(r[1],{bold:true,size:18}),small(r[2],{size:16,color:"595959"}),
            small(r[3],{size:14,color:"808080"})],CRITW,
          {shading:{type:ShadingType.CLEAR,fill:SH[r[0]],color:"auto"}}),
        ...r.slice(4).map(d=>rc([small(d)],BANDW,
          {shading:{type:ShadingType.CLEAR,fill:PALE[r[0]],color:"auto"}}))]}))]});
}

/* the EAL rubric: the ELC analytical writing rubric, C2 to C4, the way the
   2026 tasks carry theirs \u2014 a plain table at the end of the same document */
const EAL_BANDS=["C2","C3","C4"];
const EAL_ROWS=[
 ["idea","Ideas & Themes",
  "Recognises what happens in the text. Retells key details with little interpretation.",
  "Explains basic feelings or ideas suggested by the text. Begins linking choices to simple themes.",
  "Connects specific language choices to themes or concepts. Explains what the creator might be saying."],
 ["ev","Evidence & Metalanguage",
  "Gives a simple quote or description from the text.",
  "Names a language feature and begins linking it to meaning.",
  "Uses terminology accurately with short, embedded evidence."],
 ["plain","Language & Structure",
  "Writes short, simple sentences using mostly literal verbs (\u201cshows\u201d, \u201cuses\u201d).",
  "Expands sentences with connectives such as because, so, or to. Uses basic evaluative words.",
  "Uses more complex sentences and analytical verbs (\u201csuggests\u201d, \u201chighlights\u201d)."],
 ["eff","Purpose & Interpretation",
  "Identifies the basic meaning or message.",
  "Explains the effect on the reader.",
  "Makes inferences about the creator\u2019s intent or perspective."]
];
function ealRubric(){
  const BW=Math.floor((PW-CRITW)/3);
  return new Table({columnWidths:[CRITW,BW,BW,BW],width:{size:PW,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({tableHeader:true,children:[
        rc([small("",{bold:true,size:18})],CRITW,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}}),
        ...EAL_BANDS.map(b=>rc([small(b,{bold:true,size:18})],BW,
          {shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}}))]}),
      ...EAL_ROWS.map(r=>new TableRow({children:[
        rc([small(r[1],{bold:true,size:18})],CRITW,{shading:{type:ShadingType.CLEAR,fill:SH[r[0]],color:"auto"}}),
        ...r.slice(2).map(d=>rc([small(d)],BW,{shading:{type:ShadingType.CLEAR,fill:PALE[r[0]],color:"auto"}}))]}))]});
}
const rubricPage=(name)=>[
  new Paragraph({spacing:{after:60},children:[T(name,{bold:true,size:28})]}),
  new Paragraph({spacing:{after:160},children:[T("RUBRIC",{bold:true,size:24,color:"595959"}),
    T("        "),...line("Name:",30)]}),
  rubric(),
  new Paragraph({spacing:{before:140},children:[
    T("Mark each row at the level the writing shows. The grade is the average across the rows, which is where the half levels come from. ",{size:18}),
    T("Wording quoted from the Learning Continuum master sheet, English tab.",{size:18,italics:true,color:"595959"})]}),
  new Paragraph({spacing:{before:160},children:[T("Comment:",{bold:true,size:22})]}),
  new Paragraph({spacing:{before:120},children:[T("_".repeat(150),{size:20,color:"808080"})]}),
  new Paragraph({spacing:{before:120},children:[T("_".repeat(150),{size:20,color:"808080"})]})
];
const ealPage=()=>[
  new Paragraph({spacing:{after:160},children:[T("Rubric \u00b7 EAL",{bold:true,size:28}),
    T("        "),...line("Name:",30)]}),
  ealRubric(),
  new Paragraph({spacing:{before:120},children:[
    T("For students on the EAL pathway, in place of the continuum rubric.",{size:18,color:"595959"})]}),
  new Paragraph({spacing:{before:160},children:[T("Comment:",{bold:true,size:22})]}),
  new Paragraph({spacing:{before:120},children:[T("_".repeat(96),{size:20,color:"808080"})]}),
  new Paragraph({spacing:{before:120},children:[T("_".repeat(96),{size:20,color:"808080"})]})
];

/* the shape the 2025 and 2026 tasks use: a title, the task in a paragraph,
   name and date, the structure to help you, and the rubric at the end */
const title=(t)=>new Paragraph({spacing:{after:160},children:[T(t,{bold:true,size:32})]});
const nameLine=()=>new Paragraph({spacing:{before:120,after:240},children:[...line("Name:",30),...line("Due date:",16)]});
const STRUCTURE=[
  HEAD("You can use this structure to help you:"),
  new Paragraph({spacing:{after:40},children:[T("Introduction",{bold:true})]}),
  dot("The big idea sentence is written for you"),
  dot("Add the ideas your paragraphs will be about"),
  new Paragraph({spacing:{before:80,after:40},children:[T("Body paragraphs",{bold:true})]}),
  dot("Each paragraph is about one idea"),
  dot("Use TEEL — topic sentence, evidence, explanation, link"),
  dot("Put the quote inside a sentence of your own"),
  dot("Explain what Fraillon’s writing does to the reader, not what happens in the story"),
  new Paragraph({spacing:{before:80,after:40},children:[T("Conclusion",{bold:true})]}),
  dot("Put your ideas back together — no new quotes")
];
const NEED=(items)=>[HEAD("You will need:"),...items.map(dot)];

/* ---------------------------------------------------------------- A */
const A_SHEET=[
  title("The Bone Sparrow — Analytical Paragraph Writing (folio)"),
  P("Write three folio pieces about The Bone Sparrow, one in each of three lessons. Each one is written in 30 minutes, under test conditions, on a prompt you are given at the start. The booklet gives you the model paragraph and starts the introduction for you. You write one paragraph of your own, and a second if you get there. Your teacher gives you feedback between the tasks, and you choose which task is marked."),
  nameLine(),
  ...NEED(["Your copy of the novel","Your own notes","The analytical writing wall"]),
  ...STRUCTURE,
  new Paragraph({spacing:{after:0},children:[new PageBreak()]}),
  HEAD("Folio cover sheet"),
  P("Staple this page to the front of the three booklets."),
  new Table({columnWidths:[900,PW-900-2600,2600],width:{size:PW,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({children:[
        rc([small("IN",{bold:true,size:18})],900,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}}),
        rc([small("TASK",{bold:true,size:18})],PW-900-2600,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}}),
        rc([small("MARK THIS ONE",{bold:true,size:18})],2600,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}})]}),
      ...["Task 1","Task 2","Task 3"]
        .map(t=>new TableRow({height:{value:620,rule:HeightRule.ATLEAST},children:[
          rc([gap()],900), rc([new Paragraph({spacing:{after:0},children:[T(t)]})],PW-900-2600), rc([gap()],2600)]}))]}),
  HEAD("Before you hand it in:"),
  dot("Read your paragraphs out loud. Does every sentence say something about the idea?"),
  dot("Check each last sentence links back to the idea and says more than the first one did.")
];
/* ---------------------------------------------------------------- B */
const B_SHEET=[
  title("The Bone Sparrow — Analytical Paragraph Writing"),
  P("In one period, write a response to a prompt about The Bone Sparrow. The prompt is given at the start of the period. The model paragraph is printed for you and the introduction and conclusion are started. You write two paragraphs of your own, under test conditions, and finish the introduction and conclusion."),
  nameLine(),
  ...NEED(["Your copy of the novel","One page of your own notes, prepared in the lesson before","The analytical writing wall"]),
  ...STRUCTURE,
  HEAD("Before you hand it in:"),
  dot("Read your paragraphs out loud. Does every sentence say something about the idea?"),
  dot("Check each last sentence links back to the idea and says more than the first one did.")
];
/* ---------------------------------------------------------------- build */
const portrait={page:{size:{width:A4W,height:A4H},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}};
/* docx swaps the dimensions itself for a landscape page, so these stay portrait */
const landscape={page:{size:{width:A4W,height:A4H,orientation:"landscape"},
  margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}};
function build(sheet,name,out){
  const doc=new Document({styles:{default:{document:{run:{font:"Arial",size:24,color:"000000"}}}},
    sections:[
      {properties:portrait,children:sheet},
      {properties:landscape,children:rubricPage(name)},
      {properties:portrait,children:ealPage()}]});
  return Packer.toBuffer(doc).then(b=>{fs.writeFileSync(out,b);console.log('written '+out);});
}
build(A_SHEET,"The Bone Sparrow — Analytical Paragraph Writing (folio)",
      'BoneSparrow-assessment-folio.docx')
 .then(()=>build(B_SHEET,"The Bone Sparrow — Analytical Paragraph Writing",
      'BoneSparrow-assessment-response.docx'));
