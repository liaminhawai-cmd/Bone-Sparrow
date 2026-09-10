const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,HeightRule,AlignmentType,LineRuleType}=require('docx');

/* Lincoln's task, with the changes from the reply: no workbook in the room,
   the plainer wording where the metalanguage has not been taught, the
   sentence stems kept for prompt 1 and faded by prompt 3, a self-reflection
   page, and the rubric without the support wording. The whole thing appears
   twice, once under each colour scheme, so the team can pick. */
const OUT=process.argv[2]||'BoneSparrow-CAT-draft.docx';

const FONT="Aptos Narrow";
const INK="000000", MUTED="595959", LINE="BFBFBF";
const HEAD="8C072D", HEAD_TX="FFFFFF", TINT="F2D0DA", GREY="F2F2F2";
const RULE={style:BorderStyle.SINGLE,size:6,color:"808080"};
const FAINT={style:BorderStyle.SINGLE,size:4,color:LINE};

/* scheme A: the unit's, by what each phrase does */
const A={idea:["0B447C","D6EAFC"],verb:["8A4B12","FAE3CF"],ev:["7A5A00","FFF3B0"],eff:["1F5C33","DFF0E2"]};
const A_KEY=[["idea","idea"],["verb","verb"],["ev","evidence"],["eff","purpose"]];
/* scheme B: by the job each sentence does, one band a sentence */
const B={T:["6B0F1A","F2D0DA"],E1:["3F3F3F","E8E8E8"],E2:["3F3F3F","DAD6E6"],L:["1F4E5F","D9EEF3"]};
const B_KEY=[["T","topic sentence"],["E1","explanation with evidence"],["E2","second explanation"],["L","link sentence"]];

const T=(t,o={})=>new TextRun({text:t,font:FONT,size:22,color:INK,...o});
const P=(runs,o={})=>new Paragraph({spacing:{after:o.after===undefined?100:o.after,line:o.line},
  children:Array.isArray(runs)?runs:[T(runs)]});
const H1=t=>new Paragraph({spacing:{after:40},children:[T(t,{bold:true,size:36,color:HEAD})]});
const H2=t=>new Paragraph({spacing:{before:200,after:80},children:[T(t,{bold:true,size:26})]});
const dot=(runs)=>new Paragraph({spacing:{after:50},indent:{left:360,hanging:220},
  children:[T("•\t"),...(Array.isArray(runs)?runs:[T(runs)])]});
const br=()=>new Paragraph({spacing:{after:0},children:[new PageBreak()]});
const hl=(k,t,S)=>T(t,{bold:true,color:S[k][0],shading:{type:ShadingType.CLEAR,fill:S[k][1]}});

const PW=11906, PH=16838, MARG=720, W=PW-MARG*2;
const cell=(kids,w,o={})=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:80,bottom:80,left:120,right:120},...o,children:kids});

/* -------------------------------------------------------- page 1: overview */
const band=(t)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
  rows:[new TableRow({children:[cell([P([T(t,{bold:true,color:HEAD_TX})],{after:0})],W,
    {shading:{type:ShadingType.CLEAR,fill:HEAD,color:"auto"}})]})]});
const kv=(rows)=>new Table({columnWidths:[2400,W-2400],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
  rows:rows.map(([k,v])=>new TableRow({children:[
    cell([P([T(k,{bold:true})],{after:0})],2400,{shading:{type:ShadingType.CLEAR,fill:TINT,color:"auto"}}),
    cell([P(v,{after:0})],W-2400)]}))});

const OVERVIEW=[
  H1("Analytic Paragraph Writing"),
  P([T("Summative Assessment Task — Year 7 English",{bold:true})],{after:20}),
  P([T("Text: "),T("The Bone Sparrow",{italics:true}),T(" by Zana Fraillon")],{after:160}),
  band("Task overview"),
  kv([
    ["Task type","Analytic paragraph — written response to a literary text"],
    ["Format","One paragraph (approximately 150–200 words). A second paragraph if you get there."],
    ["Conditions","Test conditions. On your table: a copy of the text, a dictionary, your quote-hunt sheet, one page of your own notes. No pre-written paragraphs or essays. No devices."],
    ["Time","10 minutes planning + 40 minutes writing"],
    ["Resources permitted","The text; a dictionary; your quote-hunt sheet; one page of notes. Nothing else."]]),
  H2("What you need to do"),
  P("Choose ONE of the prompts. The introduction and the first paragraph are written for you. Write the next paragraph."),
  P([T("Your paragraph must include:",{bold:true})],{after:40}),
  dot("A topic sentence that makes a clear claim about an idea in the novel"),
  dot("At least one quotation or specific detail from the text, with the page number"),
  dot("The quotation embedded in a sentence of your own, not dropped in on its own line"),
  dot("At least one sentence that explains what Fraillon's writing does — the effect, not just the event"),
  dot("A link sentence that comes back to your claim"),
  dot("Third person, present tense, formal words"),
  H2("Reminders"),
  dot([T("Write about the author's choices — what Fraillon "),T("does",{italics:true}),T(" and why — not just what happens in the story.")]),
  dot("Name the technique if you can (symbolism, imagery, contrast, narrative voice)."),
  dot("TEEL: topic sentence → evidence → explanation → link."),
  dot("Before you finish: third person? present tense? quote embedded? capitals and full stops?"),
  H2("Two versions in this document"),
  P("The same task appears twice below with different colour coding on the model paragraph and the self-check. Version A colours phrases by what they do (idea, verb, evidence, purpose). Version B colours whole sentences by the job they do in the paragraph (topic sentence, explanation with evidence, second explanation, link).")
];

/* -------------------------------------------------------- the writing frames */
const ruled=n=>Array.from({length:n},()=>new Paragraph({spacing:{before:230,after:0},
  border:{bottom:{style:BorderStyle.SINGLE,size:4,color:LINE}},children:[T("",{size:22})]}));
const stems=(list)=>list.map(s=>new Paragraph({spacing:{after:0},children:[T(s,{italics:true,color:MUTED,size:20})]}));

/* label | stems then lines */
const frame=(rows)=>new Table({columnWidths:[2300,W-2300],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:FAINT,insideV:FAINT},
  rows:rows.map(([lab,st,n,fill])=>new TableRow({children:[
    cell([P([T(lab,{bold:true})],{after:0})],2300,{shading:{type:ShadingType.CLEAR,fill:fill||TINT,color:"auto"}}),
    cell([...stems(st||[]),...ruled(n)],W-2300)]}))});

const linesBlock=(title,n)=>[
  H2(title),
  new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:FAINT,insideV:FAINT},
    rows:[new TableRow({children:[cell(ruled(n),W)]})]})];

/* the paragraph-2 frame, with or without stems, coloured per scheme */
function p2frame(scheme,st){
  const S = scheme==="A" ? null : B;
  const f = k => S ? S[k][1] : TINT;
  return frame([
    ["Topic sentence", st?st[0]:[], 4, f("T")],
    ["Explanation with evidence", st?st[1]:[], 5, f("E1")],
    ["A second explanation", st?st[2]:[], 5, f("E2")],
    ["Link sentence", st?st[3]:[], 4, f("L")]]);
}

/* -------------------------------------------------------- Lincoln's prompts */
const KEYROW=(scheme)=>new Paragraph({spacing:{after:140},children:
  (scheme==="A"?A_KEY:B_KEY).flatMap(([k,t])=>[hl(k,"  "+t+"  ",scheme==="A"?A:B),T("   ")])});

/* the model paragraph for prompt 1, marked up both ways.
   Iliya is the novel's spelling; "recognise" is the print edition's. */
const P1_SENT=[
 ["T",[["idea","The bone sparrow necklace is an object that keeps the characters connected to their past"],["p","."]]],
 ["E1",[["p","In Jimmie’s story, Mirka gives Oto the necklace so that the sparrow will "],["ev","“recognise Anka’s soul” (p. 117)"],["p",", which "],["verb","shows"],["p"," that "],["idea","an object can carry a person’s story after they are gone"],["p","."]]],
 ["E2",[["p","Subhi’s coin works the same way: Queeny tells him that "],["ev","“all [his] treasures … were Ba’s” (p. 215)"],["p",", which "],["verb","shows"],["p"," that "],["idea","the things Subhi keeps are his only link to a father he has never met"],["p","."]]],
 ["L",[["p","Through these objects, Fraillon "],["verb","suggests"],["p"," that "],["idea","who you are can be passed down in what people leave behind"],["p",", and that is what "],["eff","helps Subhi and Jimmie to "],["ev","“find each other” (p. 117)"],["p","."]]]
];
const INTRO1=[["p","In The Bone Sparrow, Zana Fraillon "],["verb","shows"],["p"," that "],["idea","people can hold on to who they are even when they have lost their home"],["p",". Subhi has never been outside the detention centre, but the objects he keeps, the stories he is told and the family around him keep him connected to where he comes from. Fraillon "],["verb","suggests"],["p"," that "],["idea","a person’s identity cannot be locked up with them"],["p",": it is carried in the things they hold and the stories they tell."]];
const INTRO2=[["p","In The Bone Sparrow, Zana Fraillon "],["verb","presents"],["p"," "],["idea","freedom and confinement not simply as physical states, but as experiences that shape how people understand themselves and the world around them"],["p",". Through Subhi, who has never set foot outside the detention centre, and Jimmie, who moves freely but carries her own grief and loss, Fraillon "],["verb","complicates"],["p"," the idea that freedom and confinement are opposites. Fraillon "],["verb","suggests"],["p"," that "],["idea","while physical confinement can be imposed upon a person’s body, the imagination and the connections between people offer a kind of freedom that cannot be taken away"],["p","."]];

function runsA(segs){ return segs.map(([k,t])=>k==="p"?T(t):hl(k,t,A)); }
function modelA(segs){ return P(runsA(segs),{line:360}); }
function modelB(sents){ /* one tinted paragraph a sentence */
  return sents.map(([k,segs])=>new Paragraph({spacing:{after:60,line:360},
    shading:{type:ShadingType.CLEAR,fill:B[k][1]},
    children:[T(segs.map(s=>s[1]).join(""))]}));
}
const plainP=(segs)=>P(segs.map(s=>s[1]).join(""),{line:360});

const CALLOUT_INTRO="Names the text and the author, states the essay’s main idea, introduces the character and context, and finishes with the contention — the essay’s answer to the prompt.";
const CALLOUT_P1="Topic sentence states the claim. Two explanations, each with the evidence embedded in the sentence. The link explains how both support the claim.";

const box=(kids,fill)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
  rows:[new TableRow({children:[cell(kids,W,fill?{shading:{type:ShadingType.CLEAR,fill,color:"auto"}}:{})]})]});
const note=t=>P([T(t,{italics:true,color:MUTED,size:20})],{after:80});

function prompt1(scheme){
  return [
    band("PROMPT 1  —  Symbolism and identity"),
    P([T("How does Fraillon show that stories and objects help the characters hold on to who they are?",{bold:true})],{after:60}),
    note("Thinking springboard: the bone sparrow necklace and who it has belonged to; Subhi’s treasures; Jimmie’s book; Maá’s stories; Eli’s whale."),
    P("The introduction and the first paragraph are written for you. Finish the second paragraph using the sentence starters."),
    H2("Introduction"), note(CALLOUT_INTRO),
    box([scheme==="A"?modelA(INTRO1):plainP(INTRO1)],GREY),
    H2("Paragraph 1"), note(CALLOUT_P1),
    box(scheme==="A"?[modelA(P1_SENT.flatMap(s=>s[1]))]:modelB(P1_SENT),GREY),
    H2("Paragraph 2"),
    P("The introduction names three things that keep the characters connected: objects, stories, and family. Paragraph 1 is objects, so paragraph 2 is stories or family."),
    P([T("I will write about:  ",{bold:true}),T("☐ memories kept alive through storytelling     ☐ culture kept alive through family bonds")]),
    br(),
    p2frame(scheme,[
      ["Fraillon also presents …","In addition to objects, Fraillon shows that …","Through the relationships between Subhi, Queeny and Maá, Fraillon also shows that …"],
      ["Maá’s “Listen Now” stories explore …","Through Maá’s “Listen Now” stories, Fraillon demonstrates …","Queeny’s care for Subhi shows that …","The relationship between Subhi and his Maá highlights …"],
      ["The stories in Jimmie’s book suggest that …","Like Maá, Eli also shares stories that explore …","Even though Eli and Subhi aren’t related, they are like family, suggesting that …"],
      ["Through these family bonds, Fraillon suggests that …","In both cases, the motif of storytelling highlights …","Together with objects, __________ demonstrates that …"]]),
    br(),
    ...linesBlock("Stretch yourself: Paragraph 3",22)
  ];
}
function prompt2(scheme){
  return [
    br(),
    band("PROMPT 2  —  Contrast and freedom"),
    P([T("How does Fraillon explore the relationship between freedom and confinement in The Bone Sparrow?",{bold:true})],{after:60}),
    note("Thinking springboard: the contrast between inside and outside the fence, between Subhi’s physical confinement and his imaginative life, or between Subhi’s world and Jimmie’s. Think of the objects that symbolise freedom and imprisonment."),
    P("The introduction is written for you and the first paragraph is started. You must write a second paragraph."),
    H2("Introduction"), note(CALLOUT_INTRO),
    box([scheme==="A"?modelA(INTRO2):plainP(INTRO2)],GREY),
    H2("Paragraph 1"), note(CALLOUT_P1),
    p2frame(scheme,[
      ["Fraillon uses the fence as …"],
      ["For Subhi, the fence symbolises …"],
      ["On the other side of the fence, Jimmie experiences the freedom …"],
      ["By placing the two protagonists on opposite sides of the fence, Fraillon illustrates …"]]),
    br(),
    H2("Paragraph 2"),
    P("The introduction names three claims: how fences separate the detained from the free, how Subhi copes with his confinement, and how Jimmie experiences freedom. Paragraph 1 is the fence, so paragraph 2 is Subhi or Jimmie."),
    P([T("I will write about:  ",{bold:true}),T("☐ how Subhi deals with being confined     ☐ how Jimmie is free, but confined in other ways")]),
    p2frame(scheme,null),
    br(),
    ...linesBlock("Stretch yourself: Paragraph 3",22)
  ];
}
function prompt3(scheme){
  return [
    br(),
    band("PROMPT 3  —  Motif and storytelling"),
    P([T("How does Fraillon explore the idea that stories are a form of survival in The Bone Sparrow?",{bold:true})],{after:60}),
    note("Thinking springboard: Queeny’s role as a storyteller, Jimmie’s family book, and what Fraillon suggests about the function of stories for people who have been displaced or silenced."),
    P("Sentence starters for the introduction. Complete the introduction, then write an analytic paragraph."),
    H2("Introduction"), note(CALLOUT_INTRO),
    frame([["Introduction",["In The Bone Sparrow, Zana Fraillon presents storytelling as …","Through the stories …","the notebook …","and Subhi’s own …","Fraillon shows …","Ultimately, Fraillon suggests that …"],8,GREY]]),
    H2("Paragraph 1"),
    p2frame(scheme,null),
    br(),
    ...linesBlock("Stretch yourself: Paragraph 3",22)
  ];
}

/* -------------------------------------------------------- self reflection */
const SELF_A=[["idea","My idea","I said something about the novel, not just what happens."],
  ["verb","My verb","I used a verb that does the thinking — shows, reveals, suggests."],
  ["ev","My evidence","My quote sits inside my own sentence, with the page number."],
  ["eff","The effect","I explained what Fraillon’s writing does to the reader."],
  ["idea","My paragraph","It starts with my claim, and the last sentence links back and says more."]];
const SELF_B=[["T","Topic sentence","My first sentence makes a clear claim about an idea."],
  ["E1","Explanation with evidence","My quote is embedded in my own sentence, with the page number."],
  ["E2","Second explanation","I explained what the language does, not just what happens."],
  ["L","Link sentence","My last sentence shows how both explanations support the claim."],
  ["L","Register","Third person, present tense, formal words."]];
function selfPage(scheme){
  const S=scheme==="A"?A:B, rows=scheme==="A"?SELF_A:SELF_B;
  const NW=2800,BW=1100,DW=W-NW-BW*3;
  const th=t=>P([T(t,{bold:true,size:17,color:MUTED})],{after:0});
  return [
    br(),
    H1("How did it go?"),
    P("Tick one box in each row for the paragraph you wrote.",{after:120}),
    new Table({columnWidths:[NW,DW,BW,BW,BW],width:{size:W,type:WidthType.DXA},
      borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
      rows:[
        new TableRow({children:[cell([th("")],NW),cell([th("")],DW),cell([th("NOT YET")],BW),cell([th("NEARLY")],BW),cell([th("YES")],BW)]}),
        ...rows.map(([k,n,d])=>new TableRow({height:{value:620,rule:HeightRule.ATLEAST},children:[
          cell([P([T(n,{bold:true,color:S[k][0]})],{after:0})],NW,{shading:{type:ShadingType.CLEAR,fill:S[k][1],color:"auto"}}),
          cell([P(d,{after:0})],DW),cell([P("")],BW),cell([P("")],BW),cell([P("")],BW)]}))]}),
    H2("One thing I will do better next time"),
    box([...ruled(3)]),
    H2("Teacher feedback"),
    box([...ruled(5)])
  ];
}

/* -------------------------------------------------------- rubric (landscape) */
const LW=PH-MARG*2;
const BANDS=["Needs support","5","6","7","8","9"];
const ROWS=[
 ["idea","Ideas",
  "I need support to identify and explain ideas and issues within the text",
  "I can identify parts of the story that relate to key ideas (imprisonment, loneliness, stories, etc)",
  "I can describe characters and events that relate to key ideas",
  "I can describe the ideas and issues that are illustrated through characters and events",
  "I can explain the way that ideas and issues are represented by characters and events",
  "I can analyse the way different people and perspectives are represented in the story"],
 ["eff","Analysing language",
  "I need help understanding the language used by the author",
  "I can identify different perspectives in the story",
  "I can describe language features, perspectives and non-literal ideas from the story",
  "I can describe the meaning of language and literary features that create characterisation and tone",
  "I can explain how language and literary devices create setting, characterisation and tone",
  "I can analyse how language features and non-literal language work together to explore ideas"],
 ["ev","Collecting evidence",
  "I need help using evidence from the text",
  "I can refer to parts of the text in my response",
  "I can include details from the text in my response",
  "I can use details from the text to demonstrate my ideas",
  "I can embed details from the text to support my interpretation",
  "I can use a range of complex sentence structures to embed different types of evidence"],
 ["verb","Word choice",
  "I need help using tier-2 words in my response",
  "I can use tier-2 words in my response",
  "I can use formal and objective words in my response",
  "I can use appropriate tier-3 words to describe literary features",
  "I can select a formal vocabulary appropriate to essay writing",
  "I can use tier-2 and tier-3 words with the correct nuance"],
 ["plain","Building a paragraph",
  "I need help putting my ideas into a paragraph",
  "I can write a few sentences about one idea",
  "I can write a paragraph that starts with my idea",
  "I can write a paragraph that stays on one idea and links back to it at the end",
  "I can sequence the parts of my paragraph so each one builds on the last",
  "I can sequence my paragraphs so that my ideas build into one argument"]
];
const RC={idea:A.idea[1],eff:A.eff[1],ev:A.ev[1],verb:A.verb[1],plain:"F1EDE3"};
function rubric(){
  const CW=2400, BW=Math.floor((LW-CW)/6);
  const sm=(t,o={})=>P([T(t,{size:17,...o})],{after:0});
  return [
    P([T("Assessment rubric",{bold:true,size:28})],{after:60}),
    P([T("Mark each row at the level the writing shows. The grade is the average across the rows.",{size:18,color:MUTED})],{after:120}),
    new Table({columnWidths:[CW,...Array(6).fill(BW)],width:{size:LW,type:WidthType.DXA},
      borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
      rows:[
        new TableRow({tableHeader:true,children:[cell([sm("")],CW,{shading:{type:ShadingType.CLEAR,fill:"D9D9D9",color:"auto"}}),
          ...BANDS.map((b,i)=>cell([sm(b,{bold:true,italics:i===0})],BW,{shading:{type:ShadingType.CLEAR,fill:i===3?"E7E6E6":"D9D9D9",color:"auto"}}))]}),
        ...ROWS.map(r=>new TableRow({children:[
          cell([sm(r[1],{bold:true,size:18})],CW,{shading:{type:ShadingType.CLEAR,fill:RC[r[0]],color:"auto"}}),
          ...r.slice(2).map((d,i)=>cell([sm(d,{italics:i===0})],BW,{shading:{type:ShadingType.CLEAR,fill:i===3?"F7F7F7":"FFFFFF",color:"auto"}}))]}))]})
  ];
}

/* -------------------------------------------------------- assemble */
const version=(scheme,title)=>[
  br(),
  H1(title),
  KEYROW(scheme),
  ...prompt1(scheme),...prompt2(scheme),...prompt3(scheme),
  ...selfPage(scheme)
];
const portrait={page:{size:{width:PW,height:PH},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}};
const landscape={page:{size:{width:PW,height:PH,orientation:"landscape"},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}};

const doc=new Document({styles:{default:{document:{run:{font:FONT,size:22,color:INK}}}},
  sections:[
    {properties:portrait,children:[
      ...OVERVIEW,
      ...version("A","Version A — idea · verb · evidence · purpose"),
      ...version("B","Version B — one colour a sentence")]},
    {properties:landscape,children:rubric()}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);console.log('written '+OUT);});
