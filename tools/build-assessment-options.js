const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,HeightRule,AlignmentType}=require('docx');

/* Two ways to assess the same skill, written on the department's own CAT
   pattern: task sheet (Task / Purpose / Audience / Time / You must / Options)
   then the rubric in landscape, five bands from Emerging to Well Above.
   The rubric rows are the school's Learning Continuum substrands, in its own
   single-year levels; the grade is the average across the rows. */

const A4W=11906, A4H=16838, MARG=720;
const PW=A4W-MARG*2, LW=A4H-MARG*2;
const GREY="D9D9D9", MID="E7E6E6";
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
const BANDS=[["Level 5","Emerging"],["Level 6","Working towards"],["Level 7","At the standard"],
             ["Level 8","Above"],["Level 9","Well above"]];
const ROWS=[
 ["Interpreting texts","the idea about the novel","Reading and Viewing",
  "I can describe the purpose of different text types",
  "I can describe the way authors try to influence their audience",
  "I can explain how the structure and language used in a text helps influence the audience",
  "I can find the author\u2019s point of view in a text and evaluate how credible the text is",
  "I can compare the way people and issues are represented in different texts"],
 ["Using evidence","choosing the quote","Reading and Viewing",
  "I can describe the depiction of events, characters and settings in texts and explain my responses to them",
  "I can select specific details from texts to develop and explain my own responses",
  "I can select and use evidence from texts to explain my response to it, recognising that texts reflect different viewpoints",
  "I can select evidence from texts to describe how authors depict events, situations, and people from different viewpoints",
  "I can select evidence from texts to explain how language choices influence an audience"],
 ["Use of evidence","putting the quote in the sentence","Writing",
  "Not on the continuum at this level",
  "I can include quotes in an explanation with teacher guidance",
  "I can explain the relevance of a quote",
  "I can embed quotes into sentences",
  "I can correctly embed quotes within an explanation sentence"],
 ["Evaluating texts","the effect on the reader","Reading and Viewing",
  "I can use metalanguage to discuss the effect of texts on the reader",
  "I can describe how repetition, emphasis and metaphor can influence the way a reader feels",
  "I can use examples from the text to discuss how language helps to create character",
  "I can explain how different types of evidence can add authority to a text",
  "I can explain how a text explores issues that relate to our own lives"],
 ["Text structure and organisation","the shape of the paragraph","Writing",
  "I can change the focus of a sentence by modifying the subject",
  "I can avoid repetition by changing the participants in a follow-on idea",
  "I can write a paragraph for informative and narrative texts",
  "I can sequence ideas relating to a topic within a given structure",
  "I can sequence ideas to present a clear argument"],
 ["Voice and register","the analytical verb, and how formal it sounds","Writing",
  "I can write using the correct relevant tense",
  "I can use different types of verbs in my writing (existing, doing, thinking, feeling)",
  "I can change my choice of words to be appropriate for spoken and written texts",
  "I can change my word choice to alter the tone of written and spoken texts",
  "I can write using a formal register"],
 ["Spelling and punctuation","control of the writing","Writing",
  "I can correctly spell common homophones. I can use apostrophes to show possession",
  "I can use common prefixes, suffixes and base words to spell new words. I can correctly use commas and full stops between clauses",
  "I can use spelling rules and word origins to spell new words. I can correctly punctuate complex sentences and circumstantial phrases",
  "I can remember and use the correct spelling of new subject-related words. I can use colons, semicolons, dashes and brackets in my writing",
  "I can develop precise and persuasive texts with accurate spelling. I can use punctuation, layout and font for different audience and purpose"]
];
const CRITW=3000, BANDW=Math.floor((LW-CRITW)/5);
const rc=(kids,w,o)=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:60,bottom:60,left:90,right:90},...(o||{}),children:kids});
const small=(t,o={})=>new Paragraph({spacing:{after:0},children:[T(t,{size:16,...o})]});
function rubric(){
  return new Table({columnWidths:[CRITW,BANDW,BANDW,BANDW,BANDW,BANDW],
    width:{size:LW,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({tableHeader:true,children:[
        rc([small("Criteria",{bold:true,size:18})],CRITW,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}}),
        ...BANDS.map(([lv,band],i)=>rc([small(lv+(i===2?" \u00b7 expected at Year 7":""),{bold:true,size:18}),
          small(band,{size:15,color:"595959"})],BANDW,
          {shading:{type:ShadingType.CLEAR,fill:i===2?MID:GREY,color:"auto"}}))]}),
      ...ROWS.map(r=>new TableRow({children:[
        rc([small(r[0],{bold:true,size:17}),small(r[1],{size:15,color:"595959"}),
            small(r[2],{size:14,color:"808080"})],CRITW),
        ...r.slice(3).map((d,i)=>rc([small(d)],BANDW,
          i===2?{shading:{type:ShadingType.CLEAR,fill:"F2F2F2",color:"auto"}}:{}))]}))]});
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

const RUBRIC_LINE=P("Use the attached rubric to ensure that you are meeting the expected criteria.",{italics:true});
const COMMON_MUST=[
 ["Use the TEEL structure.","Topic sentence, evidence, explanation, link. Your last sentence must say more than your first one did."],
 ["Embed your evidence.","The quote goes inside a sentence of your own. Do not leave it sitting on its own line."],
 ["Write about the writing, not the story.","Your reader has read the novel. Explain what Fraillon’s writing does to them."],
 ["Check your paragraph before you hand it in.","Colour the parts: idea, evidence, analytical verb, effect. If a part is missing, write it in."]
];

/* ---------------------------------------------------------------- A */
const A_PROMPTS=[
 ["Lesson 1","The Bone Sparrow shows us that imagination and friendship are essential for survival.",
  "The imagination paragraph is written together as a class. You write the friendship paragraph."],
 ["Lesson 2","In The Bone Sparrow, power comes in many forms. Discuss.",
  "The class brainstorms the kinds of power. The paragraph on the Jackets is modelled. You write about a second kind."],
 ["Lesson 3","How does Fraillon make the reader see the people behind the numbers?",
  "The class agrees or disagrees with the ways she does it. You write about one you argued for."]
];
const A_SHEET=[
  ...titleBlock("Analytical Paragraph Writing — Folio","Reading and Viewing","CAT 2 · Option A"),
  HEAD("Task:"),
  P("Over three lessons you will write three analytical paragraphs about The Bone Sparrow, one for each of the prompts below. At the end you choose one of them to be marked."),
  HEAD("Purpose:"),
  P("To explain an idea in the novel, and show how Fraillon’s writing puts that idea in front of the reader."),
  HEAD("Audience:"),
  P("Your teacher, and a reader who has already read the novel. You do not need to retell the story."),
  HEAD("Length:"),
  P("One paragraph for each prompt. About five to eight sentences each."),
  HEAD("Conditions:"),
  dot("Written in class, one lesson for each paragraph."),
  dot("You may use your novel, your notes and the analytical writing wall."),
  dot("A modelled paragraph on the same prompt stays on the page while you write."),
  HEAD("You must:"),
  num(1,"Write a paragraph for each of the three prompts.","Each lesson gives you the model and a frame for your own."),
  num(2,"Choose the paragraph you want marked.","Tick it on the cover sheet. If you do not choose one, the last paragraph is marked."),
  ...COMMON_MUST.map((m,i)=>num(i+3,m[0],m[1])),
  gap(80), RUBRIC_LINE,
  new Paragraph({spacing:{after:0},children:[new PageBreak()]}),
  new Paragraph({spacing:{after:200},children:[T("Prompts",{bold:true,size:32})]}),
  ...A_PROMPTS.flatMap(([lesson,prompt,note])=>[
    new Paragraph({spacing:{after:40},children:[T(lesson,{bold:true,color:"595959"})]}),
    new Paragraph({spacing:{after:60},children:[T(prompt,{size:26})]}),
    P(note,{size:22,color:"595959",after:220})]),
  HEAD("Folio cover sheet"),
  P("Staple this page to the front of your three paragraphs."),
  new Table({columnWidths:[900,PW-900-2600,2600],width:{size:PW,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({children:[
        rc([small("IN",{bold:true,size:18})],900,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}}),
        rc([small("PARAGRAPH",{bold:true,size:18})],PW-900-2600,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}}),
        rc([small("MARK THIS ONE",{bold:true,size:18})],2600,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}})]}),
      ...["1 · imagination and friendship","2 · kinds of power","3 · the people behind the numbers"]
        .map(t=>new TableRow({height:{value:620,rule:HeightRule.ATLEAST},children:[
          rc([gap()],900), rc([new Paragraph({spacing:{after:0},children:[T(t)]})],PW-900-2600), rc([gap()],2600)]}))]}),
  HEAD("Before you hand it in"),
  dot("Read your chosen paragraph out loud. Does every sentence say something about the idea?"),
  dot("Colour the parts: idea, evidence, analytical verb, effect. Is anything missing?"),
  dot("Check the last sentence links both halves back to your idea.")
];
const A_NOTES=[
  new Paragraph({spacing:{after:120},children:[T("Teacher notes — Option A",{bold:true,size:28})]}),
  HEAD("What is marked"),
  P("The paragraph the student nominates. The other two stay in the folio as evidence of progress and are not marked separately. No nomination: the last paragraph is marked."),
  HEAD("Differentiation"),
  dot("Support — the topic sentence and the analytical verb are printed; the evidence and explanation are theirs."),
  dot("EAL — word list first, shorter sentences, one sentence per line in the frame."),
  dot("Extension — TEEAL, two evidence sentences, and a second paragraph on a different idea."),
  HEAD("Where the criteria come from"),
  P("Every row is a substrand of the Learning Continuum master sheet, English tab, and every cell is its wording, unaltered, at that level. Six of the seven rows are what the analytical writing wall already teaches; Text structure and organisation is the row the wall does not cover, because the wall is a ladder of sentences and this task asks for a paragraph."),
  HEAD("What this task does not assess"),
  P("Building an essay argument — a contention, three claims and a conclusion that follows from them. That has not been taught this unit.")
];

/* ---------------------------------------------------------------- B */
const B_PROMPTS=[
 "The Bone Sparrow shows us that imagination and friendship are essential for survival.",
 "In The Bone Sparrow, power comes in many forms. Discuss.",
 "Explore how loneliness and friendship shape the lives of the characters in The Bone Sparrow.",
 "What does The Bone Sparrow show about the importance of stories and family?",
 "How does Fraillon make the reader care about the people in the camp?",
 "How does Fraillon show the reader what life in the camp is like?"
];
const B_SHEET=[
  ...titleBlock("Analytical Paragraph Writing — Text Response","Reading and Viewing","CAT 2 · Option B"),
  HEAD("Task:"),
  P("You will be given one prompt on the day and write about The Bone Sparrow: an introduction, one or two body paragraphs, and a conclusion. One body paragraph is printed on your paper. The paragraph you write yourself is the one that is marked."),
  HEAD("Purpose:"),
  P("To explain an idea in the novel, and show how Fraillon’s writing puts that idea in front of the reader."),
  HEAD("Audience:"),
  P("Your teacher, and a reader who has already read the novel. You do not need to retell the story."),
  HEAD("Time:"),
  dot("One period to prepare your notes."),
  dot("One period to write. You will be told when there are ten minutes left."),
  HEAD("Conditions:"),
  dot("You may bring one page of notes: ideas and quotes with chapter numbers."),
  dot("You may use your novel and the analytical writing wall."),
  dot("The introduction and conclusion are started for you."),
  dot("Your teacher will not help you draft during the writing period."),
  HEAD("You must:"),
  num(1,"Prepare notes on all six prompts.","The prompt you are given will be one of them. Use the planning sheet: what three paragraphs could be about, and one piece of evidence for each."),
  num(2,"Write your own body paragraph.","Extension: write two, on different ideas."),
  ...COMMON_MUST.map((m,i)=>num(i+3,m[0],m[1])),
  gap(80), RUBRIC_LINE,
  new Paragraph({spacing:{after:0},children:[new PageBreak()]}),
  new Paragraph({spacing:{after:80},children:[T("Prompts",{bold:true,size:32})]}),
  P("Prepare for all six. One of them will be the prompt on the day.",{color:"595959",after:200}),
  ...B_PROMPTS.map((p,i)=>new Paragraph({spacing:{after:180},indent:{left:400,hanging:400},
    children:[T((i+1)+".\t",{bold:true}),T(p,{size:26})]})),
  HEAD("Before you hand it in"),
  dot("Read your paragraph out loud. Does every sentence say something about the idea?"),
  dot("Colour the parts: idea, evidence, analytical verb, effect. Is anything missing?"),
  dot("Check the last sentence links both halves back to your idea.")
];
const B_NOTES=[
  new Paragraph({spacing:{after:120},children:[T("Teacher notes — Option B",{bold:true,size:28})]}),
  HEAD("What is marked"),
  P("The body paragraph, or paragraphs, the student writes. The introduction and conclusion are read for whether they answer the prompt and are not marked against the rubric."),
  HEAD("Differentiation"),
  dot("Support — bigger print, one paragraph only, with a theme and a quote to choose from on the page."),
  dot("EAL — word list first, shorter sentences, one sentence per line in the frame."),
  dot("Extension — the printed paragraph gives only the topic and link sentences; the evidence sentences are theirs, and they write a second paragraph."),
  HEAD("Where the criteria come from"),
  P("Every row is a substrand of the Learning Continuum master sheet, English tab, and every cell is its wording, unaltered, at that level. Six of the seven rows are what the analytical writing wall already teaches; Text structure and organisation is the row the wall does not cover, because the wall is a ladder of sentences and this task asks for a paragraph."),
  HEAD("What this task does not assess"),
  P("Building an essay argument — a contention, three claims and a conclusion that follows from them. That has not been taught this unit, which is why the introduction and conclusion are started for the students and are not marked against the rubric.")
];

/* ---------------------------------------------------------------- build */
const portrait={page:{size:{width:A4W,height:A4H},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}};
/* docx swaps the dimensions itself for a landscape page, so these stay portrait */
const landscape={page:{size:{width:A4W,height:A4H,orientation:"landscape"},
  margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}};
function build(sheet,notes,name,out){
  const doc=new Document({styles:{default:{document:{run:{font:"Arial",size:24,color:"000000"}}}},
    sections:[
      {properties:portrait,children:sheet},
      {properties:landscape,children:rubricPage(name)},
      {properties:portrait,children:notes}]});
  return Packer.toBuffer(doc).then(b=>{fs.writeFileSync(out,b);console.log('written '+out);});
}
build(A_SHEET,A_NOTES,"The Bone Sparrow — Analytical Paragraph Writing · Option A (folio)",
      'BoneSparrow-assessment-folio.docx')
 .then(()=>build(B_SHEET,B_NOTES,"The Bone Sparrow — Analytical Paragraph Writing · Option B (text response)",
      'BoneSparrow-assessment-response.docx'));
