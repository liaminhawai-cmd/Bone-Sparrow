const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,HeightRule}=require('docx');

/* Two full sets of the same three folio tasks, one under each class's colour
   coding. Same prompts, same models, same shape: the KHS task sheet at the
   front; then for each task the prompt and introduction, the model paragraph
   on a leaf of its own with a blank back so it can be left out, a scaffolded
   second paragraph, a lined third, and self reflection. Rubric at the back.
   Quotations are cited by chapter and were checked against the novel. */

const SCHEMES={
  /* Lincoln's class: the grammar of the sentence, as font colour */
  grammar:{ file:'BoneSparrow-CAT-folio-grammar.docx',
    key:[["S","subject"],["V","verb"],["O","object"],["PP","prepositional phrase"]],
    col:{S:"C00000",V:"3B7D23",O:"C04F15",PP:"0070C0"}, fill:null,
    self:[["S","My subject","The subject of my topic sentence is the idea, a character or the text."],
          ["V","My verbs","My verbs are analytical — shows, suggests, reveals — not just is and does."],
          ["O","My quote","My quote is inside my own sentence, with the chapter."],
          ["PP","My link","My last sentence comes back to the claim."]] },
  /* the other class: what each phrase does, as shading */
  ideas:{ file:'BoneSparrow-CAT-folio-ideas.docx',
    key:[["idea","idea"],["verb","verb"],["ev","evidence"],["eff","purpose"]],
    col:{idea:"0B447C",verb:"8A4B12",ev:"7A5A00",eff:"1F5C33"},
    fill:{idea:"D6EAFC",verb:"FAE3CF",ev:"FFF3B0",eff:"DFF0E2"},
    self:[["idea","My idea","I said something about the novel, not just what happens."],
          ["verb","My verb","I used a verb that does the thinking — shows, reveals, suggests."],
          ["ev","My evidence","My quote sits inside my own sentence, with the chapter."],
          ["eff","The effect","I explained what Fraillon’s writing does to the reader."]] }
};

const FONT="Aptos Narrow";
const INK="000000", MUTED="595959", LINE="BFBFBF";
const HEAD="8C072D", HEAD_TX="FFFFFF", TINT="F2D0DA", GREY="F2F2F2";
const RULE={style:BorderStyle.SINGLE,size:6,color:"808080"};
const FAINT={style:BorderStyle.SINGLE,size:4,color:LINE};
const PW=11906, PH=16838, MARG=720, W=PW-MARG*2;

const T=(t,o={})=>new TextRun({text:t,font:FONT,size:22,color:INK,...o});
const MODEL_SIZE=24;
const P=(runs,o={})=>new Paragraph({spacing:{after:o.after===undefined?100:o.after,line:o.line},
  children:Array.isArray(runs)?runs:[T(runs)]});
const H1=t=>new Paragraph({spacing:{after:40},children:[T(t,{bold:true,size:36,color:HEAD})]});
const H2=t=>new Paragraph({spacing:{before:160,after:60},children:[T(t,{bold:true,size:25})]});
const dot=(runs)=>new Paragraph({spacing:{after:50},indent:{left:360,hanging:220},
  children:[T("•\t"),...(Array.isArray(runs)?runs:[T(runs)])]});
const br=()=>new Paragraph({spacing:{after:0},children:[new PageBreak()]});
const note=t=>P([T(t,{italics:true,color:MUTED,size:20})],{after:80});
const cell=(kids,w,o={})=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:80,bottom:80,left:120,right:120},...o,children:kids});
const band=(t)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
  rows:[new TableRow({children:[cell([P([T(t,{bold:true,color:HEAD_TX})],{after:0})],W,
    {shading:{type:ShadingType.CLEAR,fill:HEAD,color:"auto"}})]})]});
const box=(kids,fill)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
  rows:[new TableRow({children:[cell(kids,W,fill?{shading:{type:ShadingType.CLEAR,fill,color:"auto"}}:{})]})]});
const ruled=n=>Array.from({length:n},()=>new Paragraph({spacing:{before:230,after:0},
  border:{bottom:{style:BorderStyle.SINGLE,size:4,color:LINE}},children:[T("",{size:22})]}));
const stems=list=>list.map(s=>new Paragraph({spacing:{after:0},children:[T(s,{italics:true,color:MUTED,size:20})]}));
const frame=(rows)=>new Table({columnWidths:[2300,W-2300],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:FAINT,insideV:FAINT},
  rows:rows.map(([lab,st,n])=>new TableRow({children:[
    cell([P([T(lab,{bold:true})],{after:0})],2300,{shading:{type:ShadingType.CLEAR,fill:TINT,color:"auto"}}),
    cell([...stems(st||[]),...ruled(n)],W-2300)]}))});

/* a marked-up sentence: [kind,text] pairs; "p" is plain. Each scheme has its
   own markup of the same words. */
function runs(segs,S,size=22){
  return segs.map(([k,t])=>k==="p"?T(t,{size}):
    S.fill ? T(t,{bold:true,size,color:S.col[k],shading:{type:ShadingType.CLEAR,fill:S.fill[k]}})
           : T(t,{bold:true,size,color:S.col[k]}));
}
const keyRow=(S)=>new Paragraph({spacing:{after:140},children:S.key.flatMap(([k,t])=>[
  ...runs([[k,"  "+t+"  "]],S),T("   ")])});

/* -------------------------------------------------------- the front sheet */
const kv=(rows)=>new Table({columnWidths:[2400,W-2400],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
  rows:rows.map(([k,v])=>new TableRow({children:[
    cell([P([T(k,{bold:true})],{after:0})],2400,{shading:{type:ShadingType.CLEAR,fill:TINT,color:"auto"}}),
    cell([P(v,{after:0})],W-2400)]}))});
const FRONT=[
  H1("Analytic Paragraph Writing"),
  P([T("Summative Assessment Task — Year 7 English",{bold:true})],{after:20}),
  P([T("Text: "),T("The Bone Sparrow",{italics:true}),T(" by Zana Fraillon")],{after:160}),
  band("Task overview"),
  kv([
    ["Task type","Analytic paragraph — written response to a literary text, as a folio of three"],
    ["Format","Three sittings, one prompt each. In each: one paragraph of your own (approximately 150–200 words), and a second if you get there."],
    ["Conditions","Test conditions. On your table: a copy of the text, a dictionary, your quote-hunt sheet, one page of your own notes. No pre-written paragraphs or essays. No devices."],
    ["Time","40 minutes a sitting"],
    ["What is marked","The paragraph you nominate on the folio cover. Feedback between sittings."]]),
  H2("What you need to do"),
  P("The introduction and the first paragraph are written for you. Write the next paragraph."),
  P([T("Your paragraph must include:",{bold:true})],{after:40}),
  dot("A topic sentence that makes a clear claim about an idea in the novel"),
  dot("At least one quotation or specific detail from the text, with the chapter"),
  dot("The quotation embedded in a sentence of your own, not dropped in on its own line"),
  dot("At least one sentence that explains what Fraillon’s writing does — the effect, not just the event"),
  dot("A link sentence that comes back to your claim"),
  dot("Third person, present tense, formal words"),
  H2("Reminders"),
  dot([T("Write about the author’s choices — what Fraillon "),T("does",{italics:true}),T(" and why — not just what happens in the story.")]),
  dot("Name the technique if you can (symbolism, imagery, contrast, narrative voice)."),
  dot("TEEL: topic sentence → evidence → explanation → link."),
  dot("Before you finish: third person? present tense? quote embedded? capitals and full stops?")
];

/* -------------------------------------------------------- the three tasks
   Each model sentence is given twice: g = grammar markup, i = ideas markup.
   Same words in both. */
const TASKS=[
{ n:1, band:"TASK 1  —  Symbolism and identity",
  prompt:"How does Fraillon show that stories and objects help the characters hold on to who they are?",
  spring:"the bone sparrow necklace and who it has belonged to; Subhi’s treasures; Jimmie’s book; Maá’s stories; Eli’s whale",
  intro:"In The Bone Sparrow, Zana Fraillon shows that people can hold on to who they are even when they have lost their home. Subhi has never been outside the detention centre, but the objects he keeps, the stories he is told and the family around him keep him connected to where he comes from. Fraillon suggests that a person’s identity cannot be locked up with them: it is carried in the things they hold and the stories they tell.",
  claims:"The introduction names three things that keep the characters connected: objects, stories, and family. Paragraph 1 is objects, so paragraph 2 is stories or family.",
  choose:["memories kept alive through storytelling","the family around Subhi"],
  model:[
   {g:[["S","The bone sparrow necklace"],["V"," is"],["O"," an object that keeps the characters connected to their past"],["p","."]],
    i:[["idea","The bone sparrow necklace is an object that keeps the characters connected to their past"],["p","."]]},
   {g:[["PP","In Jimmie’s story"],["p",", "],["S","Mirka"],["V"," gives"],["O"," Oto the necklace"],["p"," so that the sparrow will “recognise Anka’s soul” (ch. 17), which shows that an object can carry a person’s story after they are gone."]],
    i:[["p","In Jimmie’s story, Mirka gives Oto the necklace so that the sparrow will "],["ev","“recognise Anka’s soul” (ch. 17)"],["p",", which "],["verb","shows"],["p"," that "],["idea","an object can carry a person’s story after they are gone"],["p","."]]},
   {g:[["S","Subhi’s coin"],["V"," works"],["p"," the same way: "],["S","Queeny"],["V"," tells"],["O"," him"],["p"," that “all [his] treasures … were Ba’s” (ch. 34), which shows that the things Subhi keeps are his only link to a father he has never met."]],
    i:[["p","Subhi’s coin works the same way: Queeny tells him that "],["ev","“all [his] treasures … were Ba’s” (ch. 34)"],["p",", which "],["verb","shows"],["p"," that "],["idea","the things Subhi keeps are his only link to a father he has never met"],["p","."]]},
   {g:[["PP","Through these objects"],["p",", "],["S","Fraillon"],["V"," suggests"],["p"," that who you are can be passed down in what people leave behind, and that is what helps Subhi and Jimmie to “find each other” (ch. 17)."]],
    i:[["p","Through these objects, Fraillon "],["verb","suggests"],["p"," that "],["idea","who you are can be passed down in what people leave behind"],["p",", and that is what "],["eff","helps Subhi and Jimmie to "],["ev","“find each other” (ch. 17)"],["p","."]]}],
  stems:[["Fraillon also presents …","In addition to objects, Fraillon shows that …","Through the relationships between Subhi, Queeny and Maá, Fraillon also shows that …"],
         ["Maá’s “Listen Now” stories explore …","Through Maá’s “Listen Now” stories, Fraillon demonstrates …","Queeny’s care for Subhi shows that …"],
         ["The stories in Jimmie’s book suggest that …","Like Maá, Eli also shares stories that explore …","Even though Eli and Subhi aren’t related, they are like family, suggesting that …"],
         ["Through these family bonds, Fraillon suggests that …","In both cases, the motif of storytelling highlights …","Together with objects, __________ demonstrates that …"]] },

{ n:2, band:"TASK 2  —  Contrast and freedom",
  prompt:"How does Fraillon explore the relationship between freedom and confinement in The Bone Sparrow?",
  spring:"inside and outside the fence; Subhi’s body locked in and his imagination free; Subhi’s world and Jimmie’s; the objects that stand for freedom and for being locked up",
  intro:"In The Bone Sparrow, Zana Fraillon presents freedom and confinement not simply as physical states, but as experiences that shape how people understand themselves and the world around them. Through Subhi, who has never set foot outside the detention centre, and Jimmie, who moves freely but carries her own grief and loss, Fraillon complicates the idea that freedom and confinement are opposites. Fraillon suggests that while physical confinement can be imposed upon a person’s body, the imagination and the connections between people offer a kind of freedom that cannot be taken away.",
  claims:"The introduction names three claims: how the fence separates the detained from the free, how Subhi copes with his confinement, and how Jimmie experiences freedom. Paragraph 1 is the fence, so paragraph 2 is Subhi or Jimmie.",
  choose:["how Subhi deals with being confined","how Jimmie is free, but confined in other ways"],
  model:[
   {g:[["S","Fraillon"],["V"," uses"],["O"," the fence"],["p"," to show that being locked in also means being cut off from knowing what is outside."]],
    i:[["p","Fraillon uses the fence to "],["verb","show"],["p"," that "],["idea","being locked in also means being cut off from knowing what is outside"],["p","."]]},
   {g:[["S","Subhi"],["V"," admits"],["p"," that “none of us knows what it is like just on the other side of the fences” (ch. 14), which shows that the fence keeps out information as well as people."]],
    i:[["p","Subhi admits that "],["ev","“none of us knows what it is like just on the other side of the fences” (ch. 14)"],["p",", which "],["verb","shows"],["p"," that "],["idea","the fence keeps out information as well as people"],["p","."]]},
   {g:[["S","Jimmie"],["V"," is"],["O"," the one who brings the outside in"],["p",": “But Jimmie does” (ch. 14) is all Subhi needs to say, which shows that a friend from the other side is his only window on the world."]],
    i:[["p","Jimmie is the one who brings the outside in: "],["ev","“But Jimmie does” (ch. 14)"],["p"," is all Subhi needs to say, which "],["verb","shows"],["p"," that "],["idea","a friend from the other side is his only window on the world"],["p","."]]},
   {g:[["PP","By putting the two of them on opposite sides of the same fence"],["p",", "],["S","Fraillon"],["V"," suggests"],["p"," that freedom is not only where your body can go, but what you are allowed to know."]],
    i:[["p","By putting the two of them on opposite sides of the same fence, Fraillon "],["verb","suggests"],["p"," that "],["idea","freedom is not only where your body can go"],["p",", but "],["eff","what you are allowed to know"],["p","."]]}],
  stems:[["For Subhi, being locked in means …","Subhi copes with the fence by …","Even though Jimmie can leave, …"],
         ["When Subhi imagines the Night Sea, …","At night, “the dirt outside turns into a beautiful ocean” (ch. 1), which shows …","Jimmie’s house is quiet because …"],
         ["The Jackets …","Jimmie carries …","Eli’s stories give Subhi …"],
         ["So for Subhi, freedom is …","Jimmie shows that being free is not the same as …","Together, the two of them suggest that …"]] },

{ n:3, band:"TASK 3  —  Motif and storytelling",
  prompt:"How does Fraillon explore the idea that stories are a form of survival in The Bone Sparrow?",
  spring:"Maá’s Listen Now stories; Jimmie’s family book; the stories Subhi tells himself; what happens when the stories stop",
  intro:"In The Bone Sparrow, Zana Fraillon presents storytelling as the thing that keeps people going when nothing around them changes. Through the stories Maá tells, the book Jimmie carries and the stories Subhi tells himself, Fraillon shows that a story can do what food and shelter cannot: it can make a person feel brave, remembered and less alone. Fraillon suggests that for people who have been locked away, a story is not an escape from survival but a part of it.",
  claims:"The introduction names three kinds of story: Maá’s, Jimmie’s book, and Subhi’s own. Paragraph 1 is Maá’s stories and Jimmie’s book, so paragraph 2 is the stories Subhi tells himself, or what happens when the stories stop.",
  choose:["the stories Subhi tells himself","what happens when the stories stop"],
  model:[
   {g:[["S","Stories"],["V"," are"],["O"," how the characters in the centre keep going"],["p"," when nothing else changes."]],
    i:[["idea","Stories are how the characters in the centre keep going when nothing else changes"],["p","."]]},
   {g:[["S","Maá’s “Listen Now” stories"],["V"," are"],["O"," the thing Subhi remembers"],["p"," as “perfect. Each one” (ch. 5), which shows that a story can hold a family together in a place that gives them nothing."]],
    i:[["p","Maá’s “Listen Now” stories are the thing Subhi remembers as "],["ev","“perfect. Each one” (ch. 5)"],["p",", which "],["verb","shows"],["p"," that "],["idea","a story can hold a family together in a place that gives them nothing"],["p","."]]},
   {g:[["PP","When Jimmie brings her mother’s book"],["p",", "],["S","Subhi"],["V"," feels"],["O"," “a sort of brave that I haven’t felt since Eli got taken” (ch. 10)"],["p"," before he has read a word, which shows that a story changes how a person feels just by being there."]],
    i:[["p","When Jimmie brings her mother’s book, Subhi feels "],["ev","“a sort of brave that I haven’t felt since Eli got taken” (ch. 10)"],["p"," before he has read a word, which "],["verb","shows"],["p"," that "],["idea","a story changes how a person feels just by being there"],["p","."]]},
   {g:[["PP","Through these stories"],["p",", "],["S","Fraillon"],["V"," suggests"],["p"," that surviving the centre is about more than food and safety: it is about having something to hold on to."]],
    i:[["p","Through these stories, Fraillon "],["verb","suggests"],["p"," that "],["idea","surviving the centre is about more than food and safety"],["p",": it is about "],["eff","having something to hold on to"],["p","."]]}],
  stems:[["Subhi also tells stories to …","When Maá is too tired to tell a story, …","Fraillon shows what the stories are for by taking them away: …"],
         ["Subhi imagines …","When Maá says she is “too tired” (ch. 5), …","By the end, Subhi feels that “even my stories are gone” (ch. 32), which shows …"],
         ["Eli’s whale …","The Night Sea …","Without the stories, the centre …"],
         ["So stories are …","When the stories stop, …","Fraillon suggests that survival is …"]] }
];

/* -------------------------------------------------------- one task, one scheme */
function task(t,S){
  const g = S.fill ? "i" : "g";
  return [
    /* sheet one, front: the prompt, the introduction, paragraph 2 */
    br(),
    band(t.band),
    P([T(t.prompt,{bold:true})],{after:40}),
    P([T("Think about: "+t.spring+".",{italics:true,color:MUTED,size:19})],{after:80}),
    H2("Introduction"),
    box([P(t.intro,{line:300,after:0})],GREY),
    P(t.claims,{after:40}),
    P([T("I will write about:  ",{bold:true}),T("☐ "+t.choose[0]+"     ☐ "+t.choose[1])],{after:60}),
    H2("Paragraph 2"),
    frame([["Topic sentence",t.stems[0].slice(0,2),3],["Explanation with evidence",t.stems[1].slice(0,2),4],
           ["A second explanation",t.stems[2].slice(0,2),4],["Link sentence",t.stems[3].slice(0,2),3]]),
    /* sheet one, back: paragraph 3 and the self check */
    br(),
    H2("Paragraph 3"),
    new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
      borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:FAINT,insideV:FAINT},
      rows:[new TableRow({children:[cell(ruled(13),W)]})]}),
    ...selfPage(S),
    /* sheet two: the model, blank behind it, so it can be left out */
    br(),
    H2("Paragraph 1"),
    keyRow(S),
    box(t.model.map((s,i)=>new Paragraph({spacing:{after:i<3?160:0,line:460},children:runs(s[g],S,MODEL_SIZE)})),GREY),
    br(),
    new Paragraph({children:[T("")]})
  ];
}

function selfPage(S){
  const NW=2800,BW=1100,DW=W-NW-BW*3;
  const th=t=>P([T(t,{bold:true,size:17,color:MUTED})],{after:0});
  return [
    H2("How did it go?"),
    new Table({columnWidths:[NW,DW,BW,BW,BW],width:{size:W,type:WidthType.DXA},
      borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
      rows:[
        new TableRow({children:[cell([th("")],NW),cell([th("")],DW),cell([th("NOT YET")],BW),cell([th("NEARLY")],BW),cell([th("YES")],BW)]}),
        ...S.self.map(([k,n,d])=>new TableRow({height:{value:520,rule:HeightRule.ATLEAST},children:[
          cell([P([T(n,{bold:true,color:S.col[k]})],{after:0})],NW,
            S.fill?{shading:{type:ShadingType.CLEAR,fill:S.fill[k],color:"auto"}}:{}),
          cell([P(d,{after:0})],DW),cell([P("")],BW),cell([P("")],BW),cell([P("")],BW)]}))]}),
    H2("One thing I will do better next time"),
    box([...ruled(2)]),
    H2("Teacher feedback"),
    box([...ruled(3)])
  ];
}

/* -------------------------------------------------------- rubric (landscape) */
const LW=PH-MARG*2;
const BANDS=["Needs support","5","6","7","8","9"];
const ROWS=[
 ["D6EAFC","Ideas",
  "I need support to identify and explain ideas and issues within the text",
  "I can identify parts of the story that relate to key ideas (imprisonment, loneliness, stories, etc)",
  "I can describe characters and events that relate to key ideas",
  "I can describe the ideas and issues that are illustrated through characters and events",
  "I can explain the way that ideas and issues are represented by characters and events",
  "I can analyse the way different people and perspectives are represented in the story"],
 ["DFF0E2","Analysing language",
  "I need help understanding the language used by the author",
  "I can identify different perspectives in the story",
  "I can describe language features, perspectives and non-literal ideas from the story",
  "I can describe the meaning of language and literary features that create characterisation and tone",
  "I can explain how language and literary devices create setting, characterisation and tone",
  "I can analyse how language features and non-literal language work together to explore ideas"],
 ["FFF3B0","Collecting evidence",
  "I need help using evidence from the text",
  "I can refer to parts of the text in my response",
  "I can include details from the text in my response",
  "I can use details from the text to demonstrate my ideas",
  "I can embed details from the text to support my interpretation",
  "I can use a range of complex sentence structures to embed different types of evidence"],
 ["FAE3CF","Word choice",
  "I need help using tier-2 words in my response",
  "I can use tier-2 words in my response",
  "I can use formal and objective words in my response",
  "I can use appropriate tier-3 words to describe literary features",
  "I can select a formal vocabulary appropriate to essay writing",
  "I can use tier-2 and tier-3 words with the correct nuance"],
 ["F1EDE3","Building a paragraph",
  "I need help putting my ideas into a paragraph",
  "I can write a few sentences about one idea",
  "I can write a paragraph that starts with my idea",
  "I can write a paragraph that stays on one idea and links back to it at the end",
  "I can sequence the parts of my paragraph so each one builds on the last",
  "I can sequence my paragraphs so that my ideas build into one argument"]
];
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
          cell([sm(r[1],{bold:true,size:18})],CW,{shading:{type:ShadingType.CLEAR,fill:r[0],color:"auto"}}),
          ...r.slice(2).map((d,i)=>cell([sm(d,{italics:i===0})],BW,{shading:{type:ShadingType.CLEAR,fill:i===3?"F7F7F7":"FFFFFF",color:"auto"}}))]}))]})
  ];
}

/* -------------------------------------------------------- folio cover */
const COVER=[
  H2("Folio cover"),
  P([T("Name:  ",{bold:true}),T("______________________________     "),T("Class:  ",{bold:true}),T("__________")],{after:200}),
  new Table({columnWidths:[900,W-900-2600,2600],width:{size:W,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({children:[
        cell([P([T("IN",{bold:true,size:18})],{after:0})],900,{shading:{type:ShadingType.CLEAR,fill:"D9D9D9",color:"auto"}}),
        cell([P([T("TASK",{bold:true,size:18})],{after:0})],W-900-2600,{shading:{type:ShadingType.CLEAR,fill:"D9D9D9",color:"auto"}}),
        cell([P([T("MARK THIS ONE",{bold:true,size:18})],{after:0})],2600,{shading:{type:ShadingType.CLEAR,fill:"D9D9D9",color:"auto"}})]}),
      ...["Task 1 — Symbolism and identity","Task 2 — Contrast and freedom","Task 3 — Motif and storytelling"]
        .map(t=>new TableRow({height:{value:620,rule:HeightRule.ATLEAST},children:[
          cell([P("")],900),cell([P(t,{after:0})],W-900-2600),cell([P("")],2600)]}))]})
];

/* -------------------------------------------------------- build both */
const portrait={page:{size:{width:PW,height:PH},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}};
const landscape={page:{size:{width:PW,height:PH,orientation:"landscape"},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}};
async function build(S){
  const doc=new Document({styles:{default:{document:{run:{font:FONT,size:22,color:INK}}}},
    sections:[
      {properties:portrait,children:[...FRONT,...COVER,...TASKS.flatMap(t=>task(t,S))]},
      {properties:landscape,children:rubric()}]});
  const b=await Packer.toBuffer(doc); fs.writeFileSync(S.file,b); console.log('written '+S.file);
}
(async()=>{ for(const k of Object.keys(SCHEMES)) await build(SCHEMES[k]); })();
