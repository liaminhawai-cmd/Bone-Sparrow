const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,LineRuleType,HeightRule}=require('docx');

/* The CAT folio on the folio-task layout: the KHS task sheet and folio cover
   at the front, then three tasks. Each task is two sheets. Sheet one: the
   prompt, the introduction and paragraph 2 in the TEEL frame on the front;
   paragraph 3 on lines and the self check on the back. Sheet two: the model
   paragraph (paragraph 1), coloured, with a blank back, so it can be left out
   of a booklet. Rubric at the back. Quotations are cited by chapter. */
const OUT='BoneSparrow-CAT-folio-ideas.docx';

/* ---------------------------------------------------- the folio-task look */
const C={idea:"0B447C",verb:"8A4B12",ev:"7A5A00",eff:"1F5C33"};
const SH={idea:"D6EAFC",verb:"FAE3CF",ev:"FFF3B0",eff:"DFF0E2"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";
const PW=11906, PH=16838, MARG=1000, W=PW-MARG*2;
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const RULE={style:BorderStyle.SINGLE,size:6,color:LINE};
const BOX={style:BorderStyle.SINGLE,size:8,color:DEEP};

const R=(t,o)=>new TextRun({text:t,size:22,font:"Georgia",color:INK,...o});
const P=(runs,o)=>new Paragraph({spacing:{after:120,...(o||{})},children:Array.isArray(runs)?runs:[R(runs)]});
const H=t=>new Paragraph({spacing:{before:260,after:80},children:[new TextRun({text:t,bold:true,size:24,color:DEEP,font:"Georgia"})]});
const note=t=>new Paragraph({spacing:{after:100},children:[new TextRun({text:t,size:18,color:MUTED,font:"Calibri"})]});
const box=(kids,fill)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:NONE,insideV:NONE},
  rows:[new TableRow({children:[new TableCell({width:{size:W,type:WidthType.DXA},
    shading:fill?{type:ShadingType.CLEAR,fill,color:"auto"}:undefined,
    margins:{top:140,bottom:140,left:200,right:200},children:kids})]})]});
const br=()=>new Paragraph({children:[new PageBreak()]});
const swatch=(k,t)=>new TextRun({text:"  "+t+"  ",size:20,bold:true,color:C[k],font:"Calibri",
  shading:{type:ShadingType.CLEAR,fill:SH[k]}});
const key=()=>new Paragraph({spacing:{after:160},children:[swatch("idea","idea"),R("   "),swatch("verb","verb"),
  R("   "),swatch("ev","evidence"),R("   "),swatch("eff","purpose")]});
const hl=(k,t)=>R(t,{bold:true,color:C[k],shading:{type:ShadingType.CLEAR,fill:SH[k]}});

const BARC={idea:"7FB3E6",verb:"F2B27A",ev:"F5D75A",eff:"8FD39A",plain:"D8CFBB"};
const mini=(segs)=>{const BW=560, tot=segs.reduce((a,x)=>a+x[1],0), cw=segs.map(x=>Math.floor(BW*x[1]/tot));
  return new Table({columnWidths:cw,width:{size:cw.reduce((a,b)=>a+b,0),type:WidthType.DXA},
    borders:{top:NONE,bottom:NONE,left:NONE,right:NONE,insideH:NONE,insideV:{style:BorderStyle.SINGLE,size:12,color:"FFFFFF"}},
    rows:[new TableRow({height:{value:160,rule:HeightRule.EXACT},children:segs.map((x,i)=>new TableCell({
      width:{size:cw[i],type:WidthType.DXA},shading:{type:ShadingType.CLEAR,fill:BARC[x[0]],color:"auto"},
      margins:{top:0,bottom:0,left:0,right:0},
      children:[new Paragraph({spacing:{after:0,line:120,lineRule:LineRuleType.EXACT},children:[new TextRun({text:"",size:6})]})]}))})]});};
const T_BAR=[["idea",1]], E_BAR=[["ev",3],["verb",1],["idea",3],["eff",3]], L_BAR=[["idea",2],["idea",2],["eff",3]];

const ruled=n=>Array.from({length:n},()=>new Paragraph({spacing:{before:200,after:0},
  border:{bottom:{style:BorderStyle.SINGLE,size:4,color:LINE}},children:[new TextRun({text:"",size:22})]}));

/* the frame: the letter with its bar, then the stems in grey, then the lines */
const frame=(rows)=>new Table({columnWidths:[760,W-760],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:RULE,insideV:RULE},
  rows:rows.map(([l,n,bar,stems])=>new TableRow({children:[
    new TableCell({width:{size:760,type:WidthType.DXA},margins:{top:120,bottom:120,left:120,right:40},
      children:[new Paragraph({spacing:{after:40},children:[new TextRun({text:l,bold:true,size:40,color:DEEP,font:"Georgia"})]}),...(bar?[mini(bar)]:[])]}),
    new TableCell({width:{size:W-760,type:WidthType.DXA},margins:{top:100,bottom:140,left:160,right:160},
      children:[...(stems||[]).map(s=>new Paragraph({spacing:{after:0},children:[new TextRun({text:s,size:17,
        color:MUTED,font:"Calibri",italics:true})]})),...ruled(n)]})]}))});

/* the same frame with the model already coloured in it */
const worked=(rows)=>new Table({columnWidths:[760,W-760],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:RULE,insideV:RULE},
  rows:rows.map(([l,segs,bar])=>new TableRow({children:[
    new TableCell({width:{size:760,type:WidthType.DXA},margins:{top:140,bottom:140,left:120,right:40},
      children:[new Paragraph({spacing:{after:40},children:[new TextRun({text:l,bold:true,size:40,color:DEEP,font:"Georgia"})]}),
        ...(bar?[mini(bar)]:[])]}),
    new TableCell({width:{size:W-760,type:WidthType.DXA},margins:{top:160,bottom:160,left:160,right:160},
      children:[new Paragraph({spacing:{after:0,line:400},children:segs.map(([k,t])=>
        k==="p"?R(t,{size:23}):R(t,{size:23,bold:true,color:C[k],shading:{type:ShadingType.CLEAR,fill:SH[k]}}))})]})]}))});

/* paragraph 3: lines only */
const lines=(n)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:NONE,insideV:NONE},
  rows:[new TableRow({children:[new TableCell({width:{size:W,type:WidthType.DXA},
    margins:{top:60,bottom:140,left:160,right:160},children:ruled(n)})]})]});

const SELF=[
 ["idea","My idea","I said something about the novel, not just what happens."],
 ["verb","My verb","I used a verb that does the thinking — shows, reveals, suggests."],
 ["ev","My evidence","My quote sits inside my own sentence, with the chapter."],
 ["eff","The effect","I explained what Fraillon’s writing does to the reader."],
 ["idea","My paragraph","It starts with my idea, and the last sentence links back and says more."]
];
function selfTable(){
  const NW=2600, BW=1100, DW=W-NW-BW*3;
  const th=t=>new Paragraph({spacing:{after:0},children:[new TextRun({text:t,bold:true,size:17,color:MUTED,font:"Calibri"})]});
  const c=(kids,w,o)=>new TableCell({width:{size:w,type:WidthType.DXA},margins:{top:80,bottom:80,left:120,right:120},...(o||{}),children:kids});
  return new Table({columnWidths:[NW,DW,BW,BW,BW],width:{size:W,type:WidthType.DXA},
    borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({children:[c([th("")],NW),c([th("")],DW),c([th("NOT YET")],BW),c([th("NEARLY")],BW),c([th("YES")],BW)]}),
      ...SELF.map(([k,n,d])=>new TableRow({height:{value:520,rule:HeightRule.ATLEAST},children:[
        c([new Paragraph({spacing:{after:0},children:[R(n,{bold:true,color:C[k]})]})],NW,
          {shading:{type:ShadingType.CLEAR,fill:SH[k],color:"auto"}}),
        c([new Paragraph({spacing:{after:0},children:[R(d,{size:20})]})],DW),
        c([P("")],BW),c([P("")],BW),c([P("")],BW)]}))]});
}
const openBox=(label,h)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:RULE,insideV:NONE},
  rows:[
    new TableRow({children:[new TableCell({width:{size:W,type:WidthType.DXA},margins:{top:100,bottom:100,left:200,right:200},
      shading:{type:ShadingType.CLEAR,fill:"F6F1E6",color:"auto"},
      children:[new Paragraph({spacing:{after:0},children:[new TextRun({text:label,bold:true,size:19,color:DEEP,font:"Calibri"})]})]})]}),
    new TableRow({height:{value:h,rule:HeightRule.ATLEAST},children:[new TableCell({width:{size:W,type:WidthType.DXA},
      margins:{top:100,bottom:100,left:200,right:200},children:[new Paragraph({children:[]})]})]})]});

/* ---------------------------------------------------- the KHS task sheet */
const KF="Aptos Narrow", HEAD="8C072D", TINT="F2D0DA", KRULE={style:BorderStyle.SINGLE,size:6,color:"808080"};
const KT=(t,o={})=>new TextRun({text:t,font:KF,size:22,color:"000000",...o});
const KP=(runs,o={})=>new Paragraph({spacing:{after:o.after===undefined?100:o.after},children:Array.isArray(runs)?runs:[KT(runs)]});
const H1=t=>new Paragraph({spacing:{after:40},children:[KT(t,{bold:true,size:36,color:HEAD})]});
const H2=t=>new Paragraph({spacing:{before:160,after:60},children:[KT(t,{bold:true,size:25})]});
const dot=(runs)=>new Paragraph({spacing:{after:50},indent:{left:360,hanging:220},children:[KT("•\t"),...(Array.isArray(runs)?runs:[KT(runs)])]});
const kcell=(kids,w,o={})=>new TableCell({width:{size:w,type:WidthType.DXA},margins:{top:80,bottom:80,left:120,right:120},...o,children:kids});
const band=(t)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:KRULE,bottom:KRULE,left:KRULE,right:KRULE,insideH:KRULE,insideV:KRULE},
  rows:[new TableRow({children:[kcell([KP([KT(t,{bold:true,color:"FFFFFF"})],{after:0})],W,{shading:{type:ShadingType.CLEAR,fill:HEAD,color:"auto"}})]})]});
const kv=(rows)=>new Table({columnWidths:[2400,W-2400],width:{size:W,type:WidthType.DXA},
  borders:{top:KRULE,bottom:KRULE,left:KRULE,right:KRULE,insideH:KRULE,insideV:KRULE},
  rows:rows.map(([k,v])=>new TableRow({children:[
    kcell([KP([KT(k,{bold:true})],{after:0})],2400,{shading:{type:ShadingType.CLEAR,fill:TINT,color:"auto"}}),
    kcell([KP(v,{after:0})],W-2400)]}))});
const FRONT=[
  H1("Analytic Paragraph Writing"),
  KP([KT("Summative Assessment Task — Year 7 English",{bold:true})],{after:20}),
  KP([KT("Text: "),KT("The Bone Sparrow",{italics:true}),KT(" by Zana Fraillon")],{after:160}),
  band("Task overview"),
  kv([
    ["Task type","Analytic paragraph — written response to a literary text, as a folio of three"],
    ["Format","Three sittings, one prompt each. In each: one paragraph of your own (approximately 150–200 words), and a second if you get there."],
    ["Conditions","Test conditions. On your table: a copy of the text, a dictionary, your quote-hunt sheet, one page of your own notes. No pre-written paragraphs or essays. No devices."],
    ["Time","40 minutes writing time + 10 minutes planning, each sitting"],
    ["What is marked","The paragraph you nominate on the folio cover. Feedback between sittings."]]),
  H2("What you need to do"),
  KP("The introduction and the first paragraph are written for you. Write the next paragraph."),
  KP([KT("Your paragraph must include:",{bold:true})],{after:40}),
  dot("A topic sentence that makes a clear claim about an idea in the novel"),
  dot("At least one quotation or specific detail from the text, with the chapter"),
  dot("The quotation embedded in a sentence of your own, not dropped in on its own line"),
  dot("At least one sentence that explains what Fraillon’s writing does — the effect, not just the event"),
  dot("A link sentence that comes back to your claim"),
  dot("Third person, present tense, formal words"),
  H2("Reminders"),
  dot([KT("Write about the author’s choices — what Fraillon "),KT("does",{italics:true}),KT(" and why — not just what happens in the story.")]),
  dot("Name the technique if you can (symbolism, imagery, contrast, narrative voice)."),
  dot("TEEL: topic sentence → evidence → explanation → link."),
  dot("Before you finish: third person? present tense? quote embedded? capitals and full stops?")
];
const COVER=[
  H2("Folio cover"),
  KP([KT("Name:  ",{bold:true}),KT("______________________________     "),KT("Class:  ",{bold:true}),KT("__________")],{after:200}),
  new Table({columnWidths:[900,W-900-2600,2600],width:{size:W,type:WidthType.DXA},
    borders:{top:KRULE,bottom:KRULE,left:KRULE,right:KRULE,insideH:KRULE,insideV:KRULE},
    rows:[
      new TableRow({children:[
        kcell([KP([KT("IN",{bold:true,size:18})],{after:0})],900,{shading:{type:ShadingType.CLEAR,fill:"D9D9D9",color:"auto"}}),
        kcell([KP([KT("TASK",{bold:true,size:18})],{after:0})],W-900-2600,{shading:{type:ShadingType.CLEAR,fill:"D9D9D9",color:"auto"}}),
        kcell([KP([KT("MARK THIS ONE",{bold:true,size:18})],{after:0})],2600,{shading:{type:ShadingType.CLEAR,fill:"D9D9D9",color:"auto"}})]}),
      ...["Task 1 — Symbolism and identity","Task 2 — Contrast and freedom","Task 3 — Motif and storytelling"]
        .map(t=>new TableRow({height:{value:620,rule:HeightRule.ATLEAST},children:[
          kcell([KP("")],900),kcell([KP(t,{after:0})],W-900-2600),kcell([KP("")],2600)]}))]})
];

/* ---------------------------------------------------- the three tasks */
const TASKS=[
{ n:1, title:"Symbolism and identity",
  prompt:[["How does Fraillon show that the "],["hl","objects"],[" the characters keep help them "],["hl","hold on to who they are"],["?"]],
  intro:"In The Bone Sparrow, Zana Fraillon shows that people can hold on to who they are even when they have lost their home. Subhi has never been outside the detention centre, but the objects he keeps and the family around him keep him connected to where he comes from. Fraillon suggests that a person’s identity cannot be locked up with them: it is carried in the things they hold and the people who hold on to them.",
  claims:"The introduction names two things that keep the characters connected: objects and family. Paragraph 1 is objects.",
  choose:["the family around Subhi","Jimmie’s family and what her mother left her"],
  model:[
   ["T",[["idea","The bone sparrow necklace is an object that keeps the characters connected to their past"],["p","."]],T_BAR],
   ["E",[["p","In Jimmie’s story, Mirka gives Oto the necklace so that the sparrow will "],["ev","“recognise Anka’s soul” (ch. 17)"],["p",", which "],["verb","shows"],["p"," that "],["idea","an object can carry a person’s story after they are gone"],["p","."]],E_BAR],
   ["E",[["p","Subhi’s coin works the same way: Queeny tells him that "],["ev","“all [his] treasures … were Ba’s” (ch. 34)"],["p",", which "],["verb","shows"],["p"," that "],["idea","the things Subhi keeps are his only link to a father he has never met"],["p","."]],E_BAR],
   ["L",[["p","Through these objects, Fraillon "],["verb","suggests"],["p"," that "],["idea","who you are can be passed down in what people leave behind"],["p",", and that is what "],["eff","helps Subhi and Jimmie to "],["ev","“find each other” (ch. 17)"],["p","."]],L_BAR]],
  stems:[["Through the relationships between Subhi, Queeny and Maá, Fraillon also shows that …"],
         ["Queeny’s care for Subhi shows that …"],
         ["Even though Eli and Subhi aren’t related, they are like family, suggesting that …"],
         ["Through these family bonds, Fraillon suggests that …"]] },

{ n:2, title:"Contrast and freedom",
  prompt:[["How does Fraillon explore the relationship between "],["hl","freedom"],[" and "],["hl","confinement"],[" in The Bone Sparrow?"]],
  intro:"In The Bone Sparrow, Zana Fraillon presents freedom and confinement not simply as physical states, but as experiences that shape how people understand themselves and the world around them. Through Subhi, who has never set foot outside the detention centre, and Jimmie, who moves freely but carries her own grief and loss, Fraillon complicates the idea that freedom and confinement are opposites. Fraillon suggests that while physical confinement can be imposed upon a person’s body, the imagination and the connections between people offer a kind of freedom that cannot be taken away.",
  claims:"The introduction names three claims: the fence between the detained and the free, how Subhi copes with confinement, and how Jimmie experiences freedom. Paragraph 1 is the fence.",
  choose:["how Subhi deals with being confined","how Jimmie is free, but confined in other ways"],
  model:[
   ["T",[["p","Fraillon uses the fence to "],["verb","show"],["p"," that "],["idea","being locked in also means being cut off from knowing what is outside"],["p","."]],T_BAR],
   ["E",[["p","Subhi admits that "],["ev","“none of us knows what it is like just on the other side of the fences” (ch. 14)"],["p",", which "],["verb","shows"],["p"," that "],["idea","the fence keeps out information as well as people"],["p","."]],E_BAR],
   ["E",[["p","Jimmie is the one who brings the outside in: "],["ev","“But Jimmie does” (ch. 14)"],["p"," is all Subhi needs to say, which "],["verb","shows"],["p"," that "],["idea","a friend from the other side is his only window on the world"],["p","."]],E_BAR],
   ["L",[["p","By putting the two of them on opposite sides of the same fence, Fraillon "],["verb","suggests"],["p"," that "],["idea","freedom is not only where your body can go"],["p",", but "],["eff","what you are allowed to know"],["p","."]],L_BAR]],
  stems:[["Subhi copes with the fence by …","Even though Jimmie can leave, …"],
         ["At night, “the dirt outside turns into a beautiful ocean” (ch. 1), which shows …","Jimmie’s house is quiet because …"],
         ["The Jackets …","Jimmie carries …"],
         ["So for Subhi, freedom is …","Jimmie shows that being free is not the same as …"]] },

{ n:3, title:"Motif and storytelling",
  prompt:[["How does Fraillon explore the idea that "],["hl","stories"],[" are a form of "],["hl","survival"],[" in The Bone Sparrow?"]],
  intro:"In The Bone Sparrow, Zana Fraillon presents storytelling as the thing that keeps people going when nothing around them changes. Through the stories Maá tells, the book Jimmie carries and the stories Subhi tells himself, Fraillon shows that a story can do what food and shelter cannot: it can make a person feel brave, remembered and less alone. Fraillon suggests that for people who have been locked away, a story is not an escape from survival but a part of it.",
  claims:"The introduction names three kinds of story: Maá’s, Jimmie’s book, and Subhi’s own. Paragraph 1 is Maá’s stories and Jimmie’s book.",
  choose:["the stories Subhi tells himself","what happens when the stories stop"],
  model:[
   ["T",[["idea","Stories are how the characters in the centre keep going when nothing else changes"],["p","."]],T_BAR],
   ["E",[["p","Maá’s “Listen Now” stories are the thing Subhi remembers as "],["ev","“perfect. Each one” (ch. 5)"],["p",", which "],["verb","shows"],["p"," that "],["idea","a story can hold a family together in a place that gives them nothing"],["p","."]],E_BAR],
   ["E",[["p","When Jimmie brings her mother’s book, Subhi feels "],["ev","“a sort of brave that I haven’t felt since Eli got taken” (ch. 10)"],["p"," before he has read a word, which "],["verb","shows"],["p"," that "],["idea","a story changes how a person feels just by being there"],["p","."]],E_BAR],
   ["L",[["p","Through these stories, Fraillon "],["verb","suggests"],["p"," that "],["idea","surviving the centre is about more than food and safety"],["p",": it is about "],["eff","having something to hold on to"],["p","."]],L_BAR]],
  stems:[["Subhi also tells stories to …","Fraillon shows what the stories are for by taking them away: …"],
         ["Subhi imagines …","By the end, Subhi feels that “even my stories are gone” (ch. 32), which shows …"],
         ["Eli’s whale …","Without the stories, the centre …"],
         ["So stories are …","When the stories stop, …"]] }
];
const runs=spec=>spec.map(x=>x[0]==="hl"?hl("idea",x[1]):R(x[0]));

function task(t){
  return [
    /* sheet one, front: prompt, introduction, paragraph 2 */
    new Paragraph({spacing:{after:120},pageBreakBefore:true,children:[
      new TextRun({text:"The Bone Sparrow — folio task "+t.n,bold:true,size:30,color:DEEP,font:"Georgia"}),
      new TextRun({text:"\tName  ",size:18,color:MUTED,font:"Calibri"}),
      new TextRun({text:"______________________",size:18,color:LINE,font:"Calibri"})],
      tabStops:[{type:"right",position:W}]}),
    box([P(runs(t.prompt),{after:0})]),
    H("Introduction"),
    box([P([R(t.intro,{size:21})],{after:0,line:290})],"F6F1E6"),
    note(t.claims),
    P([R("I will write about:  ",{bold:true}),R("☐ "+t.choose[0]+"     ☐ "+t.choose[1])],{after:60}),
    H("Paragraph 2"),
    frame([["T",2,T_BAR,[t.stems[0][0]]],["E",4,E_BAR,[t.stems[1][0]]],["E",4,E_BAR,[t.stems[2][0]]],["L",3,L_BAR,[t.stems[3][0]]]]),
    br(),
    /* sheet one, back: paragraph 3 and the self check */
    H("Paragraph 3"),
    note("If you get there."),
    lines(9),
    H("How did it go?"),
    selfTable(),
    new Paragraph({spacing:{after:120},children:[R("")]}),
    openBox("One thing I will do better next time",800),
    new Paragraph({spacing:{after:120},children:[R("")]}),
    openBox("Teacher feedback",1300),
    br(),
    /* sheet two: the model, blank behind it */
    H("Paragraph 1"),
    key(),
    worked(t.model),
    br(),
    new Paragraph({children:[R("")]})
  ];
}

/* ---------------------------------------------------- rubric (landscape) */
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
  const sm=(t,o={})=>KP([KT(t,{size:17,...o})],{after:0});
  return [
    KP([KT("Assessment rubric",{bold:true,size:28})],{after:60}),
    KP([KT("Mark each row at the level the writing shows. The grade is the average across the rows.",{size:18,color:"595959"})],{after:120}),
    new Table({columnWidths:[CW,...Array(6).fill(BW)],width:{size:LW,type:WidthType.DXA},
      borders:{top:KRULE,bottom:KRULE,left:KRULE,right:KRULE,insideH:KRULE,insideV:KRULE},
      rows:[
        new TableRow({tableHeader:true,children:[kcell([sm("")],CW,{shading:{type:ShadingType.CLEAR,fill:"D9D9D9",color:"auto"}}),
          ...BANDS.map((b,i)=>kcell([sm(b,{bold:true,italics:i===0})],BW,{shading:{type:ShadingType.CLEAR,fill:i===3?"E7E6E6":"D9D9D9",color:"auto"}}))]}),
        ...ROWS.map(r=>new TableRow({children:[
          kcell([sm(r[1],{bold:true,size:18})],CW,{shading:{type:ShadingType.CLEAR,fill:r[0],color:"auto"}}),
          ...r.slice(2).map((d,i)=>kcell([sm(d,{italics:i===0})],BW,{shading:{type:ShadingType.CLEAR,fill:i===3?"F7F7F7":"FFFFFF",color:"auto"}}))]}))]})
  ];
}

/* ---------------------------------------------------- build */
const portrait={page:{size:{width:PW,height:PH},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}};
const landscape={page:{size:{width:PW,height:PH,orientation:"landscape"},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}};
const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:22,color:INK}}}},
  sections:[
    {properties:portrait,children:[...FRONT,br(),...COVER,...TASKS.flatMap(task)]},
    {properties:landscape,children:rubric()}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);console.log('written '+OUT);});
